import { createClientAPI, CustomError } from '@/api/implement';
import { ChangeRegisterKind } from '@/feature/cash/constants';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';

export const useRegisterCash = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  const changeRegisterCash = useCallback(
    async (
      storeId: number,
      registerId: number,
      kind: ChangeRegisterKind,
      changeAmount?: number,
      toAmount?: number,
      reason?: string,
    ) => {
      const res = await clientAPI.register.changeRegisterCash({
        storeID: storeId,
        registerID: registerId,
        changeAmount: changeAmount,
        toAmount: toAmount,
        reason: reason,
        kind: kind,
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return null;
      }
      return res ?? null;
    },
    [clientAPI.register, setAlertState],
  );

  return {
    changeRegisterCash,
  };
};
