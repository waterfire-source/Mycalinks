import { useErrorAlert } from '@/hooks/useErrorAlert';
import { InventoryService, MycaPosApiClient } from 'api-generator/client';
import { useCallback, useRef, useState } from 'react';

type CreateOrUpdateInventoryRequestBody = Parameters<
  InventoryService['createOrUpdateInventory']
>[0]['requestBody'];

export const useCreateInventory = () => {
  const { handleError } = useErrorAlert();
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );
  const [isCreatingInventory, setIsCreatingInventory] =
    useState<boolean>(false);

  const createInventory = useCallback(
    async (
      storeId: number,
      requestBody: CreateOrUpdateInventoryRequestBody,
    ) => {
      setIsCreatingInventory(true);
      try {
        const res = await apiClient.current.inventory.createOrUpdateInventory({
          storeId,
          requestBody,
        });
        return res;
      } catch (error) {
        handleError(error);
      } finally {
        setIsCreatingInventory(false);
      }
    },
    [handleError],
  );

  return { createInventory, isCreatingInventory };
};
