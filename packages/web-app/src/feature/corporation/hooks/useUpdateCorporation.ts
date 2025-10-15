import { useCallback, useMemo } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { CorporationAPI } from '@/api/frontend/corporation/api';
import { useAlert } from '@/contexts/AlertContext';
export const useUpdateCorporation = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const updateCorporation = useCallback(
    async (request: CorporationAPI['updateCorporation']['request']) => {
      const res = await clientAPI.corporation.updateCorporation(request);
      if (res instanceof CustomError) {
        console.error('法人情報の更新に失敗しました。');
        setAlertState({
          message: res.message,
          severity: 'error',
        });
        throw res;
      }
      setAlertState({
        message: '法人情報を更新しました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI, setAlertState],
  );

  return { updateCorporation };
};
