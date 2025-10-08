import { ItemAPIRes } from '@/api/frontend/item/api';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useStore } from '@/contexts/StoreContext';
import { useCallback } from 'react';

export const useListBundleProducts = () => {
  const { products, listProductsByProductIDs } = useProducts();
  const { store } = useStore();
  // バンドルItemから紐づくバンドルProductの一覧を取得
  const listBundleProducts = useCallback(
    async (bundleItem: ItemAPIRes['get']['items'][0]) => {
      const productIDs = bundleItem.bundle_item_products?.map(
        (product) => product.product_id,
      );
      if (productIDs) {
        await listProductsByProductIDs(store.id, productIDs);
      }
    },
    [listProductsByProductIDs, store.id],
  );

  return { listBundleProducts, products };
};
