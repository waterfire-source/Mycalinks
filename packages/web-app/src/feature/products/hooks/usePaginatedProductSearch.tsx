import { useState, useCallback } from 'react';
import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { ProductSearchState } from '@/feature/products/hooks/useProductsSearch';

interface UseProductSearchOptions {
  isActive?: boolean;
  currentPage?: number;
  itemPerPage?: number;
}

export const usePaginatedProductSearch = (
  storeId: number,
  options?: UseProductSearchOptions,
) => {
  const { setAlertState } = useAlert();

  const [searchState, setSearchState] = useState<ProductSearchState>({
    searchName: '',
    itemsPerPage: options?.itemPerPage ?? 30,
    currentPage: options?.currentPage ?? 0,
    selectedGenreId: null,
    selectedCategoryId: null,
    rarity: '',
    modelExpansion: '',
    modelNumber: '',
    priceChangeDateGte: '',
    priceChangeDateLt: '',
    searchResults: [],
    totalValues: {
      customerBase: 0,
      costBase: 0,
      inventoryCount: 0,
      totalSellPrice: 0,
      totalBuyPrice: 0,
      itemCount: 0,
    },
    isLoading: false,
    isActive: options?.isActive,
  });

  const fetchItems = useCallback(
    async (page: number, itemsPerPage: number) => {
      setSearchState((prevState) => ({
        ...prevState,
        isLoading: true,
        currentPage: page,
        itemsPerPage: itemsPerPage,
      }));

      const priceChangeDateGte = Date.parse(searchState.priceChangeDateGte)
        ? new Date(searchState.priceChangeDateGte)
        : undefined;

      const priceChangeDateLt = Date.parse(searchState.priceChangeDateLt)
        ? new Date(searchState.priceChangeDateLt)
        : undefined;

      const clientAPI = createClientAPI();

      try {
        const response = await clientAPI.product.listProducts({
          storeID: storeId,
          skip: page * itemsPerPage,
          take: itemsPerPage,
          displayName: searchState.searchName,
          itemGenreId: searchState.selectedGenreId ?? undefined,
          itemCategoryId: searchState.selectedCategoryId ?? undefined,
          itemExpansion: searchState.modelExpansion ?? undefined,
          itemCardnumber: searchState.modelNumber,
          itemRarity: searchState.rarity,
          priceChangeDateGte,
          priceChangeDateLt,
          isActive: searchState.isActive,
          includesSummary: true,
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
            searchResults: response.products,
            totalValues: response.totalValues,
            isLoading: false,
          }));
          return response.products;
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
