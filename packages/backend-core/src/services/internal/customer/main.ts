import { BackendCoreError } from '@/error/main';
import { BackendService } from '@/services/internal/main';
import {
  Customer,
  CustomerPointHistorySourceKind,
  Transaction,
  TransactionKind,
  TransactionPaymentMethod,
} from '@prisma/client';
import { Barcode, customDayjs } from 'common';

/**
 * 顧客コアサービス
 */
export class BackendCoreCustomerService extends BackendService {
  constructor(customerId?: Customer['id']) {
    super();
    this.setIds({
      customerId,
    });
  }

  declare targetObject?: Customer;

  //指定された顧客が存在するか確認しつつ、リソース情報を格納する
  //ここでは論理削除は許さない、許されない
  public get existingObj() {
    return (async () => {
      //すでにobjがある場合それを返す
      if (this.targetObject) return this.targetObject;

      //それもなかったら取得
      const customerInfo = await this.db.customer.findUnique({
        where: {
          id: this.ids.customerId,
          store_id: this.ids.storeId, //storeIdもあったらそれも条件に入れる
        },
      });

      if (!customerInfo)
        throw new BackendCoreError({
          internalMessage: '顧客が見つかりません',
          externalMessage: '顧客が見つかりません',
        });

      this.targetObject = customerInfo;

      return this.targetObject;
    })();
  }

  /**
   * ポイントを変動させる
   */
  @BackendService.WithIds(['customerId', 'storeId'])
  public changePoint = async ({
    changeAmount, //変動させる量 マイナスもあり
    sourceKind,
    sourceId,
  }: {
    changeAmount: number;
    sourceKind: CustomerPointHistorySourceKind;
    sourceId?: Transaction['id'];
  }) => {
    //ポイントを変動させる

    const staff_account_id = this.resources.actionAccount?.id;

    const customerInfo = await this.existingObj;

    return await this.safeTransaction(async (tx) => {
      const changeResult = await tx.customer.update({
        where: {
          id: customerInfo.id,
        },
        data: {
          owned_point: {
            increment: changeAmount,
          },
        },
      });

      if (changeResult.owned_point < 0)
        throw new BackendCoreError({
          internalMessage: 'ポイントが不足しています',
          externalMessage: 'ポイントが不足しています',
        });

      //ターゲットオブジェクトを更新する
      this.targetObject = changeResult;

      const pointHistory = await tx.customer_Point_History.create({
        data: {
          customer_id: customerInfo.id,
          source_kind: sourceKind,
          source_id: sourceId,
          change_price: changeAmount,
          staff_account_id,
          result_point_amount: changeResult.owned_point,
        },
      });

      return {
        customer: changeResult,
        pointHistory,
      };
    });
  };

  //特定の値段でポイントの付与量を計算する
  //付与できる量と、付与した後何ポイントになるのか計算する
  //実際にポイントを付与することもできる
  @BackendService.WithIds(['storeId'])
  @BackendService.WithResources(['store'])
  public addPointInTransaction = async ({
    totalPrice,
    dryRun = false,
    paymentMethod,
    transactionKind,
    transactionId,
  }: {
    totalPrice: number;
    dryRun?: boolean;
    paymentMethod?: TransactionPaymentMethod | null;
    transactionKind: TransactionKind;
    transactionId?: Transaction['id'];
  }) => {
    //価格を入力

    //ここでストアの設定などを読み込んだりする
    let pointSum = 0;

    if (this.resources.store!.point_enabled) {
      if (
        transactionKind == TransactionKind.sell &&
        this.resources.store!.sell_point_enabled
      ) {
        //支払い方法が対象のものか確認
        if (
          paymentMethod &&
          this.resources.store!.sell_point_payment_method.includes(
            paymentMethod,
          )
        ) {
          pointSum = this.resources.store!.sell_point_per
            ? Math.floor(totalPrice / this.resources.store!.sell_point_per)
            : 0;
        }
      } else if (
        transactionKind == TransactionKind.buy &&
        this.resources.store!.buy_point_enabled
      ) {
        //支払い方法が対象のものか確認

        if (
          paymentMethod &&
          this.resources.store!.buy_point_payment_method.includes(paymentMethod)
        ) {
          //買取ポイントの付与
          pointSum = this.resources.store!.buy_point_per
            ? Math.floor(totalPrice / this.resources.store!.buy_point_per)
            : 0;
        }
      }
    }

    const customerInfo = await this.existingObj;

    //付与した後何ポイントになるか計算
    const totalPointAmount = customerInfo.owned_point + pointSum;

    //このポイントを顧客に付与してみる
    if (pointSum && !dryRun) {
      await this.changePoint({
        changeAmount: pointSum,
        sourceKind: CustomerPointHistorySourceKind.TRANSACTION_GET,
        sourceId: transactionId,
      });
    }

    return {
      pointAmount: pointSum,
      totalPointAmount,
    };
  };

  /**
   * ポイントを消費する
   */
  public usePointInTransaction = async ({
    amount,
    transactionId,
  }: {
    amount: number;
    transactionId: Transaction['id'];
  }) => {
    //ここでポイント利用上限などを確認していく
    const { pointHistory } = await this.changePoint({
      changeAmount: -1 * amount,
      sourceKind: CustomerPointHistorySourceKind.TRANSACTION_USE,
      sourceId: transactionId,
    });

    return {
      pointHistory,
    };
  };

  /**
   * 住所文字列を作成
   */
  public get fullAddress() {
    return (async () => {
      const customerInfo = await this.existingObj;
      return `${customerInfo.zip_code || ''} ${customerInfo.prefecture || ''} ${
        customerInfo.city || ''
      } ${customerInfo.address2 || ''} ${customerInfo.building || ''}`;
    })();
  }

  /**
   * 年齢取得
   */
  public get age() {
    return (async () => {
      const customerInfo = await this.existingObj;
      return customDayjs().diff(customerInfo.birthday, 'year') || 0;
    })();
  }

  /**
   * バーコードを作成
   */
  public get barcode() {
    return (async () => {
      return Barcode.generateCustomerBarcode(this.ids.customerId!);
    })();
  }
}
