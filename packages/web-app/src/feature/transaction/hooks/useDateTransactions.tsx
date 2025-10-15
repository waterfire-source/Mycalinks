import { useCallback, useMemo, useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { useAlert } from '@/contexts/AlertContext';

// 取引情報を取得する(時間指定可能)
export const useDateTransactions = (storeId: number) => {
  const { setAlertState } = useAlert();
  const [transactions, setTransactions] =
    useState<BackendTransactionAPI[5]['response']['200']>();
  const clientAPI = useMemo(() => createClientAPI(), []);

  const fetchListTransactions = useCallback(
    async (startDate?: string, endDate?: string) => {
      const response = await clientAPI.transaction.listTransactions({
        store_id: storeId,
        includeSales: true,
        status: 'completed',
        finishedAtStart: startDate ? new Date(startDate) : undefined,
        finishedAtEnd: endDate ? new Date(endDate) : undefined,
      });
      if (response instanceof CustomError) {
        console.error('APIエラー:', response);
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      setTransactions(response);
    },
    [clientAPI, storeId],
  );

  return {
    transactions,
    fetchListTransactions,
  };
};
