import { useState, useCallback } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { ProductAPI } from '@/api/frontend/product/api';

type OrderByType =
  | 'ordered_at' // 受注日時（販売日時）
  | 'total_unit_price' // 単価
  | 'item_count'; // 販売数

export interface ProductEcOrderHistorySearchState {
  itemsPerPage: number;
  currentPage: number;
  orderBy?: OrderByType;
  searchResults: ProductAPI['getProductEcOrderHistory']['response']['ordersByProduct'];
  isLoading: boolean;
  resetPage: boolean;
}

interface Options {
  itemPerPage?: number;
  currentPage?: number;
  includesSummary?: boolean;
}

export const useProductEcOrderHistory = (
  productId: number,
  storeId: number,
  options?: Options,
) => {
  const { setAlertState } = useAlert();

  const [searchState, setSearchState] =
    useState<ProductEcOrderHistorySearchState>({
      itemsPerPage: options?.itemPerPage ?? 30,
      currentPage: 0,
      orderBy: undefined,
      searchResults: [],
      isLoading: false,
      resetPage: false,
    });

  const fetchEcOrderHistory = useCallback(async () => {
    setSearchState((prev) => ({
      ...prev,
      isLoading: true,
      currentPage: prev.resetPage ? 0 : prev.currentPage,
    }));

    const clientAPI = createClientAPI();

    try {
      const res = await clientAPI.product.getProductEcOrderHistory({
        storeID: storeId,
        productID: productId,
        orderBy: searchState.orderBy,
        skip:
          (searchState.resetPage ? 0 : searchState.currentPage) *
          searchState.itemsPerPage,
        take: searchState.itemsPerPage,
        includesSummary: options?.includesSummary,
      });

      if (res instanceof CustomError) {
        setAlertState({ message: res.message, severity: 'error' });
      } else {
        setSearchState((prev) => ({
          ...prev,
          searchResults: prev.resetPage
            ? res.ordersByProduct
            : [...prev.searchResults, ...res.ordersByProduct],
          resetPage: false,
        }));
      }
    } catch (err) {
      setAlertState({
        message: '注文履歴の取得中にエラーが発生しました。',
        severity: 'error',
      });
    } finally {
      setSearchState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [
    productId,
    storeId,
    searchState.currentPage,
    searchState.itemsPerPage,
    searchState.orderBy,
    searchState.resetPage,
    setAlertState,
  ]);

  return {
    searchState,
    setSearchState,
    fetchEcOrderHistory,
  };
};
