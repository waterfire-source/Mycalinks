import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';
import { useStore } from '@/contexts/StoreContext';

export const useListArrivalPrice = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [arrivalPrices, setArrivalPrices] = useState<number[] | undefined>(
    undefined,
  );
  const { store } = useStore();

  // 単一の商品について仕入れ値を取得
  const fetchArrivalPrices = useCallback(
    async (
      productID: number,
      itemCount: number, // 在庫数を指定
    ) => {
      const response = await clientAPI.product.getWholesalePrice({
        storeID: store.id,
        productID: productID,
        itemCount: itemCount,
        reverse: undefined,
        resourceType: undefined,
        resourceID: undefined,
      });

      if (response instanceof CustomError) {
        console.error('仕入れ値の取得に失敗しました。');
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      const arrivalPrices = response.originalWholesalePrices.map(
        (price) => price.unit_price,
      );
      // 同じ価格が複数ある場合は、削除する
      const uniqueArrivalPrices = [...new Set(arrivalPrices)];
      setArrivalPrices(uniqueArrivalPrices);
    },
    [clientAPI.product, setAlertState, store.id],
  );

  return { arrivalPrices, fetchArrivalPrices };
};
