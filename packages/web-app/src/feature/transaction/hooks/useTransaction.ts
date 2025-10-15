import { useCallback, useMemo, useRef, useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { TransactionKind } from '@prisma/client';
import { useAlert } from '@/contexts/AlertContext';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { TransactionAPI } from '@/api/frontend/transaction/api';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';

export type GetTransactionCartRequest = Parameters<
  MycaPosApiClient['transaction']['getTransactionCart']
>[0];
export type GetTransactionCartResponse = Awaited<
  ReturnType<MycaPosApiClient['transaction']['getTransactionCart']>
>;
export type TransactionCartType =
  GetTransactionCartResponse['transactionCarts'][0];

export const useTransaction = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const [transaction, setTransaction] =
    useState<BackendTransactionAPI[5]['response']['200']['transactions'][0]>();
  const [isLoading, setIsLoading] = useState(false);

  // 指定した取引の取得してstateに保持
  const fetchTransaction = useCallback(
    async (storeID: number, transactionID: number) => {
      const res = await clientAPI.transaction.getTransactionDetails({
        store_id: storeID,
        transaction_id: transactionID,
      });
      if (res instanceof CustomError) {
        console.error('取引履歴の取得に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setTransaction(res.transactions[0]);
      return res.transactions[0];
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
      id: request.id,
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
        original_unit_price: cart.original_unit_price,
        sale_id: cart.sale_id,
        sale_discount_price: cart.sale_discount_price,
        discount_price: cart.discount_price,
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

  // 委託者の販売履歴取得
  const fetchConsignmentSalesHistory = useCallback(
    async (request: GetTransactionCartRequest) => {
      setIsLoading(true);
      try {
        const res = await apiClient.current.transaction.getTransactionCart({
          storeId: request.storeId,
          productDisplayName: request.productDisplayName,
          consignmentClientId: request.consignmentClientId,
          finishedAtStart: request.finishedAtStart,
          finishedAtEnd: request.finishedAtEnd,
          take: request.take,
          skip: request.skip,
          includesSales: true,
        });
        return res;
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError],
  );

  return {
    createDraftPurchaseTransaction,
    fetchTransaction,
    transaction,
    fetchConsignmentSalesHistory,
    isLoading,
  };
};
