import { TransactionStatus } from '@prisma/client';
import { BackendCoreTransactionService, BackendJob } from 'backend-core';

/**
 * payingのままになっている取引を返品する（万が一用）
 */
export const returnPayingTransaction = async (
  job: BackendJob,
  targetDay: Date,
) => {
  const targetTransactions = await job.db.transaction.findMany({
    where: {
      status: TransactionStatus.paying,
      updated_at: {
        gte: targetDay,
      },
      store_id: job.ids.storeId,
    },
  });

  for (const transaction of targetTransactions) {
    const transactionService = new BackendCoreTransactionService(
      transaction.id,
    );
    job.give(transactionService);

    try {
      await job.transaction(async (tx) => {
        await transactionService.return({});

        //下書きに戻す
        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: TransactionStatus.draft,
          },
        });
      });
    } catch (e) {
      console.error(e);
    }
  }
};
