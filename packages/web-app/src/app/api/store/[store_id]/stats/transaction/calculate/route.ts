//取引の集計を同期的に行うやつ
//今の所、当日の集計を行うためにある
// 取引の集計を同期的に行う

import { BackendAPI } from '@/api/backendApi/main';
import { calculateTransactionStatsApi } from 'api-generator';
import { BackendCoreTransactionEtlService } from 'backend-core';
import { customDayjs } from 'common';

export const POST = BackendAPI.create(
  calculateTransactionStatsApi,
  async (API) => {
    const transactionEtlService = new BackendCoreTransactionEtlService();
    API.give(transactionEtlService);

    //本日をtargetとする
    const targetDay = customDayjs().tz().startOf('day').toDate();

    await transactionEtlService.dailyCalculate(targetDay);
  },
);
