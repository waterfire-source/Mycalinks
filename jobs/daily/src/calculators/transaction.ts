import { TransactionStatus } from '@prisma/client';
import { BackendCoreTransactionEtlService, BackendJob } from 'backend-core';

/**
 * 取引関連の計算
 */
export const transactionCalculator = async (
  job: BackendJob,
  targetDay: Date,
) => {
  const transactionService = new BackendCoreTransactionEtlService();
  job.give(transactionService);

  await transactionService.dailyCalculate(targetDay);
};
