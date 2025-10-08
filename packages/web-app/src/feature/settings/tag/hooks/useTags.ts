import { TAG_GENRE1_METHOD } from '@/api/frontend/product/implement';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

export interface UseTagParams {
  createTag: {
    storeID: number;
    displayName: string;
    description?: string;
    genre1?: TAG_GENRE1_METHOD;
    genre2?: string;
  };
  updateTag: {
    storeID: number;
    tagID: number;
    displayName: string;
    description?: string;
    genre1?: TAG_GENRE1_METHOD;
    genre2?: string;
  };
  deleteTag: {
    storeID: number;
    tagID: number;
  };
  getTags: {
    storeID: number;
    tagID?: number;
    genre1?: TAG_GENRE1_METHOD;
    includesAuto?: boolean;
  };
  addTagToProducts: {
    storeID: number;
    tagID: number;
    productIDs: number[];
  };
}

export interface Tag {
  id: number;
  storeID: number;
  displayName: string;
  description: string;
  genre1?: string;
  genre2: string;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
}

export const useTags = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  const [isLoading, setIsLoading] = useState(false);

  // タグの登録
  const createTag = useCallback(
    async (params: UseTagParams['createTag']) => {
      setIsLoading(true);
      const res = await clientAPI.product.createTag({
        ...params,
      });
      setIsLoading(false);

      if (res instanceof CustomError) {
        console.error('タグの作成に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return null;
      }
      setAlertState({
        message: 'タグを作成しました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI.product, setAlertState],
  );

  // タグの更新
  const updateTag = useCallback(
    async (params: UseTagParams['updateTag']) => {
      setIsLoading(true);
      const res = await clientAPI.product.updateTag({
        ...params,
      });
      setIsLoading(false);

      if (res instanceof CustomError) {
        console.error('タグの更新に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return null;
      }
      setAlertState({
        message: 'タグを更新しました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI.product, setAlertState],
  );

  // タグの削除
  const deleteTag = useCallback(
    async (params: UseTagParams['deleteTag']) => {
      setIsLoading(true); // ローディング開始
      const res = await clientAPI.product.deleteTag({
        ...params,
      });
      setIsLoading(false); // ローディング終了

      if (res instanceof CustomError) {
        console.error('タグの削除に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return null;
      }
      setAlertState({
        message: 'タグを削除しました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI.product, setAlertState],
  );

  // タグを取得
  const getTags = useCallback(
    async (params: UseTagParams['getTags']) => {
      setIsLoading(true);
      const res = await clientAPI.product.getTags({
        ...params,
      });
      setIsLoading(false);

      if (res instanceof CustomError) {
        console.error('タグの取得に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return null;
      }
      return res;
    },
    [clientAPI.product, setAlertState],
  );

  // タグにプロダクトを紐づける
  const addTagToProducts = useCallback(
    async (params: UseTagParams['addTagToProducts']) => {
      setIsLoading(true);
      const request = params.productIDs.map((productID) => ({
        tagID: params.tagID,
        productID: productID,
      }));
      const res = await clientAPI.product.addTagToProduct({
        storeID: params.storeID,
        products: request,
      });
      setIsLoading(false);

      if (res instanceof CustomError) {
        console.error('タグの紐づけに失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return null;
      }
      setAlertState({
        message: 'タグを紐づけました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI.product, setAlertState],
  );

  return {
    createTag,
    updateTag,
    deleteTag,
    getTags,
    addTagToProducts,
    isLoading,
  };
};
