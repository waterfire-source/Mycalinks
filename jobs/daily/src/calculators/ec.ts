import { TransactionStatus } from '@prisma/client';
import { BackendCoreEcOrderEtlService, BackendJob } from 'backend-core';

/**
 * EC関連の計算
 */
export const ecCalculator = async (job: BackendJob, targetDay: Date) => {
  const ecOrderService = new BackendCoreEcOrderEtlService();
  job.give(ecOrderService);

  await ecOrderService.dailyCalculate(targetDay);
};
