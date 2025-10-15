import { useState, useEffect, useRef } from 'react';
import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { Item, ItemCategoryHandle, ItemType } from '@prisma/client';
import { ItemGetAllOrderType } from '@/feature/products/components/searchTable/const';
import { useSearchItemByFindOption } from '@/feature/item/hooks/useSearchItemByFindOption';

export interface ItemSearchState {
  searchName?: string;
  selectedGenreId?: number | null;
  selectedCategoryId?: number | null;
  rarity?: string;
  tag?: string;
  expansion?: string;
  cardnumber?: string;
  itemsPerPage: number;
  currentPage: number;
  searchResults: BackendItemAPI[0]['response']['200']['items'][0][];
  searchResultArray: BackendItemAPI[0]['response']['200']['items'][0][]; //無限スクロール用 こっちは検索結果をつぎ足す
  totalCount: number;
  isLoading: boolean;
  isActive?: boolean;
  category?: ItemCategoryHandle | ItemCategoryHandle[];
  orderBy?: ItemGetAllOrderType;
  isBuyOnly?: boolean;
  id?: number | number[];
  isMycalinksItem?: boolean;
  type?: ItemType;
  status?: Item['status'] | Item['status'][];
  infinite_stock?: boolean;
}

// 初期化時にsearchStateにセットできる値
interface UseItemSearchOptions {
  isActive?: boolean;
  currentPage?: number;
  itemPerPage?: number;
  category?: ItemCategoryHandle | ItemCategoryHandle[];
  isBuyOnly?: boolean;
  isMycalinksItem?: boolean;
  status?: Item['status'] | Item['status'][];
  infinite_stock?: boolean;
}

// ページネーションを実装したテーブルで使いやすいように作ってあります。無限スクロールに対応させたい場合は別のhookを作った方がいいと思います。(useMycaSearchは無限スクロール用に作ってるのでそっちを参考にした方がいいと思う。)
// カスタムフック初期化時に検索は行われません。
// 使い方はitem/page.tsxを参照
export const useItemSearch = (
  storeId: number,
  options?: UseItemSearchOptions,
) => {
  const { setAlertState } = useAlert();
  const searchRequestIdRef = useRef(0);
  const [searchState, setSearchState] = useState<ItemSearchState>({
    itemsPerPage: options?.itemPerPage ?? 30, // 初期化時に渡されたらそれを使う。
    currentPage: options?.currentPage ?? 0, // 初期化時に渡されたらそれを使う。
    searchResults: [] as BackendItemAPI[0]['response']['200']['items'][0][],
    searchResultArray: [] as BackendItemAPI[0]['response']['200']['items'][0][],
    totalCount: 0,
    isLoading: false,
    isActive: options?.isActive,
    category: options?.category,
    isBuyOnly: options?.isBuyOnly,
    isMycalinksItem: options?.isMycalinksItem,
    status: options?.status,
    infinite_stock: options?.infinite_stock,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  // 検索を実行する関数
  const performSearch = async (isPageSkip = false) => {
    // 現在のリクエストIDを取得し、インクリメント
    const currentRequestId = ++searchRequestIdRef.current;

    // isPageSkipがある場合はページネーションを反映する
    setSearchState((prevState) => ({
      ...prevState,
      isLoading: true,
      currentPage: isPageSkip ? prevState.currentPage : 0, // 検索ボタンで検索が行われた時はページを0にリセット
    }));

    const clientAPI = createClientAPI();
    try {
      const response = await clientAPI.item.getAll({
        storeID: storeId,
        skip: isPageSkip
          ? searchState.currentPage * searchState.itemsPerPage
          : 0,
        take: searchState.itemsPerPage,
        displayName: searchState.searchName,
        genreId: searchState.selectedGenreId ?? undefined,
        categoryId: searchState.selectedCategoryId ?? undefined,
        orderBy: searchState.orderBy,
        rarity: searchState.rarity,
        expansion: searchState.expansion,
        cardnumber: searchState.cardnumber,
        hasStock: searchState.isActive,
        isBuyOnly: searchState.isBuyOnly,
        includesProducts: true,
        includesSummary: true,
        includesMycaItemInfo: true,
        id: searchState.id,
        isMycalinksItem: searchState.isMycalinksItem,
        status: searchState.status,
        infinite_stock: searchState.infinite_stock,
        ...selectedFindOptionObject,
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
          searchResults: response.items,
          searchResultArray: response.items,
          totalCount: response.totalValues.itemCount,
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
      // また、selectedGenreIdがnullの場合（ジャンル初期化前）も検索しない
      if (!isInitialLoad && searchState.selectedGenreId !== null) {
        // 現在のリクエストIDを取得し、インクリメント
        const currentRequestId = ++searchRequestIdRef.current;

        setSearchState((prevState) => ({
          ...prevState,
          isLoading: true,
        }));

        const clientAPI = createClientAPI();

        try {
          const response = await clientAPI.item.getAll({
            storeID: storeId,
            skip: searchState.currentPage * searchState.itemsPerPage,
            take: searchState.itemsPerPage,
            displayName: searchState.searchName,
            genreId: searchState.selectedGenreId ?? undefined,
            categoryId: searchState.selectedCategoryId ?? undefined,
            orderBy: searchState.orderBy,
            rarity: searchState.rarity,
            expansion: searchState.expansion,
            cardnumber: searchState.cardnumber,
            hasStock: searchState.isActive,
            isBuyOnly: searchState.isBuyOnly,
            includesProducts: true,
            includesSummary: true,
            includesMycaItemInfo: true,
            id: searchState.id,
            isMycalinksItem: searchState.isMycalinksItem,
            status: searchState.status,
            infinite_stock: searchState.infinite_stock,
            ...selectedFindOptionObject,
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
              searchResults: response.items,
              searchResultArray:
                searchState.currentPage === 0
                  ? response.items // ページ0の時はリセット
                  : [...prevState.searchResultArray, ...response.items], // それ以外は継ぎ足し
              totalCount: response.totalValues.itemCount,
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
  }, [
    searchState.currentPage,
    searchState.itemsPerPage,
    searchState.isActive,
    searchState.selectedGenreId,
  ]);

  return {
    searchState,
    setSearchState,
    performSearch,
    selectedFindOption,
    handleChangeFindOption,
  };
};
