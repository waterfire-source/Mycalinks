import { useCallback, useMemo, useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { ProductApiRes } from '@/api/frontend/product/api';

// 在庫変動ログのカスタムフック
export const useProductStockHistory = (
  product_id: number,
  kind: string,
  orderBy: string,
) => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [productStockHistoryList, setProductStockHistoryList] = useState<
    ProductApiRes['listProductStockTransferHistory']['stockHistories']
  >([]);

  const fetchProductStockHistoryList = useCallback(async () => {
    if (!store) return;
    try {
      const response = await clientAPI.product.listProductStockTransferHistory({
        storeID: store.id,
        productID: product_id,
        kind: kind,
        orderBy: orderBy,
      });

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        console.error('在庫履歴データ取得に失敗しました:', response);
        return;
      }

      setProductStockHistoryList(response.stockHistories);
    } catch (error) {
      console.error('在庫履歴データ取得に失敗しました:', error);
    }
  }, [clientAPI.product, setAlertState, store, product_id, kind, orderBy]);

  return {
    productStockHistoryList,
    fetchProductStockHistoryList,
  };
};
