import { MycaPosApiClient } from 'api-generator/client';
import { useMemo, useCallback, useState } from 'react';

export const useCreateSpecialtyProduct = () => {
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const createSpecialtyProduct = useCallback(
    async (request: Parameters<typeof apiClient.item.createProduct>[0]) => {
      try {
        setIsLoading(true);
        const res = await apiClient.item.createProduct(request);
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient],
  );
  return { createSpecialtyProduct, isLoading };
};
