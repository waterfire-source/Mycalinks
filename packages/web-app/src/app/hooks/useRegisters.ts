import { useEffect } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { Register } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';
import { useStore } from '@/contexts/StoreContext';

export const useRegisters = () => {
  const [registers, setRegisters] = useState<Register[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { store } = useStore();

  useEffect(() => {
    if (store?.id) {
      fetchRegisters();
    }
  }, [store?.id]);

  const fetchRegisters = useCallback(async () => {
    if (!store?.id) return;

    setLoading(true);
    try {
      const registerResponse = await clientAPI.register.listRegister({
        storeID: store.id,
      });
      if (registerResponse instanceof CustomError) {
        console.error(registerResponse);
      } else {
        setRegisters(registerResponse.registers);
        return registerResponse.registers;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [clientAPI.register, store?.id]);

  return {
    registers,
    loading,
    fetchRegisters,
  };
};
