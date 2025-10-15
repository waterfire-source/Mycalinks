import { Transaction } from '@prisma/client';

//タスクではなるべくフィールドごとに定義したい

/**
 * 取引タイムアウトタスク（非同期決済用）
 */
export type TransactionPaymentTimeout = {
  transaction_id: Transaction['id'];
};
