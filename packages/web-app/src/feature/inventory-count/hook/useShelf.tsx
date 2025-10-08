import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { Inventory_Shelf } from 'backend-core';
import { useState } from 'react';

export const useShelf = () => {
  const [shelf, setShelf] = useState<Inventory_Shelf | null>();
  const [isLoading, setIsLoading] = useState(false);
  const clientAPI = createClientAPI();
  const { store } = useStore();

  const fetchShelf = async (shelfId: number) => {
    setIsLoading(true);
    const shelfResponse = await clientAPI.inventory.getShelfs({
      storeID: store.id,
      id: shelfId,
    });

    //エラーハンドリング
    if (shelfResponse instanceof CustomError) {
      setIsLoading(false);
      return;
    }

    const shelfData = shelfResponse.shelfs[0];
    setShelf(shelfData);
    setIsLoading(false);
  };

  return { shelf, setShelf, fetchShelf, isLoading };
};
