import { TransactionStatus } from '@prisma/client';
import {
  BackendCoreTransactionService,
  TaskCallback,
  workerDefs,
} from 'backend-core';

//状態選択肢追加
export const paymentTimeoutController: TaskCallback<
  typeof workerDefs.transaction.kinds.paymentTimeout.body
> = async (task) => {
  //この取引情報を取得する
  const transactionId = task.body[0].data.transaction_id;

  task.setIds({
    transactionId,
  });

  const transactionInfo = await task.db.transaction.findUnique({
    where: {
      id: task.ids.transactionId,
      store_id: task.ids.storeId,
      status: TransactionStatus.paying,
    },
  });

  //なかったら無視する
  if (!transactionInfo) {
    return;
  }

  await task.transaction(async (tx) => {
    //ロールバックする
    const thisTransaction = new BackendCoreTransactionService(transactionId);
    task.give(thisTransaction);

    await thisTransaction.return({});

    //下書きに戻す
    await tx.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        status: TransactionStatus.draft,
      },
    });
  });
};
