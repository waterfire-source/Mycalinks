import { StoreAPIRes } from '@/api/frontend/store/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

export const useDeliveryMethod = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [deliveryMethods, setDeliveryMethods] = useState<
    StoreAPIRes['getListShippingMethod'] | undefined
  >(undefined);

  const fetchDeliveryMethods = useCallback(
    async (storeID: number, includesFeeDefs?: boolean) => {
      const response = await clientAPI.store.getListShippingMethod({
        storeId: storeID,
        query: {
          includesFeeDefs: includesFeeDefs,
        },
      });
      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      setDeliveryMethods(response);
      return response;
    },
    [clientAPI.store, setAlertState],
  );

  const fetchDeliveryMethodById = useCallback(
    async (storeID: number, includesFeeDefs?: boolean, id?: number) => {
      const response = await clientAPI.store.getListShippingMethod({
        storeId: storeID,
        query: {
          includesFeeDefs: includesFeeDefs,
          id: id,
        },
      });
      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      setDeliveryMethods(response);
      return response;
    },
    [clientAPI.store, setAlertState],
  );

  return {
    deliveryMethods,
    fetchDeliveryMethods,
    fetchDeliveryMethodById,
  };
};
