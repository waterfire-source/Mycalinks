import { Ec_Order } from '@prisma/client';

//タスクではなるべくフィールドごとに定義したい

/**
 * ECオーダータイムアウトタスク（非同期決済用）
 */
export type EcOrderPaymentTimeout = {
  order_id: Ec_Order['id'];
};
