import { useState, useEffect, useCallback } from 'react';
import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ProductGetAllOrderType } from '@/app/api/store/[store_id]/product/api';

// 検索用Stateの型
export interface ProductSearchState {
  categoryId?: number;
  rarity?: string;
  conditionOptionDisplayName?: string;
  isActive?: boolean;
  orderBy?: ProductGetAllOrderType;
}

export const useOriginalPackProducts = (
  storeId: number,
  originalPackItemId?: number,
) => {
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  // 検索結果
  const [searchResults, setSearchResults] = useState<
    BackendProductAPI[0]['response'][200]['products'] | null
  >(null);

  // 検索条件
  const [searchState, setSearchState] = useState<ProductSearchState>({
    categoryId: undefined,
    rarity: '',
    conditionOptionDisplayName: undefined,
    isActive: undefined,
    orderBy: undefined,
  });

  const fetchOriginalPackProducts = useCallback(async () => {
    // originalPackItemId が無いなら検索しない
    if (!originalPackItemId) return;

    setIsLoading(true);
    const clientAPI = createClientAPI();
    try {
      const response = await clientAPI.product.listProducts({
        storeID: storeId,
        itemCategoryId: searchState.categoryId,
        itemRarity: searchState.rarity || undefined,
        conditionOptionDisplayName:
          searchState.conditionOptionDisplayName || undefined,
        isActive: searchState.isActive,
        originalPackItemId,
        orderBy: searchState.orderBy,
      });

      if (response instanceof CustomError) {
        setAlertState({ message: response.message, severity: 'error' });
      } else {
        setSearchResults(response.products);
      }
    } catch (error) {
      setAlertState({
        message: '検索中にエラーが発生しました。',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [storeId, originalPackItemId, searchState, setAlertState]);

  // 依存関係が変化して、fetchOriginalPackProductsが再計算されたら発火
  useEffect(() => {
    fetchOriginalPackProducts();
  }, [fetchOriginalPackProducts]);

  return {
    searchState,
    setSearchState,
    searchResults,
    isLoading,
    fetchOriginalPackProducts,
  };
};
