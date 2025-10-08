import { useErrorAlert } from '@/hooks/useErrorAlert';
import { MycaPosApiClient } from 'api-generator/client';
import { useMemo, useCallback, useState } from 'react';

export type CreateProductResponse = Awaited<
  ReturnType<MycaPosApiClient['item']['createProduct']>
>;

export const useCreateProduct = () => {
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  const { handleError } = useErrorAlert();
  const [isLoading, setIsLoading] = useState(false);
  const createProduct = useCallback(
    async (
      request: Parameters<typeof apiClient.item.createProduct>[0],
    ): Promise<CreateProductResponse | undefined> => {
      try {
        setIsLoading(true);
        const res = await apiClient.item.createProduct(request);
        return res;
      } catch (error) {
        handleError(error);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, handleError],
  );
  return { createProduct, isLoading };
};
