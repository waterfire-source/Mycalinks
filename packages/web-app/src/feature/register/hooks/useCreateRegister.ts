import { RegisterAPI } from '@/api/frontend/register/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useMemo } from 'react';

export const useCreateRegister = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const { store } = useStore();

  const createRegister = async (
    request: Omit<RegisterAPI['createRegister']['request'], 'storeId'>,
  ) => {
    const res = await clientAPI.register.createRegister({
      ...request,
      storeId: store.id,
    });
    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      throw res;
    }
    return res;
  };

  return { createRegister };
};
