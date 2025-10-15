import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { Register } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';

export const useRegister = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [registers, setRegisters] = useState<Register[]>();

  // レジ一覧の取得
  const fetchRegisterList = useCallback(
    async (storeId: number, inUse?: boolean, me?: boolean) => {
      const res = await clientAPI.register.listRegister({
        storeID: storeId,
        ...(inUse !== undefined && { inUse }),
        ...(me !== undefined && { me }),
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setRegisters(res.registers);
    },
    [clientAPI.register, setAlertState],
  );

  return {
    registers,
    setRegisters,
    fetchRegisterList,
  };
};
