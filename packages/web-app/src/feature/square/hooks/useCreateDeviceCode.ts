import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useMemo, useCallback } from 'react';
import { SquareAPI } from '@/api/frontend/square/api';

export const useCreateDeviceCode = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  const createDeviceCode = useCallback(
    async (request: SquareAPI['createSquareTerminalDeviceCode']['request']) => {
      const res = await clientAPI.square.createSquareTerminalDeviceCode({
        storeID: request.storeID,
        registerID: request.registerID,
      });
      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        throw res;
      }
      return res;
    },
    [clientAPI.square, setAlertState],
  );

  return { createDeviceCode };
};
