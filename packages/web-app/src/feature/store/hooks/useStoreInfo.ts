import { createClientAPI, CustomError } from '@/api/implement';
import { api } from '@/app/api/store/api';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

//店舗の詳細情報を取得する
export const useStoreInfo = () => {
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [storeInfo, setStoreInfo] = useState<api[3]['response']['200']>();

  const fetchStoreInfo = useCallback(
    async (storeID: number) => {
      const res = await clientAPI.store.getStoreInfo({ storeID: storeID });
      if (res instanceof CustomError) {
        console.error('店舗情報の取得に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setStoreInfo(res);
      // 呼び出し元に値を返す（1店舗のみ）
      return res;
    },
    [clientAPI, setAlertState],
  );
  return { storeInfo, fetchStoreInfo };
};
