//取引の集計を同期的に行うやつ
//今の所、当日の集計を行うためにある
// 取引の集計を同期的に行う

import { BackendAPI } from '@/api/backendApi/main';
import { calculateProductStatsApi } from 'api-generator';
import { BackendCoreProductEtlService } from 'backend-core';
import { customDayjs } from 'common';

export const POST = BackendAPI.create(calculateProductStatsApi, async (API) => {
  const productEtlService = new BackendCoreProductEtlService();
  API.give(productEtlService);

  //本日をtargetとする
  const targetDay = customDayjs().tz().startOf('day').toDate();

  await productEtlService.dailyCalculate(targetDay);
});
