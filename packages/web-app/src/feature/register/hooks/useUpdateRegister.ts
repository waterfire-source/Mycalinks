import { RegisterAPI } from '@/api/frontend/register/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useMemo } from 'react';

export const useUpdateRegister = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const { store } = useStore();

  const updateRegister = async (
    request: Omit<RegisterAPI['updateRegister']['request'], 'storeId'>,
  ) => {
    const res = await clientAPI.register.updateRegister({
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

  const openRegister = async (
    request: Omit<RegisterAPI['openRegister']['request'], 'storeId'>,
  ) => {
    const res = await clientAPI.register.openRegister({
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

  const closeRegister = async (
    request: Omit<RegisterAPI['closeRegister']['request'], 'storeId'>,
  ) => {
    const res = await clientAPI.register.closeRegister({
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

  return { updateRegister, openRegister, closeRegister };
};
