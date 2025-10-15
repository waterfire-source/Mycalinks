import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';

export const useRegisterTodaySummary = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  // レジの当日まとめ情報の取得
  const getRegisterTodaySummary = useCallback(
    async (storeId: number, registerId: number) => {
      const res = await clientAPI.register.getRegisterTodaySummary({
        storeId: storeId,
        registerId: registerId,
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      return res;
    },
    [clientAPI.register, setAlertState],
  );

  return {
    getRegisterTodaySummary,
  };
};
