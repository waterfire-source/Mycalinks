import { createClientAPI, CustomError } from '@/api/implement';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';
import { WholesalePriceHistoryResourceType } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';

export const useWholesalePrice = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [wholesalePrice, setWholesalePrice] = useState<
    BackendProductAPI[9]['response']['200'] | undefined
  >(undefined);

  // 単一の商品について仕入れ値を取得
  const fetchWholesalePrice = useCallback(
    async (
      product_id: number,
      itemCount?: number,
      isReturn: boolean = false, // 仕入れ値を返す場合はtrueにする
      reverse?: true,
      resourceType?: WholesalePriceHistoryResourceType,
      resourceID?: number,
    ) => {
      const response = await clientAPI.product.getWholesalePrice({
        storeID: store.id,
        productID: product_id,
        itemCount: itemCount || undefined,
        reverse: reverse || undefined,
        resourceType: resourceType || undefined,
        resourceID: resourceID || undefined,
      });

      if (response instanceof CustomError) {
        console.error('仕入れ値の取得に失敗しました。');
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      setWholesalePrice(response);
      if (isReturn) {
        return response;
      }
    },
    [clientAPI, setAlertState],
  );

  // 複数の商品に対して仕入れ値の合計を取得
  const fetchTotalWholesalePrice = useCallback(
    async (
      storeID: number,
      products: Array<{ product_id: number; stock_number: number }>,
    ) => {
      try {
        const total = await Promise.all(
          products.map(async ({ product_id, stock_number }) => {
            const response = await fetchWholesalePrice(
              product_id,
              stock_number,
              true,
            );
            return response && typeof response.totalWholesalePrice === 'number'
              ? response.totalWholesalePrice
              : 0;
          }),
        ).then((prices) => prices.reduce((acc, price) => acc + price, 0));

        return total;
      } catch (error) {
        console.error('仕入れ値の合計取得に失敗しました:', error);
        setAlertState({
          message: `仕入れ値の合計取得エラー`,
          severity: 'error',
        });
      }
    },
    [fetchWholesalePrice, setAlertState],
  );

  return { wholesalePrice, fetchWholesalePrice, fetchTotalWholesalePrice };
};
