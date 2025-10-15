'use client';

import { useMemo, useCallback } from 'react';
import { useCart } from '@/app/ec/(core)/hooks/useCart';
import { EcProduct } from '@/app/ec/(core)/components/DetailContent';

/**
 * カート内の統合された商品の数量を計算するカスタムフック
 * 同じカードの異なる状態（コンディション）の商品をグループ化して合計数量を取得
 */
export const useCartUnifiedCount = (product: EcProduct) => {
  const { draftCart } = useCart();

  // カート内の統合された商品の数量を計算（既存ロジックを使用）
  const cartUnifiedCount = useMemo(() => {
    if (!draftCart?.cart_stores || !product._unifiedGroup) {
      return 0;
    }

    let totalCount = 0;

    // カート内の該当店舗の商品をチェック
    for (const store of draftCart.cart_stores) {
      if (store.store_id === product.store.id) {
        for (const cartProduct of store.products) {
          // 統合グループ内の商品がカートに入っている場合
          const isInUnifiedGroup = product._unifiedGroup.products.some(
            (groupProduct) => groupProduct.id === cartProduct.product_id,
          );
          if (isInUnifiedGroup) {
            totalCount += cartProduct.original_item_count;
          }
        }
      }
    }

    return totalCount;
  }, [draftCart, product._unifiedGroup, product.store.id]);

  // 最大利用可能在庫数を計算
  const maxAvailableStock = useMemo(() => {
    return product._unifiedGroup && product._unifiedGroup.products.length > 1
      ? product._unifiedGroup.totalQuantity
      : product.ec_stock_number;
  }, [product._unifiedGroup, product.ec_stock_number]);

  // 統合グループがある場合の推奨初期選択数量を計算
  const getInitialSelectedCount = useCallback(
    (itemCount: number): number => {
      if (product._unifiedGroup && product._unifiedGroup.products.length > 1) {
        // 統合グループがある場合：カート内統合数量と商品在庫数の大きい方
        return Math.max(cartUnifiedCount, itemCount);
      } else {
        // 単体商品の場合：商品在庫数
        return itemCount;
      }
    },
    [cartUnifiedCount, product._unifiedGroup],
  );

  return {
    cartUnifiedCount,
    maxAvailableStock,
    getInitialSelectedCount,
    hasUnifiedGroup:
      product._unifiedGroup && product._unifiedGroup.products.length > 1,
  };
};
