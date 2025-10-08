import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import {
  Register,
  Register_Settlement,
  RegisterSettlementKind,
} from '@prisma/client';
import { BackendCoreRegisterService, BackendService } from 'backend-core';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiReceiptService } from '@/api/backendApi/services/receipt/main';

import { TransactionPaymentMethod } from '@prisma/client';
import { customDayjs } from 'common';
import { TaxCalculator } from '@/constants/tax';

customDayjs.locale('ja');

/**
 * API側で使うRegisterサービス
 */
export class BackendApiRegisterService extends BackendApiService {
  declare core: BackendCoreRegisterService;

  constructor(API: BackendAPI<any>, specificRegisterId?: Register['id']) {
    super(API);
    this.addCore(new BackendCoreRegisterService());
    this.setIds({
      registerId: specificRegisterId,
    });
  }

  /**
   * 精算レシート作成　一旦これはAPI向けサービスとして定義
   */
  @BackendService.WithIds(['registerId', 'storeId'])
  @BackendService.WithResources(['store'])
  public createSettlementReceipt = async (
    settlementId: Register_Settlement['id'],
    includesAll: boolean = false, //最終閉店レシート
  ) => {
    const thisSettlementInfo = await this.db.register_Settlement.findUnique({
      where: {
        register: {
          id: this.ids.registerId,
          store_id: this.ids.storeId,
        },
        id: settlementId,
      },
      include: {
        register_settlement_drawers: true,
      },
    });

    if (!thisSettlementInfo) throw new ApiError('notExist');

    //開レジ精算だったら売り上げなどの表示を除外
    const excludeSales = thisSettlementInfo.kind == RegisterSettlementKind.OPEN;

    //includesAllの場合、他の精算も取得しておく
    let allSettlements: (typeof thisSettlementInfo)[] = [thisSettlementInfo];

    includesAll =
      thisSettlementInfo.kind == RegisterSettlementKind.CLOSE && includesAll;

    if (includesAll) {
      allSettlements = await this.db.register_Settlement.findMany({
        where: {
          register: {
            store_id: this.ids.storeId,
          },
          data_start_at: {
            gte: thisSettlementInfo.data_start_at,
          },
          data_end_at: {
            lte: thisSettlementInfo.data_end_at,
          },
          kind: RegisterSettlementKind.CLOSE,
        },
        include: {
          register_settlement_drawers: true,
        },
      });
    }

    const s = thisSettlementInfo;

    const thisRegisterInfo = await this.core.existingObj;

    const calcResult = await this.core.getMoneyInfo(
      s.data_start_at,
      s.data_end_at,
      !includesAll,
    );

    // const receiptUtil = new BackendReceiptModel(API);
    const receiptUtil = new BackendApiReceiptService(this.API);
    this.give(receiptUtil);

    //レシートを作っていく
    let receiptCommandBody: string = '';

    receiptCommandBody += includesAll
      ? receiptUtil.thanks.close
      : receiptUtil.thanks.settlement;

    //ヘッダー情報
    receiptCommandBody += receiptUtil.makeRow(
      customDayjs.tz(s.data_end_at).format('YYYY/MM/DD(ddd) HH:mm:ss'),
    );
    receiptCommandBody += receiptUtil.makeRow(`担当：${s.staff_account_id}`);
    receiptCommandBody += receiptUtil.makeRow(
      `対象レジ：${includesAll ? '全てのレジ' : thisRegisterInfo.display_name}`,
    );

    if (!excludeSales) {
      //タイトル
      receiptCommandBody += receiptUtil.makeTitle('販売実績');

      //販売実績
      const taxCalculator = new TaxCalculator();

      const totalSales =
        calcResult.salesSummary.salesTotal +
        calcResult.salesSummary.discountTotal;

      receiptCommandBody += receiptUtil.makeRow(
        '総売上',
        `¥${totalSales.toLocaleString()}`,
      );
      //[TODO] 内税、外税のくだりを入れる
      receiptCommandBody += receiptUtil.makeRow(
        '総売上(税抜)',
        `¥${taxCalculator.getPriceWithoutTax(totalSales).toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '消費税計',
        `¥${(
          totalSales - taxCalculator.getPriceWithoutTax(totalSales)
        ).toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '純売上',
        `¥${(
          calcResult.salesSummary.salesTotal -
          calcResult.salesSummary.refundTotal
        ).toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '値引き',
        `¥${calcResult.salesSummary.discountTotal.toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '返金額',
        `¥${calcResult.salesSummary.refundTotal.toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '販売件数',
        `${calcResult.salesSummary.saleCount.toLocaleString()}件`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '返金件数',
        `${calcResult.salesSummary.refundCount.toLocaleString()}件`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '客数',
        `${calcResult.salesSummary.customerCount.toLocaleString()}人`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '客単価',
        `¥${calcResult.salesSummary.customerUnitPrice.toLocaleString()}`,
      );

      receiptCommandBody += receiptUtil.hr;

      //現金履歴
      receiptCommandBody += receiptUtil.makeRow('現金履歴');

      receiptCommandBody += receiptUtil.makeRow(
        '入金合計',
        `¥${calcResult.salesSummary.importTotal.toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '出金合計',
        `¥${calcResult.salesSummary.exportTotal.toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '入金件数',
        `${calcResult.salesSummary.importCount.toLocaleString()}件`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '出金件数',
        `${calcResult.salesSummary.exportCount.toLocaleString()}件`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '予約前金合計',
        `¥${calcResult.salesSummary.reservationDepositTotal.toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '予約前金返金合計',
        `¥${calcResult.salesSummary.reservationDepositRefundTotal.toLocaleString()}`,
      );

      //買取

      //タイトル
      receiptCommandBody += receiptUtil.makeTitle('買取実績');

      //販売実績
      receiptCommandBody += receiptUtil.makeRow(
        '総買取',
        `¥${calcResult.purchaseSummary.purchaseTotal.toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '総買取(税抜)',
        `¥${calcResult.purchaseSummary.purchaseTotalExcludeTax.toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '消費税計',
        `¥${calcResult.purchaseSummary.purchaseTotalTax.toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '値引き(減額調整)',
        `¥${calcResult.purchaseSummary.discountTotal.toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '買取キャンセル額',
        `¥${calcResult.purchaseSummary.refundTotal.toLocaleString()}`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '買取件数',
        `${calcResult.purchaseSummary.purchaseCount.toLocaleString()}件`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '買取枚数',
        `${calcResult.purchaseSummary.purchaseProductCount.toLocaleString()}件`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        'キャンセル件数',
        `${calcResult.purchaseSummary.refundCount.toLocaleString()}件`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '買取客数',
        `${calcResult.purchaseSummary.customerCount.toLocaleString()}人`,
      );
      receiptCommandBody += receiptUtil.makeRow(
        '客単価(平均買取額)',
        `¥${calcResult.purchaseSummary.customerUnitPrice.toLocaleString()}`,
      );

      receiptCommandBody += receiptUtil.hr;

      receiptCommandBody += receiptUtil.spacer;
      receiptCommandBody += receiptUtil.spacer;

      //支払い方法別
      const targetMethods = {
        [TransactionPaymentMethod.cash]: '現金',
        [TransactionPaymentMethod.square]: 'クレジットカード',
        [TransactionPaymentMethod.felica]: '交通系IC',
        [TransactionPaymentMethod.paypay]: 'QRコード',
      } as const;

      receiptCommandBody += Object.entries(targetMethods)
        .map(([method, label]) => {
          let html: string = receiptUtil.makeTitle(label);

          const info = calcResult[method as keyof typeof targetMethods];

          html += receiptUtil.makeRow(
            '決済額',
            `¥${info.payTotal.toLocaleString()}`,
          );
          html += receiptUtil.makeRow(
            '返金額',
            `¥${info.refundTotal.toLocaleString()}`,
          );
          html += receiptUtil.makeRow(
            '純決済額',
            `¥${info.pureTotal.toLocaleString()}`,
          );
          html += receiptUtil.makeRow(
            '取引件数',
            `${info.payCount.toLocaleString()}件`,
          );
          html += receiptUtil.makeRow(
            '返金件数',
            `${info.refundCount.toLocaleString()}件`,
          );

          return html;
        })
        .join('');

      receiptCommandBody += receiptUtil.spacer;
      receiptCommandBody += receiptUtil.spacer;
    }

    //精算現金
    receiptCommandBody += receiptUtil.makeTitle('精算現金');

    const targetDenominations: typeof s.register_settlement_drawers = [];

    allSettlements.forEach((s) => {
      s.register_settlement_drawers.forEach((d) => {
        const target = targetDenominations.find(
          (s) => s.denomination === d.denomination,
        );
        if (target) {
          target.item_count += d.item_count;
        } else {
          targetDenominations.push(d);
        }
      });
    });

    receiptCommandBody += targetDenominations
      .map((e) => {
        const deno = e.denomination < 1000 ? '玉' : '札';

        return receiptUtil.makeRow(
          `${e.denomination}円${deno}(${e.item_count}枚)`,
          `¥${(e.denomination * e.item_count).toLocaleString()}`,
        );
      })
      .join('');

    const cashTotal = {
      actual_cash_price: 0,
      ideal_cash_price: 0,
      difference_price: 0,
    };

    allSettlements.forEach((s) => {
      cashTotal.actual_cash_price += s.actual_cash_price;
      cashTotal.ideal_cash_price += s.ideal_cash_price;
      cashTotal.difference_price += s.difference_price;
    });

    //合計金額
    receiptCommandBody += receiptUtil.makeRow(
      `合計金額`,
      `¥${cashTotal.actual_cash_price.toLocaleString()}`,
    );

    receiptCommandBody += receiptUtil.hr;

    receiptCommandBody += receiptUtil.makeRow(
      `現金実在高`,
      `¥${cashTotal.actual_cash_price.toLocaleString()}`,
    );
    receiptCommandBody += receiptUtil.makeRow(
      `理論在高`,
      `¥${cashTotal.ideal_cash_price.toLocaleString()}`,
    );
    receiptCommandBody += receiptUtil.makeRow(
      `現金過不足`,
      `¥${cashTotal.difference_price.toLocaleString()}`,
    );

    const receiptCommand =
      (await receiptUtil.makeReceiptCommand(receiptCommandBody)) || '';

    return {
      settlementInfo: thisSettlementInfo,
      receiptCommand,
    };
  };
}
