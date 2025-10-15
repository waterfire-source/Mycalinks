import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { Store } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';

// 店舗の全ての詳細情報を取得する
export const useAllStoreInfo = () => {
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [allStoreInfo, setAllStoreInfo] = useState<Store | undefined>();

  const fetchAllStoreInfo = useCallback(
    async (storeID: number) => {
      const res = await clientAPI.store.getAll();

      // エラーが発生した場合
      if (res instanceof CustomError) {
        console.error('店舗情報の取得に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return;
      }

      const targetStore = res.find((store: Store) => store.id === storeID);

      setAllStoreInfo(targetStore);

      // 呼び出し元に値を返す（1店舗のみ）
      return targetStore;
    },
    [clientAPI, setAlertState],
  );

  return {
    allStoreInfo,
    fetchAllStoreInfo,
  };
};
