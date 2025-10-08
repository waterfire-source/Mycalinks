import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useCallback, useRef, useState } from 'react';
import { MycaPosApiClient } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';

export const useGetAllStore = () => {
  const { handleError } = useErrorAlert();
  const { store } = useStore();

  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );

  const [allStores, setAllStores] = useState<
    { id: number; display_name: string | null }[]
  >([]);

  const fetchAllStores = useCallback(async () => {
    if (!store?.id) return;
    try {
      const res = await apiClient.current.store.getAllStore();
      const filteredStores = res.stores.filter((s) => s.id !== store.id);
      setAllStores(filteredStores);
    } catch (error) {
      handleError(error);
    }
  }, [handleError, store?.id]);

  return { allStores, fetchAllStores };
};
