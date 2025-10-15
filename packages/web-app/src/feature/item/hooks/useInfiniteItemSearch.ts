import { useState, useEffect } from 'react';
import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { ItemCategoryHandle } from '@prisma/client';
import { useSearchItemByFindOption } from '@/feature/item/hooks/useSearchItemByFindOption';

export interface InfiniteItemSearchState {
  searchName?: string;
  selectedGenreId?: number;
  selectedCategoryId?: number;
  rarity?: string;
  tag?: string;
  cardNumber?: string;
  itemsPerPage: number;
  currentPage: number;
  searchResults: BackendItemAPI[0]['response']['200']['items'][0][];
  totalCount: number;
  isLoading: boolean;
  hasMore: boolean;
  hasStock?: boolean;
  category?: ItemCategoryHandle | ItemCategoryHandle[];
  isBuyOnly?: boolean;
  fromTablet?: boolean;
}

interface UseInfiniteItemSearchOptions {
  hasStock?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  category?: ItemCategoryHandle | ItemCategoryHandle[];
  isBuyOnly?: boolean;
  selectedGenreId?: number;
  fromTablet?: boolean;
}

export const useInfiniteItemSearch = (
  storeId: number,
  options?: UseInfiniteItemSearchOptions,
) => {
  const { setAlertState } = useAlert();
  const [searchState, setSearchState] = useState<InfiniteItemSearchState>({
    itemsPerPage: options?.itemsPerPage ?? 30,
    currentPage: options?.currentPage ?? 0,
    searchResults: [],
    totalCount: 0,
    isLoading: false,
    hasMore: true, // 初期値は `true`
    hasStock: options?.hasStock,
    category: options?.category,
    isBuyOnly: options?.isBuyOnly,
    selectedGenreId: options?.selectedGenreId,
    fromTablet: options?.fromTablet,
  });

  useEffect(() => {
    performSearch(); // 初回検索
  }, []);

  const {
    selectedFindOption,
    selectedFindOptionObject,
    handleChangeFindOption,
    handleResetSelectedFindOption,
  } = useSearchItemByFindOption();

  // カテゴリー、ジャンルが変更されたときは選択されたfind_optionをリセットする
  useEffect(() => {
    handleResetSelectedFindOption();
  }, [searchState.selectedCategoryId, searchState.selectedGenreId]);

  // 初回ロードを制御
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 検索処理（無限スクロール対応）
  const performSearch = async (isLoadMore = false) => {
    setSearchState((prevState) => ({
      ...prevState,
      isLoading: true,
      currentPage: isLoadMore ? prevState.currentPage : 0,
    }));

    const clientAPI = createClientAPI();

    try {
      const response = await clientAPI.item.getAll({
        storeID: storeId,
        skip: isLoadMore
          ? searchState.currentPage * searchState.itemsPerPage
          : 0,
        take: searchState.itemsPerPage,
        displayName: searchState.searchName,
        genreId: searchState.selectedGenreId,
        categoryId: searchState.selectedCategoryId,
        rarity: searchState.rarity,
        cardnumber: searchState.cardNumber,
        hasStock: searchState.hasStock,
        isBuyOnly: searchState.isBuyOnly,
        includesProducts: true,
        includesSummary: true,
        fromTablet: searchState.fromTablet,
        ...selectedFindOptionObject,
      });

      if (response instanceof CustomError) {
        setAlertState({ message: response.message, severity: 'error' });
        setSearchState((prevState) => ({
          ...prevState,
          isLoading: false,
        }));
      } else {
        setSearchState((prevState) => {
          // productsのlengthが0の場合は空にする（店舗が在庫なし検索にしている場合、在庫なしの場合productsが空になることがある）
          const filteredItems = response.items.filter(
            (item) => item.products.length > 0,
          );
          const newItems = isLoadMore
            ? [...prevState.searchResults, ...filteredItems] // 追加取得
            : filteredItems; // 初回検索

          return {
            ...prevState,
            searchResults: newItems,
            totalCount: response.totalValues.itemCount,
            hasMore: newItems.length < response.totalValues.itemCount, // `hasMore` 判定
            isLoading: false,
          };
        });
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
    }
  };

  // 次のページを取得
  const loadMoreItems = () => {
    if (!searchState.hasMore || searchState.isLoading) return;
    setSearchState((prevState) => ({
      ...prevState,
      currentPage: prevState.currentPage + 1,
    }));
  };

  // `currentPage` の変更を監視し、新しいデータを取得
  useEffect(() => {
    if (!isInitialLoad) {
      performSearch(true); // 次ページのデータを取得
    } else {
      setIsInitialLoad(false);
    }
  }, [searchState.currentPage]);

  return {
    searchState,
    setSearchState,
    performSearch,
    loadMoreItems,
    selectedFindOption,
    handleChangeFindOption,
  };
};
