import { createClientAPI, CustomError } from '@/api/implement';
import { api } from '@/app/api/store/api';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

//店舗の情報を取得する
export const useStoreInfoNormal = () => {
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [storeInfoNormal, setStoreInfoNormal] =
    useState<api[2]['response']['200']>();

  const fetchStoreInfoNormal = useCallback(
    async (
      storeId?: number,
      includesCorp?: boolean,
      includesEcSetting?: boolean,
    ) => {
      const res = await clientAPI.store.getStoreInfoNormal({
        storeId: storeId,
        includesCorp: includesCorp,
        includesEcSetting: includesEcSetting,
      });
      if (res instanceof CustomError) {
        console.error('店舗情報の取得に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setStoreInfoNormal(res);
      // 呼び出し元に値を返す（1店舗のみ）
      return res;
    },
    [clientAPI, setAlertState],
  );
  return {
    storeInfoNormal,
    fetchStoreInfoNormal,
  };
};
