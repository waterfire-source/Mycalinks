import { createClientAPI } from '@/api/implement';
import { Store } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const clientAPI = useMemo(() => createClientAPI(), []);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const storeResponse = await clientAPI.store.getAll();
      if (Array.isArray(storeResponse)) {
        setStores(storeResponse);
      } else {
        console.error(storeResponse);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [clientAPI.store]);

  return {
    stores,
    loading,
    fetchStores,
  };
};
