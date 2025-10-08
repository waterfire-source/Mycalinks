import { useCallback, useMemo, useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { TransactionKind } from '@prisma/client';
import { TransactionAPI } from '@/api/frontend/transaction/api';

// 取引履歴一覧用のhooks
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<
    BackendTransactionAPI[5]['response']['200']['transactions'] | undefined
  >(undefined);
  // アラートのコンテキスト
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  // 一時保留した買取の一覧を取得
  const fetchDraftPurchaseTransactions = useCallback(
    async (storeID: number) => {
      const res = await clientAPI.transaction.listPurchaseDraft({
        store_id: storeID,
      });
      if (res instanceof CustomError) {
        console.error('買取一覧の取得に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setTransactions(res.transactions);
    },
    [clientAPI.transaction, setAlertState],
  );
  // 一次保留した買取の取引履歴を作成
  const createDraftPurchaseTransaction = async (
    request: TransactionAPI['create']['request'],
  ) => {
    const res = await clientAPI.transaction.create({
      store_id: request.store_id,
      staff_account_id: request.staff_account_id,
      transaction_kind: TransactionKind.buy,
      total_price: request.total_price,
      subtotal_price: request.subtotal_price,
      tax: request.tax,
      discount_price: request.discount_price,
      payment_method: null, // 保留の会計のためnull
      recieved_price: null, // 現金会計のお預かり
      change_price: null, // 現金会計お釣り
      customer_id: request.customer_id,
      asDraft: true, // 一時保存の設定
      carts: request.carts.map((cart) => ({
        product_id: cart.product_id,
        item_count: cart.item_count,
        unit_price: cart.unit_price,
        discount_price: cart.discount_price,
        sale_id: cart.sale_id,
        sale_discount_price: cart.sale_discount_price,
      })),
    });
    if (res instanceof CustomError) {
      console.error('買取の一時保留に失敗しました。');
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      return;
    }
    setAlertState({
      message: 'お会計を保留しました。',
      severity: 'success',
    });
  };
  // 一時保存した買取をキャンセルする
  const cancelDraftPurchaseTransaction = async (
    request: TransactionAPI['cancelPurchaseDraft']['request'],
  ) => {
    const res = await clientAPI.transaction.cancelPurchaseDraft({
      store_id: request.store_id,
      transaction_id: request.transaction_id,
    });
    if (res instanceof CustomError) {
      console.error('保留した買取の削除に失敗しました。');
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      return;
    }
    setTransactions(
      (prev) => prev?.filter((p) => p.id !== request.transaction_id),
    );
    setAlertState({
      message: '保留した買取をキャンセルしました。',
      severity: 'success',
    });
  };
  return {
    transactions,
    fetchDraftPurchaseTransactions,
    createDraftPurchaseTransaction,
    cancelDraftPurchaseTransaction,
  };
};
