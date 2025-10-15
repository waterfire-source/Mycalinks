import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useCallback, useRef, useState } from 'react';
import { MycaPosApiClient } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';
import { ShipmentMappingRequestBody } from '@/app/auth/(dashboard)/store-shipment/type';

export const useSetStoreShipmentMapping = () => {
  const { handleError } = useErrorAlert();
  const { store } = useStore();
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setStoreShipmentMapping = useCallback(
    async (request: ShipmentMappingRequestBody) => {
      if (!store?.id) return;
      setIsLoading(true);
      try {
        await apiClient.current.storeShipment.setStoreShipmentMapping({
          storeId: store.id,
          requestBody: request,
        });
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, store?.id],
  );

  return { setStoreShipmentMapping, isLoading };
};
