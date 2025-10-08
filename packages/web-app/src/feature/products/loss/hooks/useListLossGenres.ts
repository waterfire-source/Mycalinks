import { useState, useCallback, useMemo } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { BackendLossAPI } from '@/app/api/store/[store_id]/loss/api';

export const useLossGenres = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [lossGenres, setLossGenres] = useState<
    BackendLossAPI[3]['response']['200']
  >([]);

  const fetchLossGenres = useCallback(async () => {
    const response = await clientAPI.loss.getLossGenres({
      store_id: store.id,
    });
    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      console.error('ロス区分のジャンルデータ取得に失敗しました:', response);
      return;
    }
    setLossGenres(response);
  }, [clientAPI.loss, setAlertState, store.id]);

  return {
    lossGenres,
    fetchLossGenres,
  };
};
