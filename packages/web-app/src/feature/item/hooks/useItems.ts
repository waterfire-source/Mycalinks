import { ItemAPIRes } from '@/api/frontend/item/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { ItemGetAllOrderType } from '@/feature/products/components/searchTable/const';
import { ItemType } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';

export interface SearchParams {
  hasStock?: boolean;
  genreId?: number;
  categoryId?: number;
  orderBy?: string;
  asDraft?: boolean;
}

export const useItems = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  // アラートのコンテキスト
  const { setAlertState } = useAlert();
  // 商品一覧のstate
  const [items, setItems] = useState<ItemAPIRes['getAll']['items'] | undefined>(
    undefined,
  );
  // フィルタリング用パラメータ
  const [searchParams, setSearchParams] = useState<SearchParams>({
    hasStock: true,
  });
  // 商品一覧取得してstateに保存
  const fetchItems = useCallback(
    async (storeID: number, take?: number, isPack?: boolean) => {
      const response = await clientAPI.item.getAll({
        storeID: storeID,
        // product_is_active: true, //デフォルトでアクティブ商品のみにする（商品数がえげつないため）
        take: take ?? 1000, // 設定されていない場合1000件取得
        includesProducts: true,
        isPack: isPack ?? false,
      });
      // エラー時はアラートを出して早期return
      if (response instanceof CustomError) {
        console.error('商品一覧の取得に失敗しました。');
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }

      setItems(response.items);
    },
    [clientAPI.item, setAlertState],
  );
  // 商品を取得してstateに保存
  const fetchItemById = useCallback(
    async (storeID: number, id: number, type?: ItemType) => {
      const response = await clientAPI.item.getAll({
        storeID: storeID,
        id: id,
        includesProducts: true,
        type: type ?? ItemType.NORMAL,
      });
      // エラー時はアラートを出して早期return
      if (response instanceof CustomError) {
        console.error('商品の取得に失敗しました。');
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      setItems(response.items);
    },
    [clientAPI.item, setAlertState],
  );
  // 商品一覧(typeを指定)取得してstateに保存
  const fetchTypeItems = useCallback(
    async (storeID: number, take?: number, type?: ItemType) => {
      const response = await clientAPI.item.getAll({
        storeID: storeID,
        take: take ?? 1000, // 設定されていない場合1000件取得
        type: type ?? ItemType.NORMAL,
        includesProducts: true,
        hasStock: searchParams.hasStock,
        genreId: searchParams.genreId,
        categoryId: searchParams.categoryId,
        orderBy: searchParams.orderBy as ItemGetAllOrderType,
        status: searchParams.asDraft ? 'DRAFT' : undefined,
      });
      // エラー時はアラートを出して早期return
      if (response instanceof CustomError) {
        console.error('商品一覧の取得に失敗しました。');
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      setItems(response.items);
    },
    [clientAPI.item, setAlertState, searchParams],
  );
  // 商品検索の際に利用、商品コードor商品名で検索し、商品一覧のstateを書き換える
  const searchItems = useCallback(
    async (storeID: number, query: string, take?: number) => {
      // 商品名で検索
      const displayNameResponse = await clientAPI.item.getAll({
        storeID: storeID,
        // product_is_active: true, //デフォルトでアクティブ商品のみにする
        displayName: query,
        take: take ?? 1000, // 設定されていない場合上限を1000件にする
        includesProducts: true,
      });
      // エラー時はアラートを出して早期return
      if (displayNameResponse instanceof CustomError) {
        console.error('商品検索(商品名)に失敗しました。');
        setAlertState({
          message: `${displayNameResponse.status}:${displayNameResponse.message}`,
          severity: 'error',
        });
        return;
      }
      // 商品コードで検索
      const productCodeResponse = await clientAPI.item.getAll({
        storeID: storeID,
        // product_is_active: true, //デフォルトでアクティブ商品のみにする
        take: take ?? 1000, // 設定されていない場合上限を1000件にする
        includesProducts: true,
      });

      if (productCodeResponse instanceof CustomError) {
        console.error('商品検索(商品コード)に失敗しました');
        setAlertState({
          message: `${productCodeResponse.status}:${productCodeResponse.message}`,
          severity: 'error',
        });
        return;
      }
      // 商品コードの検索結果から商品名検索と同じitemが見つかった場合削除
      const filteredItems = displayNameResponse.items.filter(
        (displayNameItem) =>
          !productCodeResponse.items.some(
            (item) => item.id === displayNameItem.id,
          ),
      );
      // 検索結果を結合してstateに保存
      setItems([...filteredItems, ...productCodeResponse.items]);
    },
    [clientAPI.item, setAlertState],
  );

  // 複数のitemをid指定で一気に取得
  const getItems = useCallback(
    async (storeID: number, ids: number[], isReturn: boolean = false) => {
      // 商品名で検索
      const items = await clientAPI.item.getAll({
        storeID: storeID,
        id: ids,
        includesProducts: true,
      });
      // エラー時はアラートを出して早期return
      if (items instanceof CustomError) {
        console.error('複数商品取得に失敗しました。');
        setAlertState({
          message: `${items.status}:${items.message}`,
          severity: 'error',
        });
        return;
      }
      // 検索結果を結合してstateに保存
      setItems(items.items);
      if (isReturn) return items.items;
    },
    [clientAPI.item, setAlertState],
  );

  return {
    items,
    fetchItems,
    fetchItemById,
    fetchTypeItems,
    searchItems,
    getItems,
    searchParams,
    setSearchParams,
  };
};
