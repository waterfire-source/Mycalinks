import { BackendAPI } from '@/api/backendApi/main';
import { Prisma, RegisterSettlementKind, RegisterStatus } from '@prisma/client';
import { registerSettlementDef } from '@/app/api/store/[store_id]/register/def';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiRegisterService } from '@/api/backendApi/services/register/main';
import { BackendCoreRegisterService } from 'backend-core';

//レジの精算を行うAPI
export const POST = BackendAPI.defineApi(
  registerSettlementDef,
  async (API, { params, body }) => {
    const { actual_cash_price, drawerContents, kind } = body;

    const staff_account_id = API.resources.actionAccount?.id;
    const dataEndAt = new Date();

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //レジ情報を取得
    const thisRegister = new BackendApiRegisterService(API, params.register_id);
    const thisRegisterInfo = await thisRegister.core.existingObj;

    const resultData = await thisRegister.core.getCashHistory();

    //取引データも取得
    const transactionData = await thisRegister.core.getMoneyInfo(
      resultData.openedDateTime,
      dataEndAt,
      resultData.manageSeparately, //これを入れることで、個別設定の時にそのレジの取引だけ取得できる
    );

    //settlement_salesに合う形に変形していく
    const settlementSalesInput: Prisma.Register_Settlement_SalesUncheckedCreateWithoutRegister_settlementInput[] =
      BackendCoreRegisterService.moneyInfoToSalesList(transactionData);

    const txResult = await API.transaction(async (tx) => {
      //settlementを作っていく
      const createSettlementResult = await tx.register_Settlement.create({
        data: {
          init_cash_price: resultData.initCashPrice, //開始時現金量
          data_start_at: resultData.openedDateTime, //レジ精算で扱っているデータ区間最初
          data_end_at: dataEndAt,
          register_id: resultData.manageSeparately ? thisRegisterInfo.id : null, //一括設定の場合はnullを指定
          store_id: params.store_id,
          transaction_sell_total: resultData.transaction_sell,
          transaction_sell_discount_total:
            transactionData.salesSummary.discountTotal,
          transaction_buy_total: resultData.transaction_buy,
          transaction_buy_discount_total:
            transactionData.purchaseSummary.discountTotal,
          transaction_sell_return_total: resultData.transaction_sell_return,
          transaction_buy_return_total: resultData.transaction_buy_return,
          reservation_deposit_total: resultData.reservation_deposit,
          reservation_deposit_return_total:
            resultData.reservation_deposit_return,
          import_total: resultData.import,
          export_total: resultData.export,
          // sales_total: resultData.sales,
          // adjust_total: resultData.adjust,
          ideal_cash_price: resultData.idealCashPrice,
          difference_price: actual_cash_price - resultData.idealCashPrice,
          actual_cash_price,
          staff_account_id,
          kind,
          register_settlement_drawers: {
            create: drawerContents,
          },
          sales: {
            create: settlementSalesInput,
          },
        },
      });

      //開店or閉店モードの時に、レジの開閉などを行う
      switch (kind) {
        case RegisterSettlementKind.OPEN: {
          await thisRegister.core.changeStatus(RegisterStatus.OPEN);
          break;
        }
        case RegisterSettlementKind.CLOSE: {
          await thisRegister.core.changeStatus(RegisterStatus.CLOSED);
          break;
        }
      }

      return createSettlementResult;
    });

    //[TODO] 精算レシートのコマンドを返す

    return txResult;
  },
);
