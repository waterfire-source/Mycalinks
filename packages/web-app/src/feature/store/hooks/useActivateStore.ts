import { StoreAPI } from '@/api/frontend/store/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';

export const useActivateStore = () => {
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);

  const activateStore = useCallback(
    async (request: StoreAPI['activateStore']['request']) => {
      const res = await clientAPI.store.activateStore({
        code: request.code,
        password: request.password,
      });
      if (res instanceof CustomError) {
        throw res;
      }
      setAlertState({
        message: '店舗のログインに成功しました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI, setAlertState],
  );

  return { activateStore };
};
