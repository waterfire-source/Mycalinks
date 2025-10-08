import { useState, useCallback } from 'react';
import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';

export const usePaginatedItemSearch = (
  storeId: number,
  options?: ItemSearchState,
) => {
  const { setAlertState } = useAlert();

  // 検索状態の初期化
  const [searchState, setSearchState] = useState<ItemSearchState>({
    itemsPerPage: options?.itemsPerPage ?? 30, // 初期化時に渡されたらそれを使う。
    currentPage: options?.currentPage ?? 0, // 初期化時に渡されたらそれを使う。
    searchResults: [] as BackendItemAPI[0]['response']['200']['items'][0][],
    totalCount: 0,
    isLoading: false,
    isActive: options?.isActive,
  });

  // アイテムを取得する関数
  const fetchItems = useCallback(
    async (page: number, itemsPerPage: number) => {
      setSearchState((prevState) => ({
        ...prevState,
        isLoading: true,
        currentPage: page,
        itemsPerPage: itemsPerPage,
      }));

      const clientAPI = createClientAPI();

      try {
        const response = await clientAPI.item.getAll({
          storeID: storeId,
          skip: page * itemsPerPage,
          take: itemsPerPage,
          displayName: searchState.searchName,
          genreId: searchState.selectedGenreId,
          categoryId: searchState.selectedCategoryId,
          orderBy: searchState.orderBy,
          rarity: searchState.rarity,
          expansion: searchState.expansion,
          cardnumber: searchState.cardnumber,
          hasStock: searchState.isActive,
          isBuyOnly: searchState.isBuyOnly,
          includesProducts: true,
          includesSummary: true,
          type: searchState.type,
        });

        if (response instanceof CustomError) {
          setAlertState({ message: response.message, severity: 'error' });
          setSearchState((prevState) => ({
            ...prevState,
            isLoading: false,
          }));
          throw response;
        } else {
          setSearchState((prevState) => ({
            ...prevState,
            searchResults: response.items.filter(
              (item) => item.products && item.products.length > 0,
            ),
            totalValues: {
              itemCount: response.totalValues.itemCount,
            },
            isLoading: false,
          }));
          return response.items;
        }
      } catch (error) {
        setAlertState({
          message: '検索中にエラーが発生しました。',
          severity: 'error',
        });
        setSearchState((prevState) => ({
          ...prevState,
          isLoading: false,
        }));
        throw error;
      }
    },
    [searchState, storeId, setAlertState],
  );

  return {
    searchState,
    setSearchState,
    fetchItems,
  };
};
