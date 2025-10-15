import { BackendAPI } from '@/api/backendApi/main';
import { getRegisterTodaySummaryDef } from '@/app/api/store/[store_id]/register/def';
import { BackendApiRegisterService } from '@/api/backendApi/services/register/main';
import { BackendCoreRegisterService } from 'backend-core';
//レジの当日の売り上げなどの詳細を取得するAPI（レジ点検時に叩く）
export const GET = BackendAPI.defineApi(
  getRegisterTodaySummaryDef,
  async (API, { params }) => {
    //レジ情報を取得
    const thisRegister = new BackendApiRegisterService(API, params.register_id);
    const dataEndAt = new Date();

    //一括管理設定をしている時、全てのレジのデータが取得される
    const cashFlowData = await thisRegister.core.getCashHistory();
    const transactionData = await thisRegister.core.getMoneyInfo(
      cashFlowData.openedDateTime,
      dataEndAt,
      cashFlowData.manageSeparately, //これを入れることで、個別設定の時にそのレジの取引だけ取得できる
    );

    const transactionSalesData =
      BackendCoreRegisterService.moneyInfoToSalesList(transactionData);

    const totalSales =
      transactionData.salesSummary.salesTotal +
      transactionData.salesSummary.discountTotal;

    return {
      cashFlowData,
      totalSales,
      transactionSalesData,
    };
  },
);
