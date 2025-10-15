import { createClientAPI, CustomError } from '@/api/implement';
import { ItemType } from '@prisma/client';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';
import { ItemAPI } from '@/api/frontend/item/api';
import { ProductAPI } from '@/api/frontend/product/api';

export const useBundles = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  // バンドル定義された商品を取得
  const listBundleItems = useCallback(
    async (params: ItemAPI['getAll']['request']) => {
      const res = await clientAPI.item.getAll({
        ...params,
        type: ItemType['BUNDLE'], // バンドル定義された商品のみ取得
        includesProducts: true, // 商品情報も取得
        hasStock: true, // 在庫があるやつだけ取得
      });
      console.log;
      if (res instanceof CustomError) {
        console.error('バンドル定義された商品の取得に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return null;
      }
      return res;
    },
    [clientAPI.item, setAlertState],
  );

  // バンドルを作成する
  const createBundle = useCallback(
    async (params: ItemAPI['createBundle']['request']) => {
      const res = await clientAPI.item.createBundle(params);
      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        throw new Error('バンドルの作成に失敗しました。');
      }
      setAlertState({
        message: 'バンドルの作成に成功しました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI.item, setAlertState],
  );

  // バンドルを編集する
  const updateBundle = useCallback(
    async (params: ItemAPI['updateBundle']['request']) => {
      const res = await clientAPI.item.updateBundle(params);
      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        throw new Error('バンドルの編集に失敗しました。');
      }
      setAlertState({
        message: 'バンドルの編集に成功しました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI.item, setAlertState],
  );

  // バンドルを解体する
  const releaseBundle = useCallback(
    async (params: ProductAPI['releaseBundle']['request']) => {
      const res = await clientAPI.product.releaseBundle(params);
      if (res instanceof CustomError) {
        console.error('バンドルの解体に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return null;
      }
      setAlertState({
        message: 'バンドルの解体に成功しました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI.product, setAlertState],
  );

  return {
    listBundleItems,
    createBundle,
    releaseBundle,
    updateBundle,
  };
};
