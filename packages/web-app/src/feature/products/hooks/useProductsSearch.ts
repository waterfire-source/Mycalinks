import { useState, useEffect, useRef } from 'react';
import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';

export interface ProductSearchState {
  searchName: string;
  itemsPerPage: number;
  currentPage: number;
  selectedGenreId: number | null;
  selectedCategoryId: number | null;
  rarity: string;
  modelExpansion: string;
  modelNumber: string;
  priceChangeDateGte: string;
  priceChangeDateLt: string;
  searchResults: BackendProductAPI[0]['response']['200']['products'][0][];
  totalValues: BackendProductAPI[0]['response']['200']['totalValues'];
  isLoading: boolean;
  isActive?: boolean;
  isBundle?: boolean;
}

// 初期化時にsearchStateにセットできる値
interface UseStockSearchOptions {
  isActive?: boolean | undefined;
  currentPage?: number | undefined;
  itemPerPage?: number | undefined;
  isBundle?: true | undefined;
}

// ページネーションように作っています。無限スクロールを実装する時は別のカスタムフックを作ることをお勧めします。(useMycaSearchは無限スクロールに使えるように作っています。)
// カスタムフック初期化時に検索は行われません。
// 使い方はstock/page.tsxを参照
export const useStockSearch = (
  storeId: number,
  options?: UseStockSearchOptions,
) => {
  const { setAlertState } = useAlert();
  const searchRequestIdRef = useRef(0);

  // 検索にまつわる変数を全て持っているオブジェクト
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
    isBundle: options?.isBundle,
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 既存のsearchStateを使って検索を実行する関数
  const performSearch = async () => {
    // 現在のリクエストIDを取得し、インクリメント
    const currentRequestId = ++searchRequestIdRef.current;

    setSearchState((prevState) => ({
      ...prevState,
      isLoading: true,
      currentPage: 0, // 検索ボタンで検索が行われた時はページを0にリセット
    }));

    // 日付が有効かどうかを確認
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
        skip: 0,
        take: searchState.itemsPerPage,
        displayName: searchState.searchName,
        itemGenreId: searchState.selectedGenreId ?? undefined,
        itemCategoryId: searchState.selectedCategoryId ?? undefined,
        itemExpansion: searchState.modelExpansion ?? undefined,
        itemCardnumber: searchState.modelNumber ?? undefined,
        itemRarity: searchState.rarity,
        priceChangeDateGte,
        priceChangeDateLt,
        isActive: searchState.isActive,
        isBundle: searchState.isBundle,
        includesSummary: true,
      });

      // レスポンス受信時に最新のリクエストかチェック
      if (currentRequestId !== searchRequestIdRef.current) {
        // 古いレスポンスの場合は無視
        return;
      }

      if (response instanceof CustomError) {
        setAlertState({ message: response.message, severity: 'error' });
        setSearchState((prevState) => ({
          ...prevState,
          isLoading: false,
        }));
      } else {
        setSearchState((prevState) => ({
          ...prevState,
          searchResults: response.products,
          totalValues: response.totalValues,
          isLoading: false,
        }));
      }
    } catch (error) {
      // エラー時も最新のリクエストかチェック
      if (currentRequestId !== searchRequestIdRef.current) {
        return;
      }

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

  // currentPageが変更された時に発火して次のページを検索する。(performSearchと同様の記述。useCallbackを使えば一つにまとめられそう)
  useEffect(() => {
    const fetchData = async () => {
      // この条件がないとカスタムフック初期化時に検索が行われる。
      if (!isInitialLoad) {
        // 現在のリクエストIDを取得し、インクリメント
        const currentRequestId = ++searchRequestIdRef.current;

        setSearchState((prevState) => ({
          ...prevState,
          isLoading: true,
          currentPage: searchState.currentPage,
        }));
        // 日付が有効かどうかを確認
        const priceChangeDateGte = Date.parse(searchState.priceChangeDateGte)
          ? new Date(searchState.priceChangeDateGte)
          : undefined;

        const priceChangeDateLt = Date.parse(searchState.priceChangeDateLt)
          ? new Date(searchState.priceChangeDateLt)
          : undefined;

        const clientAPI = createClientAPI();
        try {
          const itemRarity =
            searchState.rarity === '' ? undefined : searchState.rarity;
          const response = await clientAPI.product.listProducts({
            storeID: storeId,
            skip: searchState.currentPage * searchState.itemsPerPage,
            take: searchState.itemsPerPage,
            displayName: searchState.searchName,
            itemGenreId: searchState.selectedGenreId ?? undefined,
            itemCategoryId: searchState.selectedCategoryId ?? undefined,
            itemCardnumber: searchState.modelNumber ?? undefined,
            itemRarity,
            priceChangeDateGte,
            priceChangeDateLt,
            isActive: searchState.isActive,
            includesSummary: true,
          });

          // レスポンス受信時に最新のリクエストかチェック
          if (currentRequestId !== searchRequestIdRef.current) {
            // 古いレスポンスの場合は無視
            return;
          }

          if (response instanceof CustomError) {
            setAlertState({ message: response.message, severity: 'error' });
            setSearchState((prevState) => ({
              ...prevState,
              isLoading: false,
            }));
          } else {
            setSearchState((prevState) => ({
              ...prevState,
              searchResults: response.products,
              totalValues: response.totalValues,
              isLoading: false,
            }));
          }
        } catch (error) {
          // エラー時も最新のリクエストかチェック
          if (currentRequestId !== searchRequestIdRef.current) {
            return;
          }

          setAlertState({
            message: '検索中にエラーが発生しました。',
            severity: 'error',
          });
          setSearchState((prevState) => ({
            ...prevState,
            isLoading: false,
          }));
        }
      } else {
        setIsInitialLoad(false);
      }
    };

    fetchData();
  }, [searchState.currentPage, searchState.isActive, searchState.itemsPerPage]);

  return {
    searchState,
    setSearchState,
    performSearch,
  };
};
