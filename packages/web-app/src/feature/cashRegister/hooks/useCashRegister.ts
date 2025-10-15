import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { Register } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';

type IsUsedType = boolean | 'all';

export const useCashRegister = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [cashRegisters, setCashRegisters] = useState<Register[]>();

  // レジ一覧の取得
  const fetchCashRegisterList = useCallback(
    async (storeID: number, isUsed: IsUsedType = false) => {
      const inUseParam = isUsed === 'all' ? undefined : isUsed;

      const res = await clientAPI.register.listCashRegister({
        storeID,
        inUse: inUseParam,
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }

      setCashRegisters(res.registers);
    },
    [clientAPI.register, setAlertState],
  );

  return {
    cashRegisters,
    setCashRegisters,
    fetchCashRegisterList,
  };
};
