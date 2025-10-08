import { useCallback, useMemo } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';

export const useListSquareLocations = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  const listSquareLocations = useCallback(async () => {
    const res = await clientAPI.square.listSquareLocations();
    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}: ${res.message}`,
        severity: 'error',
      });
      throw res;
    }
    return res;
  }, [clientAPI.square, setAlertState]);

  return { listSquareLocations };
};
