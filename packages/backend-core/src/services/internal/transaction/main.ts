import { BackendCoreError } from '@/error/main';
import { BackendService } from '@/services/internal/main';
import {
  Customer,
  CustomerPointHistorySourceKind,
  Item,
  Item_Category_Condition_Option,
  Item_Genre,
  LossStatus,
  Payment,
  Prisma,
  Product,
  ProductStockHistorySourceKind,
  Reservation_Reception_Product,
  ReservationReceptionProductStatus,
  Set_Deal,
  SummaryTransactionKind,
  Transaction,
  Transaction_Cart,
  TransactionKind,
  TransactionStatus,
  TransactionTaxKind,
  WholesalePriceHistoryResourceType,
} from '@prisma/client';
import { customDayjs } from 'common';
import { formatDate, posCommonConstants, sleep } from 'common';
import {
  BackendCoreProductService,
  WholesalePriceRecord,
} from '@/services/internal/product/main';
import { BackendCoreCustomerService } from '@/services/internal/customer/main';
import { BackendCoreSaleService } from '@/services/internal/sale/main';
import { BackendCoreSetDealService } from '@/services/internal/setDeal/main';
import { TaskManager } from '@/task/main';
import puppeteer from 'puppeteer';
import { BackendImageUtil } from '@/utils/image';
import { S3CustomClient } from '@/services/external';
import { htmlEncode } from 'js-htmlencode';
import { BackendPdfUtil } from '@/utils/pdf';

const { displayNameDict } = posCommonConstants;

/**
 * 取引コアサービス
 */
export class BackendCoreTransactionService extends BackendService {
  constructor(transactionId?: Transaction['id']) {
    super();
    this.setIds({
      transactionId,
    });
  }

  public targetObject:
    | (Transaction & {
        customer?: Customer | null;
        transaction_carts?: (Transaction_Cart & {
          product: Product & {
            condition_option: Item_Category_Condition_Option | null;
            item: Item;
          };
        })[];
        payment?: Payment | null;
      })
    | null = null;

  public get existingObj(): Promise<NonNullable<typeof this.targetObject>> {
    if (this.targetObject) return Promise.resolve(this.targetObject);

    if (!this.ids.transactionId)
      throw new BackendCoreError({
        internalMessage: '取引IDが指定されていません',
      });

    return (async () => {
      const obj = await this.primaryDb.transaction.findUnique({
        where: { store_id: this.ids.storeId, id: this.ids.transactionId },
        include: {
          customer: true,
          transaction_carts: {
            include: {
              product: {
                include: {
                  specialty: true,
                  condition_option: true,
                  item: true,
                  consignment_client: {
                    select: {
                      display_name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!obj)
        throw new BackendCoreError({
          internalMessage: '取引が見つかりません',
        });

      this.targetObject = obj;

      return this.targetObject;
    })();
  }

  //日本語表現にする関数
  public toJa(obj: Partial<Transaction>) {
    const newObj = structuredClone(obj); //値わたし

    for (const prop in newObj) {
      if (prop == 'is_return') {
        // is_return または return_transactions に値がある場合は true とする
        const hasReturnTransactions =
          Array.isArray((newObj as any).return_transactions) &&
          (newObj as any).return_transactions.length > 0;

        newObj[prop] = newObj[prop] || hasReturnTransactions ? true : false;
      }

      if (prop == 'point_discount_price') {
        newObj[prop] = Math.abs(newObj[prop] || 0);
      }

      if (prop in displayNameDict.transaction) {
        const dict =
          displayNameDict.transaction[
            prop as keyof typeof displayNameDict.transaction
          ];

        if ('enum' in dict) {
          newObj[prop] = dict.enum[newObj[prop]];
        }
      }

      if (prop == 'finished_at') {
        const dayjsObj = customDayjs(newObj[prop]).tz();
        //@ts-expect-error becuase of because of
        newObj[prop] = formatDate(dayjsObj);
      }
    }

    return newObj;
  }

  /**
   * 指定されたカートからセット販売が適用できるか確認する
   */
  public async getTotalSetDealDiscountPrice(
    carts: TransactionService.CartInput,
    setDeals: Array<{
      set_deal_id: Set_Deal['id'];
      apply_count: number;
      total_discount_price: number;
    }>,
  ) {
    const setDealService = new BackendCoreSetDealService();
    this.give(setDealService);

    const findRes = await setDealService.findFromCarts(carts);

    const { availableSetDeals = [] } = findRes;

    setDealService.validateSetDeals(availableSetDeals, setDeals);

    //合計セット割引を取得
    const set_deal_discount_price = setDeals.reduce(
      (curSum, e) => curSum + e.total_discount_price,
      0,
    );

    return set_deal_discount_price;
  }

  //買取受付番号を発行する
  @BackendService.WithIds(['storeId'])
  public issueReceptionNumber = async () => {
    const db = this.db;

    const receptionNumMax: Array<{
      candidate: number;
    }> = await db.$queryRaw`
    WITH RECURSIVE numbers AS (
      SELECT 1 AS n
      UNION ALL
      SELECT n + 1 FROM numbers WHERE n < 9999
    )
    SELECT n AS candidate
    FROM numbers
    WHERE NOT EXISTS (
      SELECT 1
      FROM Transaction t
      WHERE t.store_id = ${this.ids.storeId} -- ← store_idをバインドするか埋める
      AND t.reception_number = n
      AND t.finished_at >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
      AND (
        t.status = ${TransactionStatus.draft}
        OR DATE(t.finished_at) = CURRENT_DATE
      )
    )
    ORDER BY n
    LIMIT 1;
    `;

    if (!receptionNumMax.length)
      throw new BackendCoreError({
        internalMessage: '買取受付番号が発行できませんでした',
      });

    return receptionNumMax[0].candidate || 1;
  };

  //取引の分析情報を取得
  public getTransactionStats = async (ids: Array<Transaction['id']>) => {
    type groupByItemGenreTransactionKindType = {
      transaction_kind: Transaction['transaction_kind'];
      genre_display_name: Item_Genre['display_name'];
    };

    const statsData = ids.length
      ? await this.db.$queryRaw<Array<groupByItemGenreTransactionKindType>>`
    SELECT
      Transaction.transaction_kind AS 'transaction_kind',
      Item_Genre.display_name AS 'genre_display_name'
    FROM
      Transaction
    INNER JOIN Transaction_Cart ON Transaction.id = Transaction_Cart.transaction_id
    INNER JOIN Product ON Transaction_Cart.product_id = Product.id
    INNER JOIN Item ON Product.item_id = Item.id
    INNER JOIN Item_Genre ON Item.genre_id = Item_Genre.id

    WHERE Transaction.id IN (${Prisma.join(ids)})
    AND Transaction.is_return = 0

    GROUP BY Transaction.id, Item_Genre.id
    `
      : [];

    const groupByItemGenreTransactionKind: Array<
      groupByItemGenreTransactionKindType & {
        total_count: number;
      }
    > = [];

    statsData.forEach((record) => {
      //同じものがないか確認
      const currentRecord = groupByItemGenreTransactionKind.find(
        (e) =>
          e.genre_display_name == record.genre_display_name &&
          e.transaction_kind == record.transaction_kind,
      );

      if (currentRecord) {
        currentRecord.total_count++;
      } else {
        groupByItemGenreTransactionKind.push({
          ...record,
          total_count: 1,
        });
      }
    });

    return {
      groupByItemGenreTransactionKind,
      numberOfVisits: ids.length, //IDの数＝来店回数
    };
  };

  //特定の取引の支払いを待つ関数
  //Transactionのstatusを監視し、completeになったら返す 5分経ってもならなかったら、その旨を返す
  //
  @BackendService.WithIds(['storeId', 'transactionId'])
  public waitForPayment = async () => {
    const maximumTryCount = 600;

    //一秒に一回確認する それを300回行う
    let tryCount = 0;
    let transactionInfo: {
      status: Transaction['status'];
    } | null = await this.primaryDb.transaction.findUnique({
      //データ整合性のためprimaryで必ず処理をする
      where: {
        id: this.ids.transactionId,
        status: {
          in: [TransactionStatus.paying, TransactionStatus.draft],
        },
      },
      select: {
        status: true,
      },
    });

    if (!transactionInfo)
      throw new BackendCoreError({
        internalMessage: '取引が見つかりません',
      });

    //ステータスがdraftになっていて、試行回数が300回に達していない間
    while (
      (transactionInfo?.status == TransactionStatus.paying ||
        transactionInfo?.status == TransactionStatus.draft) &&
      tryCount < maximumTryCount
    ) {
      await sleep(500);
      console.log('支払いが完了するのを待っています------------\n');
      tryCount++;

      transactionInfo = await this.primaryDb.transaction.findUnique({
        where: {
          id: this.ids.transactionId,
        },
        select: {
          status: true,
        },
      });
    }

    if (transactionInfo?.status == TransactionStatus.completed) {
      //普通に完了した時
      return true;
    } else if (transactionInfo?.status == TransactionStatus.canceled) {
      //キャンセルされた時
      throw new BackendCoreError({
        internalMessage: '支払いがキャンセルされました',
      });
    } else if (tryCount >= maximumTryCount) {
      //タイムアウトした時
      throw new BackendCoreError({
        internalMessage: '支払いがタイムアウトしました',
      });
    } else {
      throw new BackendCoreError({
        internalMessage: '不明エラー',
      });
    }
  };

  /**
   * 返品する 返金はしない
   * paying状態かcompleted状態だったら行える
   * 返品取引の作成はここでは行わない
   *
   * - 在庫の調整
   * - ポイントの返還
   * などを行う
   * targetObjectはあくまでも元取引
   */
  @BackendService.WithIds(['transactionId'])
  @BackendService.WithTx
  public return = async ({
    reservationReceptionProductIdForCancel,
  }: {
    reservationReceptionProductIdForCancel?: Reservation_Reception_Product['id'];
  }) => {
    const transactionInfo = await this.existingObj!;

    if (
      transactionInfo &&
      transactionInfo.status != TransactionStatus.paying &&
      transactionInfo.status != TransactionStatus.completed
    )
      throw new BackendCoreError({
        internalMessage: '返品できるのはpayingかcompletedの取引のみです',
      });

    //返品取引を指定してたらエラー
    if (transactionInfo.is_return)
      throw new BackendCoreError({
        internalMessage: '返品取引を指定してはいけません',
      });

    //予約受付の取り消しだったら、予約受付の取り消し処理を行うだけ [TODO] reservationサービスにやらせたい
    if (reservationReceptionProductIdForCancel) {
      const updateRes = await this.db.reservation_Reception_Product.update({
        where: {
          id: reservationReceptionProductIdForCancel,
          deposit_transaction_cart: {
            some: {
              transaction_id: transactionInfo.id,
            },
          },
        },
        data: {
          status: ReservationReceptionProductStatus.CANCELLED,
        },
      });
      //在庫数のロールバックはないため、早期リターン
      console.log(`予約受付の取り消しを行いました`, updateRes);
      return;
    }

    //それぞれロールバックする
    await Promise.all([this.rollbackProducts(), this.rollbackPoints()]);
  };

  /**
   * 在庫変動処理
   */
  @BackendService.WithTx
  @BackendService.WithIds(['transactionId'])
  @BackendService.WithResources(['store'])
  public async consumeProducts({
    allProductInfo,
  }: {
    allProductInfo: Array<{
      id: Product['id'];
      sell_price: Product['sell_price'];
      specific_sell_price: Product['specific_sell_price'];
      buy_price: Product['buy_price'];
      specific_buy_price: Product['specific_buy_price'];
    }>;
  }) {
    const transactionInfo = await this.existingObj!;
    if (!transactionInfo.transaction_carts)
      throw new BackendCoreError({
        internalMessage: '取引情報の形式が正しくありません',
      });

    //ここで該当商品の在庫数を調整する
    //決済を行った後に在庫数が足りないことが発覚したら問題なので、先に在庫調整をして問題なさそうだったら決済を行う
    for (const {
      product_id,
      item_count,
      sale_id,
      total_unit_price,
      total_sale_unit_price,
      id,
      reservation_reception_product_id_for_deposit,
      reservation_reception_product_id_for_receive,
    } of transactionInfo.transaction_carts) {
      //受付IDがある場合、完了にする
      if (reservation_reception_product_id_for_deposit) {
        await this.db.reservation_Reception_Product.update({
          where: {
            id: reservation_reception_product_id_for_deposit,
            status: ReservationReceptionProductStatus.CREATED,
            customer_id: transactionInfo.customer_id!,
          },
          data: {
            status: ReservationReceptionProductStatus.DEPOSITED,
          },
        });
        console.log(
          `予約受付を完了させました`,
          reservation_reception_product_id_for_deposit,
        );
        continue;
      }

      //受け取りIDがある場合、受け取り済みにする
      if (reservation_reception_product_id_for_receive) {
        const updateRes = await this.db.reservation_Reception_Product.update({
          where: {
            id: reservation_reception_product_id_for_receive,
            status: ReservationReceptionProductStatus.DEPOSITED,
            customer_id: transactionInfo.customer_id!,
          },
          data: {
            status: ReservationReceptionProductStatus.RECEIVED,
          },
        });
        console.log(
          `予約受け取りを完了させました`,
          reservation_reception_product_id_for_receive,
        );

        //ステータスを更新するためにタスクpush
        const taskManager = new TaskManager({
          targetWorker: 'scheduled',
          kind: 'updateReservationStatus',
        });

        await taskManager.publish({
          body: [
            {
              store_id: this.ids.storeId,
              reservation_id: updateRes.reservation_id,
            },
          ],
          service: this,
          fromSystem: true,
        });
      }

      //在庫調整を行う
      const thisProduct = new BackendCoreProductService(product_id);
      this.give(thisProduct);

      const thisProductInfo = allProductInfo.find((e) => e.id == product_id);

      if (!thisProductInfo)
        throw new BackendCoreError({
          internalMessage: '商品情報が取得できませんでした',
          externalMessage: `商品情報が取得できませんでした`,
        });

      const thisUnitPrice = total_sale_unit_price;

      //在庫変動
      if (transactionInfo.transaction_kind == TransactionKind.buy) {
        const thisWholesalePriceRecord: WholesalePriceRecord = {
          product_id,
          unit_price: thisUnitPrice!,
          item_count,
        };

        const changeResult = await thisProduct.increaseStock({
          source_kind: ProductStockHistorySourceKind.transaction_buy,
          source_id: transactionInfo.id,
          increaseCount: item_count,
          wholesaleRecords: [thisWholesalePriceRecord],
          description: `買取取引${transactionInfo.id} において在庫${product_id} の数量が${item_count} 増加しました`,
        });

        console.log(changeResult);
      } else {
        const changeResult = await thisProduct.decreaseStock({
          source_kind: ProductStockHistorySourceKind.transaction_sell,
          source_id: transactionInfo.id,
          decreaseCount: item_count,
          unit_price: thisUnitPrice!,
          description: `販売取引${transactionInfo.id} において在庫${product_id} の数量が${item_count} 減少しました`,
        });

        console.log(changeResult);

        //仕入れ額を取得する
        const wholesale_total_price =
          changeResult.recordInfo?.totalWholesalePrice ?? 0;

        console.log(`仕入れ額は${wholesale_total_price}`);

        //仕入れ額を更新する
        await this.db.transaction_Cart.update({
          where: {
            id,
          },
          data: {
            wholesale_total_price,
          },
        });
      }

      //この商品に対してセールが指定されているか確認
      if (sale_id) {
        //一度、実際にこのセールの商品として履歴に残してみる
        await this.db.sale_Product_History.upsert({
          where: {
            sale_id_product_id: {
              sale_id,
              product_id,
            },
          },
          update: {
            total_item_count: {
              increment: item_count,
            },
          },
          create: {
            sale_id,
            product_id,
            total_item_count: item_count,
          },
        });

        //この商品に適用できるセールか確認
        //セールに対象か確認
        const saleModel = new BackendCoreSaleService();
        this.give(saleModel);

        const checkRes = await saleModel.checkIfAttachableSale({
          transaction_kind: transactionInfo.transaction_kind,
          saleInfo: {
            id: sale_id,
          },
          productInfo: {
            id: product_id,
          },
          asPostCheck: true,
        });

        if (!checkRes)
          throw new BackendCoreError({
            internalMessage: `指定されたセールを適用することはできません`,
            externalMessage: `指定されたセールを適用することはできません`,
          });

        //大丈夫だったらそのまま続行し、セール履歴をコミットする
        console.log(`セールを適用します`, checkRes.sale?.id);
      }
    }
  }

  /**
   * 在庫数などをロールバックする
   */
  @BackendService.WithIds(['transactionId'])
  @BackendService.WithTx
  private rollbackProducts = async () => {
    const transactionInfo = await this.existingObj;

    if (!transactionInfo?.transaction_carts)
      throw new BackendCoreError({
        internalMessage: '取引が見つかりません',
      });

    for (const newCart of transactionInfo.transaction_carts) {
      const adjustCount: number = newCart.item_count;

      //adjustCountが0だったら調整の必要がないため飛ばす
      if (!adjustCount) continue;

      //在庫調整を行う
      const thisProduct = new BackendCoreProductService(newCart.product_id);

      this.give(thisProduct);

      //買取の返品の場合、減らす
      if (transactionInfo.transaction_kind == TransactionKind.buy) {
        const changeResult = await thisProduct.decreaseStock({
          source_kind: ProductStockHistorySourceKind.transaction_buy_return,
          source_id: transactionInfo.id, //前の取引IDを指定することで、返品の仕入れ値レコードを使えるようにする取得する
          decreaseCount: adjustCount,
          description: `買取取引返品 ${transactionInfo.id} において在庫${newCart.product_id} の数量が${adjustCount} 減少しました`,
        });

        console.log(changeResult);

        //販売の場合、増やす
        //自動的に取引のレコードが使われるためwholesaleRecordsを使わなくて大丈夫
      } else {
        const changeResult = await thisProduct.increaseStock({
          source_kind: ProductStockHistorySourceKind.transaction_sell_return,
          source_id: transactionInfo.id,
          increaseCount: adjustCount,
          description: `販売取引返品 ${transactionInfo.id} において在庫${newCart.product_id} の数量が${adjustCount} 増加しました`,
        });

        console.log(changeResult);
      }
    }
  };

  /**
   * ポイントなどをロールバックする
   */
  @BackendService.WithIds(['transactionId'])
  @BackendService.WithTx
  private rollbackPoints = async () => {
    const transactionInfo = await this.existingObj!;

    if (transactionInfo?.customer_id) {
      const customerService = new BackendCoreCustomerService(
        transactionInfo.customer_id,
      );
      this.give(customerService);

      //ポイントが付与されていた場合、元に戻す
      if (transactionInfo?.point_amount) {
        await customerService.changePoint({
          changeAmount: -1 * transactionInfo.point_amount,
          sourceKind: CustomerPointHistorySourceKind.TRANSACTION_GET_RETURN,
          sourceId: transactionInfo.id,
        });
      }

      //ポイントを使っていた場合、元に戻す
      if (transactionInfo?.point_discount_price) {
        await customerService.changePoint({
          changeAmount: -1 * transactionInfo.point_discount_price,
          sourceKind: CustomerPointHistorySourceKind.TRANSACTION_USE_RETURN,
          sourceId: transactionInfo.id,
        });
      }
    }
  };

  /**
   * 大口在庫出庫機能
   */
  @BackendService.WithIds(['transactionId'])
  @BackendService.WithResources(['store'])
  public async generateInvoice() {
    const transactionInfo = await this.existingObj!;

    const e = htmlEncode;
    const s = this.resources.store!;

    //お会計済みじゃないといけない
    if (transactionInfo.status !== TransactionStatus.completed)
      throw new BackendCoreError({
        internalMessage: `この取引はお会計済みではありません`,
        externalMessage: `この取引はお会計済みではありません`,
      });

    //[TODO] 税問題

    const subtotal = transactionInfo.transaction_carts!.reduce(
      (acc, item) => acc + item.total_unit_price! * item.item_count,
      0,
    );
    const taxAmount = Math.floor(subtotal * 0.1);
    const totalAmount = subtotal + taxAmount;

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif; 
      margin: 40px; 
      font-size: 12px;
    }
    
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      margin-bottom: 30px;
    }
    .sub-header {
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      margin-bottom: 20px;
      position: relative;
    }
    .underline {
      border-bottom: 1.5px solid #000;
      width: 100%;
      margin-bottom: 30px;
      /* 下線の色・パディングを維持 */
    }
    .sub-header-left {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      flex: 1 1 auto;
      font-size: 12px;
      min-width: 0;
    }
    .sub-header-right {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-end;
      flex: 0 0 auto;
      min-width: 0;
    }
    .invoice-summary-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 0px;
    }
    .invoice-total-amount-table th {
      width: 120px;
    }
    .invoice-total-amount-table td {
      width: 120px;
      text-align: right;
    }
    .invoice-summary-description {
      margin-bottom: 10px;
    }
    .invoice-company-info {
      font-size: 12px;
      margin-bottom: 0;
      width: 290px;
    }
    .invoice-info-table {
      border-collapse: collapse;
      font-size: 12px;
      margin-left: 0;
      margin-bottom: 0;
    }
    .invoice-info-table th {
      border: 1px solid #000;
      padding: 6px 12px;
      background: #f0f0f0;
      font-weight: bold;
      text-align: left;
      min-width: 120px;
      font-size: 12px;
    }
    .invoice-info-table td {
      border: 1px solid #000;
      padding: 6px 12px;
      background: #fff;
      min-width: 120px;
      text-align: right;
      font-size: 12px;
    }

    .total-amount-table {
      border-collapse: collapse;
      font-size: 16px;
      margin: 0 auto 30px auto;
      width: 50%;
      font-weight: bold;
    }
    .total-amount-table th, .total-amount-table td {
      border: 1px solid #000;
      padding: 12px 20px;
      text-align: center;
      background: #fff;
      font-size: 16px;
    }
    .total-amount-table th {
      background: #f0f0f0;
      font-weight: bold;
      text-align: center;
      min-width: 120px;
      font-size: 16px;
    }
    .total-amount-table td {
      text-align: right;
      font-size: 20px;
      color: #d32f2f;
      font-weight: bold;
      min-width: 180px;
    }
    
    .title { 
      font-size: 20px; 
      font-weight: bold; 
      margin: 20px auto 20px auto;
      text-align: center;
      display: block;
      width: fit-content;
    }
    .customer-info {
      font-size: 12px;
      margin-bottom: 20px;
    }
    
    .invoice-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }
    
    .left-section, .right-section {
      width: 48%;
    }
    
    .company-info {
      text-align: right;
      font-size: 12px;
      line-height: 1.6;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 20px;
      font-size: 12px;
    }
    
    th, td {
      border: 1px solid #000;
      padding: 8px;
      text-align: center;
      font-size: 12px;
    }
    
    th {
      background-color: #f0f0f0;
      font-weight: bold;
      font-size: 12px;
    }
    
    .item-name {
      text-align: left !important;
      width: 48%;
      font-size: 12px;
    }
    
    .summary-table {
      width: 50%;
      margin-left: auto;
      font-size: 12px;
    }
    
    .bank-info {
      margin-top: 30px;
      font-size: 12px;
    }
    
    .remarks {
      margin-top: 20px;
      font-size: 12px;
      line-height: 1.6;
      padding: 15px;
      border: 1px solid #000;
    }
  </style>
</head>
<body>
  <div class="header">
      <div class="title">御請求書</div>
  </div>
  <div class="sub-header">
    <div class="sub-header-left">
      ${`<div class="customer-info" style="margin-bottom: 0;">
        　　　　　　 御中
      </div>`}
    </div>
    <div class="sub-header-right" style="justify-content: flex-start; align-items: flex-end;">
      <table class="invoice-info-table">
        <tr>
          <th>請求書番号</th>
          <td></td>
        </tr>
        <tr>
          <th>発行日</th>
          <td>${customDayjs(transactionInfo.created_at).format(
            'YYYY/MM/DD',
          )}</td>
        </tr>
        <tr>
          <th>お支払期限</th>
          <td></td>
        </tr>
      </table>
    </div>
  </div>
  
  <div class="invoice-summary-section">
    <div class="invoice-summary-header">
      <div class="invoice-summary-description">
        トレーディングカード代として
      </div>
      <table class="invoice-total-amount-table">
        <tr>
          <th>合計金額</th>
          <td>¥${e(totalAmount.toLocaleString())}</td>
        </tr>
      </table>
    </div>
    <div class="invoice-details">
      <div class="invoice-company-info">
        <p style="margin: 0; padding: 0; margin-bottom: 10px; line-height: 1.6; font-size: 1.2em; font-weight: bold;">${
          s.display_name
        }</p>
        <p style="margin: 0; padding: 0; line-height: 1.2;">〒${e(
          s.zip_code || '',
        )}</p>
        <p style="margin: 0; padding: 0; line-height: 1.2;">${e(
          s.full_address || '',
        )}</p>
        <p style="margin: 0; padding: 0; line-height: 1.2; margin-bottom: 10px;">${`建物`}</p>
        <p style="margin: 0; padding: 0; line-height: 1.6; margin-bottom: 10px;">${e(
          s.phone_number || '',
        )}</p>
        <p style="margin: 0; padding: 0; line-height: 1.6;">登録番号 ${e(
          s.invoice_number || '',
        )}</p>
      </div>
    </div>
  </div>
  <div class="underline"></div>
  
  <table>
    <tr>
      <th class="item-name">項目</th>
      <th style="width: 7%; padding: 0 8px; margin: 0; text-align: right;">数量</th>
      <th style="width: 15%; padding: 0 8px; margin: 0; text-align: right;">単価</th>
      <th style="width: 15%; padding: 0 8px; margin: 0; text-align: right;">消費税</th>
      <th style="width: 15%; padding: 0 8px; margin: 0; text-align: right;">金額</th>
    </tr>
    ${transactionInfo
      .transaction_carts!.map(
        (item) => `
    <tr style="height: 20px; padding: 0; margin: 0;">
      <td class="item-name" style="padding: 2px 10px; margin: 0;">${e(
        item.product.display_name,
      )}</td>
      <td style="padding: 2px 8px; margin: 0; text-align: right;">${e(
        item.item_count.toString(),
      )}</td>
      <td style="padding: 2px 8px; margin: 0; text-align: right;">${e(
        item.total_unit_price!.toLocaleString(),
      )}</td>
      <td style="padding: 2px 8px; margin: 0; text-align: right;">${e(
        '10%',
      )}</td>
      <td style="padding: 2px 8px; margin: 0; text-align: right;">${e(
        (item.total_unit_price! * item.item_count).toLocaleString(),
      )}</td>
    </tr>
    `,
      )
      .join('')}
  </table>
  
  <div style="margin-top: 16px; text-align: right;">
    <p style="margin: 0 0 4px 0;">
      <span style="display: inline-block; width: 150px; text-align: right;">小計（${e(
        '10%',
      )}）</span>
      <span style="display: inline-block; width: 150px; text-align: right;">¥${e(
        subtotal.toLocaleString(),
      )}</span>
    </p>
    <p style="margin: 0 0 4px 0;">
      <span style="display: inline-block; width: 150px; text-align: right;">消費税（${e(
        '10%',
      )}）</span>
      <span style="display: inline-block; width: 150px; text-align: right;">¥${e(
        taxAmount.toLocaleString(),
      )}</span>
    </p>
    <p style="margin: 0 0 4px 0; font-weight: bold;">
      <span style="display: inline-block; width: 150px; text-align: right; margin-right: 10px;">合計金額</span>
      <span style="display: inline-block; width: 150px; text-align: right;">¥${e(
        totalAmount.toLocaleString(),
      )}</span>
    </p>
    <div style="clear: both;"></div>
  </div>
  
  ${`
  <div class="bank-info">
    ${`<strong>振込先口座</strong><br>`}
    ${`銀行名：　　　　　　　<br>`}
    ${`支店名：　　　　　　　<br>`}
    ${`口座種別：　　　　　　<br>`}
    ${`口座番号：　　　　　　<br>`}
    ${`口座名義：　　　　　　　<br>`}
  </div>`}
  
  ${`
  <div class="remarks">
    ${`<strong>備考</strong><br>`}
    振込手数料は貴社ご負担にてお願い申し上げます。<br />
    納品書・領収書は電子データにて別途送付済みです。
  </div>`}
</body>
</html>
    `;

    const url = await BackendPdfUtil.generatePdf({
      html,
      fileName: `取引請求書_${transactionInfo.id}`,
      upDir: 'pos/transaction/',
      issueSignedUrl: true,
    });

    return url;
  }
}

export namespace TransactionService {
  export type CartInput = Array<{
    product_id: Transaction_Cart['product_id'];
    item_count: Transaction_Cart['item_count'];
    unit_price: Transaction_Cart['unit_price']; //この単価は、セールを適用する前の価格
    sale_id?: Transaction_Cart['sale_id']; //セールを適用したい場合、そのセールIDをここで指定する 会計処理時にこのセールをこの商品に適用できるかリアルタイムで計算し、適用できなかった場合エラーとなり会計が中止される
    sale_discount_price?: Transaction_Cart['sale_discount_price']; //セールによって引かれた額 値引きの場合はここが負の数になる
    discount_price: Transaction_Cart['discount_price']; //[TODO] これも、値引きの場合は負の数にしたい
    reservation_price?: Transaction_Cart['reservation_price']; //予約受付の場合、ここに前金の金額を入れる
    reservation_reception_product_id_for_deposit?: Transaction_Cart['reservation_reception_product_id_for_deposit']; //予約受付の場合、ここに前金の取引IDを入れる
    reservation_reception_product_id_for_receive?: Transaction_Cart['reservation_reception_product_id_for_receive']; //予約受付の場合、ここに受け取りの取引IDを入れる
  }>;
}
