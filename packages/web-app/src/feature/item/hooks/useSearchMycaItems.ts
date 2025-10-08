import { useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

type Option = {
  itemType?: 'ボックス' | 'カード';
};

export const useSearchMycaItems = (
  storeId: number,
  itemsPerPage?: number,
  option?: Option,
) => {
  const { setAlertState } = useAlert();
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    selectedCategory: null as number | null,
    itemsPerPage: itemsPerPage ?? 50,
    itemType: option?.itemType ?? (null as 'ボックス' | 'カード' | null),
    rarity: null as string | null,
  });

  const fetchItems = async (
    page: number,
    itemsPerPage: number,
    isPack?: true,
    excludesCompletedPack?: true | undefined,
  ) => {
    const clientAPI = createClientAPI();

    try {
      const response = await clientAPI.mycaApp.getItem({
        params: { store_id: storeId },
        query: {
          itemsPerPage,
          currentPage: page,
          rarity: searchParams.rarity ?? undefined,
          genre: searchParams.selectedCategory ?? undefined,
          name: searchParams.searchTerm ?? undefined,
          itemType: searchParams.itemType ?? undefined,
          isPack: isPack,
          excludesCompletedPack: excludesCompletedPack,
        },
      });
      if (response instanceof CustomError) {
        setAlertState({
          message: '検索中にエラーが発生しました。',
          severity: 'error',
        });
      }
      return response.items;
    } catch (error) {
      setAlertState({
        message: '検索中にエラーが発生しました。',
        severity: 'error',
      });
      throw error;
    }
  };

  return {
    fetchItems,
    searchParams,
    setSearchParams,
  };
};
