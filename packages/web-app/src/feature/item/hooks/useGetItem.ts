import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { ItemType } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';

export const useGetItem = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const { store } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  //ジャンルの取得
  const fetchItem = useCallback(
    async (id: number, type?: ItemType) => {
      setIsLoading(true);
      try {
        const res = await clientAPI.item.get({
          storeID: store.id,
          id: id,
          includesProducts: true,
          type: type,
        });
        if (res instanceof CustomError) {
          setAlertState({
            message: `${res.status}:${res.message}`,
            severity: 'error',
          });
          return;
        }
        return res.items[0];
      } finally {
        setIsLoading(false);
      }
    },
    [clientAPI.item, setAlertState, store.id],
  );

  return {
    fetchItem,
    isLoading,
  };
};
