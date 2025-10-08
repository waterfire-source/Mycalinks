import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useSearchItemByFindOption } from '@/feature/item/hooks/useSearchItemByFindOption';

export interface ProductSearchState {
  searchName?: string;
  itemsPerPage: number;
  currentPage: number;
  itemGenreId?: number | null;
  itemCategoryId?: number | null;
  conditionOptionId?: number | null;
  conditionOptionDisplayName?: string; // 状態の表示名
  specialtyId?: number | false;
  rarity?: string;
  modelExpansion?: string;
  modelNumber?: string;
  stockNumberGte?: number; // 在庫数の下限
  priceChangeDateGte: string;
  priceChangeDateLt: string;
  stockChangeDateGte: string;
  stockChangeDateLt: string;
  searchResults: BackendProductAPI[0]['response']['200']['products'][0][];
  totalValues: BackendProductAPI[0]['response']['200']['totalValues'];
  isLoading: boolean;
  isActive?: boolean;
  ecAvailable?: boolean;
  resetPage: boolean;
  orderBy?:
    | 'actual_sell_price' //実際販売価格の昇順
    | '-actual_sell_price'
    | 'actual_buy_price' //実際買取価格の昇順
    | '-actual_buy_price'
    | 'sell_price_updated_at' //販売価格の最終更新日時
    | '-sell_price_updated_at'
    | 'buy_price_updated_at' //買取価格の最終更新日時
    | '-buy_price_updated_at'
    | 'stock_number' //在庫数
    | '-stock_number'
    | 'id' //IDの昇順
    | '-id';
  tagName?: string;
  isSpecialPriceProduct?: boolean;
  ecStockNumberGte?: number;
  mycalinksEcEnabled?: boolean;
  isConsignmentProduct?: boolean;
  includesImages?: boolean;
  hasManagementNumber?: boolean;
  isMycalinksItem?: boolean;
  mycaItemId?: number;
  isInfiniteStock?: boolean;
}

export interface ProductSearchResult {
  searchResults: BackendProductAPI[0]['response']['200']['products'][0][];
  totalValues: BackendProductAPI[0]['response']['200']['totalValues'];
}

export interface UseStockSearchOptions {
  isActive?: boolean;
  currentPage?: number;
  itemPerPage?: number;
  specialtyId?: number | false;
  itemCategoryId?: number | null;
  isSpecialPriceProduct?: boolean;
  stockChangeDateGte?: string;
  stockChangeDateLt?: string;
  stockNumberGte?: number;
  ecAvailable?: boolean;
  isConsignmentProduct?: boolean;
  isMycalinksItem?: boolean;
  mycaItemId?: number;
  isInfiniteStock?: boolean;
}

export const useStockSearch = (
  storeId: number,
  options?: UseStockSearchOptions,
  productId?: number | number[],
) => {
  const { setAlertState } = useAlert();
  const searchRequestIdRef = useRef(0);

  const [searchState, setSearchState] = useState<ProductSearchState>({
    searchName: undefined,
    itemsPerPage: options?.itemPerPage ?? 30,
    currentPage: options?.currentPage ?? 0,
    itemGenreId: undefined,
    itemCategoryId: options?.itemCategoryId ?? undefined,
    conditionOptionId: undefined,
    conditionOptionDisplayName: undefined,
    specialtyId: options?.specialtyId,
    rarity: undefined,
    modelExpansion: undefined,
    modelNumber: undefined,
    stockNumberGte: options?.stockNumberGte ?? undefined,
    priceChangeDateGte: '',
    priceChangeDateLt: '',
    stockChangeDateGte: options?.stockChangeDateGte ?? '',
    stockChangeDateLt: options?.stockChangeDateLt ?? '',
    ecAvailable: options?.ecAvailable ?? undefined,
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
    resetPage: false,
    orderBy: undefined,
    tagName: undefined,
    isSpecialPriceProduct: options?.isSpecialPriceProduct,
    ecStockNumberGte: undefined,
    mycalinksEcEnabled: undefined,
    isConsignmentProduct: options?.isConsignmentProduct,
    includesImages: true, // デフォルトで画像を含める
    hasManagementNumber: undefined,
    isMycalinksItem: options?.isMycalinksItem ?? undefined,
    mycaItemId: options?.mycaItemId ?? undefined,
    isInfiniteStock: options?.isInfiniteStock ?? undefined,
  });

  const {
    selectedFindOption,
    selectedFindOptionObject,
    handleChangeFindOption,
    handleResetSelectedFindOption,
  } = useSearchItemByFindOption();

  // 選択されたFindOptionによる検索項目を整形する（/api/store/{store_id}/productではkeyが「item+Key(パスカルケース)」の必要がある）
  const modifiedFindOptionObject = useMemo(() => {
    return Object.entries(selectedFindOptionObject).reduce<
      Record<string, string>
    >((acc, [key, value]) => {
      const pascalKey = key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      acc[`item${pascalKey}`] = value;
      return acc;
    }, {});
  }, [selectedFindOptionObject]);
  // カテゴリー、ジャンルが変更されたときは選択されたfind_optionをリセットする
  useEffect(() => {
    handleResetSelectedFindOption();
  }, [searchState.itemCategoryId, searchState.itemGenreId]);

  const fetchProducts = useCallback(async () => {
    // 現在のリクエストIDを取得し、インクリメント
    const currentRequestId = ++searchRequestIdRef.current;

    setSearchState((prevState) => ({
      ...prevState,
      isLoading: true,
      currentPage: searchState.resetPage ? 0 : prevState.currentPage,
    }));

    const priceChangeDateGte = Date.parse(searchState.priceChangeDateGte)
      ? new Date(searchState.priceChangeDateGte + 'T00:00:00')
      : undefined;

    const priceChangeDateLt = Date.parse(searchState.priceChangeDateLt)
      ? new Date(searchState.priceChangeDateLt + 'T00:00:00')
      : undefined;

    const stockChangeDateGte = Date.parse(searchState.stockChangeDateGte)
      ? new Date(searchState.stockChangeDateGte + 'T00:00:00')
      : undefined;

    const stockChangeDateLt = Date.parse(searchState.stockChangeDateLt)
      ? new Date(searchState.stockChangeDateLt + 'T00:00:00')
      : undefined;

    const clientAPI = createClientAPI();
    try {
      const response = await clientAPI.product.listProducts({
        storeID: storeId,
        id: productId,
        skip:
          (searchState.resetPage ? 0 : searchState.currentPage) *
          searchState.itemsPerPage,
        take: searchState.itemsPerPage,
        displayName: searchState.searchName,
        itemCategoryId: searchState.itemCategoryId ?? undefined,
        itemGenreId: searchState.itemGenreId ?? undefined,
        itemExpansion: searchState.modelExpansion ?? undefined,
        itemCardnumber: searchState.modelNumber,
        mycaItemId: searchState.mycaItemId ?? undefined,
        conditionOptionId: searchState.conditionOptionId ?? undefined,
        conditionOptionDisplayName: searchState.conditionOptionDisplayName,
        specialtyId: searchState.specialtyId,
        itemRarity: searchState.rarity,
        stockNumberGte: searchState.stockNumberGte,
        ...(priceChangeDateGte && { priceChangeDateGte }),
        ...(priceChangeDateLt && { priceChangeDateLt }),
        ...(stockChangeDateGte && { stockChangeDateGte }),
        ...(stockChangeDateLt && { stockChangeDateLt }),
        isActive: searchState.isActive,
        ecAvailable: searchState.ecAvailable,
        includesSummary: true,
        orderBy: searchState.orderBy,
        tagName: searchState.tagName ?? undefined,
        isSpecialPriceProduct: searchState.isSpecialPriceProduct,
        ecStockNumberGte: searchState.ecStockNumberGte,
        ...modifiedFindOptionObject,
        mycalinksEcEnabled: searchState.mycalinksEcEnabled,
        isConsignmentProduct: searchState.isConsignmentProduct,
        includesImages: searchState.includesImages,
        hasManagementNumber: searchState.hasManagementNumber,
        isMycalinksItem: searchState.isMycalinksItem ?? undefined,
      });

      // レスポンス受信時に最新のリクエストかチェック
      if (currentRequestId !== searchRequestIdRef.current) {
        // 古いレスポンスの場合は無視
        return;
      }

      if (response instanceof CustomError) {
        setAlertState({ message: response.message, severity: 'error' });
        setSearchState((prevState) => ({ ...prevState, isLoading: false }));
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
      setSearchState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [
    storeId,
    productId,
    searchState.searchName,
    searchState.itemsPerPage,
    searchState.currentPage,
    searchState.itemGenreId,
    searchState.itemCategoryId,
    searchState.conditionOptionId,
    searchState.conditionOptionDisplayName,
    searchState.specialtyId,
    searchState.rarity,
    searchState.modelExpansion,
    searchState.modelNumber,
    searchState.priceChangeDateGte,
    searchState.priceChangeDateLt,
    searchState.stockChangeDateGte,
    searchState.stockChangeDateLt,
    searchState.isActive,
    searchState.resetPage,
    searchState.stockNumberGte,
    searchState.orderBy,
    searchState.tagName,
    searchState.isSpecialPriceProduct,
    searchState.ecStockNumberGte,
    searchState.mycalinksEcEnabled,
    searchState.isConsignmentProduct,
    setAlertState,
    modifiedFindOptionObject,
    searchState.includesImages,
    searchState.hasManagementNumber,
    searchState.isMycalinksItem,
  ]);

  // // ecStockNumberGteが変更されたときはfetchProductsする
  // useEffect(() => {
  //   fetchProducts();
  // }, [searchState.ecStockNumberGte]);

  // リフェッチ専用関数 *fetchProductsを修正したらこちらも同様の修正を行ってください*
  const refetchProducts = async () => {
    // 現在のリクエストIDを取得し、インクリメント
    const currentRequestId = ++searchRequestIdRef.current;

    setSearchState((prevState) => ({
      ...prevState,
      isLoading: true,
      currentPage: searchState.resetPage ? 0 : prevState.currentPage,
    }));

    const priceChangeDateGte = Date.parse(searchState.priceChangeDateGte)
      ? new Date(searchState.priceChangeDateGte + 'T00:00:00')
      : undefined;

    const priceChangeDateLt = Date.parse(searchState.priceChangeDateLt)
      ? new Date(searchState.priceChangeDateLt + 'T00:00:00')
      : undefined;

    const stockChangeDateGte = Date.parse(searchState.stockChangeDateGte)
      ? new Date(searchState.stockChangeDateGte + 'T00:00:00')
      : undefined;

    const stockChangeDateLt = Date.parse(searchState.stockChangeDateLt)
      ? new Date(searchState.stockChangeDateLt + 'T00:00:00')
      : undefined;

    const clientAPI = createClientAPI();
    try {
      const response = await clientAPI.product.listProducts({
        storeID: storeId,
        id: productId,
        skip: searchState.currentPage * searchState.itemsPerPage,
        take: searchState.itemsPerPage,
        displayName: searchState.searchName,
        itemCategoryId: searchState.itemCategoryId ?? undefined,
        itemGenreId: searchState.itemGenreId ?? undefined,
        itemExpansion: searchState.modelExpansion ?? undefined,
        itemCardnumber: searchState.modelNumber,
        mycaItemId: searchState.mycaItemId ?? undefined,
        conditionOptionId: searchState.conditionOptionId ?? undefined,
        conditionOptionDisplayName: searchState.conditionOptionDisplayName,
        specialtyId: searchState.specialtyId,
        itemRarity: searchState.rarity,
        stockNumberGte: searchState.stockNumberGte,
        ...(priceChangeDateGte && { priceChangeDateGte }),
        ...(priceChangeDateLt && { priceChangeDateLt }),
        ...(stockChangeDateGte && { stockChangeDateGte }),
        ...(stockChangeDateLt && { stockChangeDateLt }),
        isActive: searchState.isActive,
        ecAvailable: searchState.ecAvailable,
        includesSummary: true,
        orderBy: searchState.orderBy,
        tagName: searchState.tagName ?? undefined,
        isSpecialPriceProduct: searchState.isSpecialPriceProduct,
        ecStockNumberGte: searchState.ecStockNumberGte,
        ...modifiedFindOptionObject,
        mycalinksEcEnabled: searchState.mycalinksEcEnabled,
        isConsignmentProduct: searchState.isConsignmentProduct,
        includesImages: searchState.includesImages,
        hasManagementNumber: searchState.hasManagementNumber,
        isMycalinksItem: searchState.isMycalinksItem ?? undefined,
      });

      // レスポンス受信時に最新のリクエストかチェック
      if (currentRequestId !== searchRequestIdRef.current) {
        // 古いレスポンスの場合は無視
        return;
      }

      if (response instanceof CustomError) {
        setAlertState({ message: response.message, severity: 'error' });
        setSearchState((prevState) => ({ ...prevState, isLoading: false }));
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
      setSearchState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  return {
    searchState,
    setSearchState,
    fetchProducts,
    refetchProducts,
    selectedFindOption,
    handleChangeFindOption,
  };
};
