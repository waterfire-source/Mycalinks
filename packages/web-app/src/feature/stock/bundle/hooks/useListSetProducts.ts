import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useStore } from '@/contexts/StoreContext';
import { useCallback } from 'react';

export const useListSetProducts = () => {
  const { products, listProductsByProductIDs } = useProducts();
  const { store } = useStore();
  // バンドルItemから紐づくバンドルProductの一覧を取得
  const listSetProducts = useCallback(
    async (setDeal: BundleSetProductType) => {
      const productIDs = setDeal.products?.map((product) => product.productID);
      if (productIDs) {
        await listProductsByProductIDs(store.id, productIDs);
      }
    },
    [listProductsByProductIDs, store.id],
  );

  return { listSetProducts, products };
};
