import { MycaPosApiClient } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';
import { useMemo, useCallback, useState } from 'react';
import { z } from 'zod';
import { createOrUpdateSpecialtyApi } from 'api-generator';
type CreateOrUpdateSpecialtyRequest = z.infer<
  typeof createOrUpdateSpecialtyApi.request.body
>;

export const useCreateOrUpdateSpecialty = () => {
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  const { store } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const createOrUpdateSpecialty = useCallback(
    async (requestBody: CreateOrUpdateSpecialtyRequest) => {
      try {
        setIsLoading(true);
        const res = await apiClient.product.createOrUpdateSpecialty({
          storeId: store.id,
          requestBody,
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
  return { createOrUpdateSpecialty, isLoading };
};
