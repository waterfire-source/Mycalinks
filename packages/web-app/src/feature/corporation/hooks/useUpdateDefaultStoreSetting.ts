import { CorporationAPI } from '@/api/frontend/corporation/api';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';

export const useUpdateDefaultStoreSetting = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const updateDefaultStoreSetting = useCallback(
    async (request: CorporationAPI['updateDefaultStoreSetting']['request']) => {
      const res =
        await clientAPI.corporation.updateDefaultStoreSetting(request);
      if (res instanceof CustomError) {
        setAlertState({
          message: res.message,
          severity: 'error',
        });
        throw res;
      }
      setAlertState({
        message: '店舗のデフォルト設定を更新しました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI, setAlertState],
  );

  return { updateDefaultStoreSetting };
};
