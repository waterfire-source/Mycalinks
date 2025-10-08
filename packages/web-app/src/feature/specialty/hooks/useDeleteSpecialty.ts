import { MycaPosApiClient } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';
import { useMemo, useCallback, useState } from 'react';
import { z } from 'zod';
import { deleteSpecialtyApi } from 'api-generator';
type DeleteSpecialtyRequest = z.infer<typeof deleteSpecialtyApi.request.params>;

export const useDeleteSpecialty = () => {
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  const { store } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const deleteSpecialty = useCallback(
    async (requestBody: Omit<DeleteSpecialtyRequest, 'store_id'>) => {
      try {
        setIsLoading(true);
        const res = await apiClient.product.deleteSpecialty({
          storeId: store.id,
          specialtyId: requestBody.specialty_id,
        });
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, store.id],
  );
  return { deleteSpecialty, isLoading };
};
