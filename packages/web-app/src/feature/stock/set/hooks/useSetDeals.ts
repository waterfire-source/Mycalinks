import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';

export interface UseSetDealParams {
  createSetDeal: {
    storeID: number;
    displayName: string;
    discountAmount: string;
    startAt: Date;
    expiredAt: Date | null;
    products: {
      productID: number;
      itemCount: number;
    }[];
    imageUrl: string;
  };
  updateSetDeal: {
    storeID: number;
    setDealID: number; // セットID
    displayName: string;
    discountAmount: string;
    startAt: Date;
    expiredAt: Date | null;
    imageUrl: string | undefined;
    products: {
      productID: number;
      itemCount: number;
    }[];
  };
  listSetDeals: {
    storeID: number;
    id?: number;
  };
  deleteSetDeal: {
    storeID: number;
    setDealID: number;
  };
  checkSetDealDiscount: {
    storeID: number;
    carts: {
      productID: number;
      unitPrice: number;
      itemCount: number;
    }[];
  };
}

export const useSetDeals = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  // セット販売を作成
  const createSetDeal = useCallback(
    async (params: UseSetDealParams['createSetDeal']) => {
      const res = await clientAPI.product.createSetDeal(params);
      if (res instanceof CustomError) {
        console.error('セット販売の作成に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        throw new Error('セット販売の作成に失敗しました。');
      }
      setAlertState({
        message: 'セット販売の設定に成功しました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI.product, setAlertState],
  );

  // セット販売を更新
  const updateSetDeal = useCallback(
    async (params: UseSetDealParams['updateSetDeal']) => {
      const res = await clientAPI.product.updateSetDeal(params);
      if (res instanceof CustomError) {
        console.error('セット販売の更新に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return null;
      }
      setAlertState({
        message: 'セット販売の更新に成功しました。',
        severity: 'success',
      });
      return res;
    },
    [clientAPI.product, setAlertState],
  );

  // セット販売の一覧を取得
  const listSetDeals = useCallback(
    async (params: UseSetDealParams['listSetDeals']) => {
      const res = await clientAPI.product.listSetDeals(params);
      if (res instanceof CustomError) {
        console.error('セット販売の取得に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return null;
      }
      return res.setDeals;
    },
    [clientAPI.product, setAlertState],
  );

  // セット販売を削除
  const deleteSetDeal = useCallback(
    async (params: UseSetDealParams['deleteSetDeal']) => {
      const res = await clientAPI.product.deleteSetDeal(params);
      if (res instanceof CustomError) {
        console.error('セット販売の削除に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return false;
      }
      setAlertState({
        message: 'セット販売設定の削除成功しました。',
        severity: 'success',
      });
      return true;
    },
    [clientAPI.product, setAlertState],
  );

  // セット割引額確認
  const checkSetDealDiscount = useCallback(
    async (params: UseSetDealParams['checkSetDealDiscount']) => {
      const res = await clientAPI.product.checkSetDealDiscount(params);
      if (res instanceof CustomError) {
        console.error('セット割引額の確認に失敗しました。');
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

  return {
    createSetDeal,
    updateSetDeal,
    listSetDeals,
    deleteSetDeal,
    checkSetDealDiscount,
  };
};
