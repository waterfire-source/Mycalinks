import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useCallback, useMemo } from 'react';

export const useCreateCategory = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const { store } = useStore();

  const createCategory = useCallback(
    async (categoryName: string) => {
      const res = await clientAPI.category.createCategory({
        storeID: store.id,
        displayName: categoryName,
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        throw res;
      }

      return res;
    },
    [clientAPI.category, setAlertState, store.id],
  );

  return { createCategory };
};
