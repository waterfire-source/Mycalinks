import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useCallback, useRef, useState } from 'react';
import { MycaPosApiClient, StoreService } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';

// getRelationToStoreのレスポンス型から抽出
type GetRelationToStoreResponse = Awaited<
  ReturnType<typeof StoreService.prototype.getRelationToStore>
>;
export type StoreRelationsType = GetRelationToStoreResponse['storeRelations'];

export const useGetRelationToStore = () => {
  const { handleError } = useErrorAlert();
  const { store } = useStore();

  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [storeRelations, setStoreRelations] = useState<StoreRelationsType>();

  const fetchRelationToStore = useCallback(async () => {
    if (!store?.id) return;
    setIsLoading(true);
    try {
      const res = await apiClient.current.store.getRelationToStore({
        storeId: store.id,
        mappingDefined: true,
        includesMapping: true,
      });

      setStoreRelations(res.storeRelations);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError, store?.id]);

  return { isLoading, storeRelations, fetchRelationToStore };
};
