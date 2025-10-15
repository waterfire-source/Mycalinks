import { useStore } from '@/contexts/StoreContext';
import { useCreateTransfer } from '@/feature/products/hooks/useCreateTransfer';
import { useAlert } from '@/contexts/AlertContext';
import { useState } from 'react';
import axios from 'axios';
import { Product } from 'backend-core';

export const useSpecialPriceCancellation = () => {
  const { store } = useStore();
  const { createTransferForMultipleItems } = useCreateTransfer();
  const { setAlertState } = useAlert();
  const [loading, setLoading] = useState(false);

  const handleCancelSpecialPrice = async (
    specialProduct: Product,
    callbacks?: {
      fetchProducts?: () => Promise<void>;
      fetchAllProducts?: () => Promise<void>;
    }
  ) => {
    if (!specialProduct) return;
    if (!specialProduct.is_special_price_product) {
      setAlertState && setAlertState({ message: '特価在庫ではありません', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      // 1. itemId取得
      const itemId = specialProduct.item_id;
      // 2. item取得APIでproducts一覧取得
      const res = await axios.get(`/api/store/${store.id}/item/`, {
        params: { id: itemId, includesProducts: true },
      });
      const item = res.data.items?.[0];
      if (!item || !item.products) throw new Error('商品情報の取得に失敗しました');
      // 3. 元在庫product特定
      const originalProduct = item.products.find((p: any) =>
        p.condition_option_id === specialProduct.condition_option_id &&
        (p.specialty_id === undefined || p.specialty_id === specialProduct.specialty_id) &&
        (!p.product_code || p.product_code === 0) &&
        !p.is_special_price_product
      );
      if (!originalProduct) {
        setAlertState && setAlertState({ message: '元在庫が見つかりません', severity: 'error' });
        setLoading(false);
        return;
      }
      // 4. 在庫変換実行
      const count = specialProduct.stock_number;
      if (!count || count <= 0) {
        setAlertState && setAlertState({ message: '特価在庫数が0です', severity: 'error' });
        setLoading(false);
        return;
      }
      const transferRes = await createTransferForMultipleItems(
        store.id,
        specialProduct.id, // 転送元: 特価在庫
        [{
          productId: originalProduct.id, // 転送先: 元在庫
          itemCount: count,
          description: '特価解除',
        }]
      );
      if (transferRes.success) {
        setAlertState && setAlertState({ message: '特価解除が完了しました', severity: 'success' });
        if (callbacks?.fetchProducts) await callbacks.fetchProducts();
        if (callbacks?.fetchAllProducts) await callbacks.fetchAllProducts();
      } else {
        setAlertState && setAlertState({ message: '特価解除に失敗しました', severity: 'error' });
      }
    } catch (e: any) {
      setAlertState && setAlertState({ message: e.message || '特価解除に失敗しました', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return { handleCancelSpecialPrice, loading };
};