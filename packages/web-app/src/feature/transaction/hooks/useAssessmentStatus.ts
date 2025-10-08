import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { createClientAPI, CustomError } from '@/api/implement';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';

// 査定状況を取得する 権限無しで実行可能
export const useAssessmentStatus = (storeId: number) => {
  const [transactions, setTransactions] = useState<
    BackendTransactionAPI[6]['response']['200']['transactions']
  >([]);
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAssessmentStatus = useCallback(async () => {
    const today = dayjs().startOf('day').toDate(); // 本日の00:00:00をDate型に変換
    const createdAtStart = today; // Date型の開始日時
    const createdAtEnd = dayjs().endOf('day').toDate(); // 本日の終了日時をDate型に変換

    try {
      setIsLoading(true);
      const response = await clientAPI.transaction.getAssessmentList({
        store_id: storeId,
        createdAtStart,
        createdAtEnd,
      });

      if (response instanceof CustomError) {
        console.error('APIエラー:', response);
        return;
      }

      setTransactions(response.transactions);
    } catch (error) {
      console.error('APIエラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [clientAPI, storeId]);

  return {
    transactions,
    fetchAssessmentStatus,
    isLoading,
  };
};
