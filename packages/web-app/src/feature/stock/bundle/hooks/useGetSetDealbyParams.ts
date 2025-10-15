import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useSetDeals } from '@/feature/stock/set/hooks/useSetDeals';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import { useStore } from '@/contexts/StoreContext';
import { useListSetProducts } from '@/feature/stock/bundle/hooks/useListSetProducts';

// クエリパラメータ、URLパラメータのどちらかにbundle_idがある場合はそれを取得する
export const useGetSetByParams = () => {
  const { store } = useStore();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [setItem, setSetItem] = useState<BundleSetProductType>();
  const { listSetDeals } = useSetDeals();
  const { listSetProducts, products } = useListSetProducts();

  const getSetDealId = useCallback(() => {
    // URLパラメータがある場合はそれを取得
    if (id) {
      return Number(id);
    }
    // クエリパラメータがある場合はそれを取得
    if (searchParams.get('setDealId')) {
      return Number(searchParams.get('setDealId'));
    }
    return null;
  }, [id, searchParams]);

  const fetchSet = useCallback(async () => {
    const setDealId = getSetDealId();
    if (!setDealId) {
      return;
    }
    const res = await listSetDeals({ storeID: store.id, id: setDealId });
    if (res && res.length > 0) {
      // 取得したセット商品をBundleSetProductTypeに変換
      const setDeal = res[0];
      const newSetProducts: BundleSetProductType = {
        id: setDeal.id,
        displayName: setDeal.displayName,
        createdAt: setDeal.createdAt,
        updatedAt: setDeal.updatedAt,
        imageUrl: setDeal.imageUrl,
        products: setDeal.products.map((product) => ({
          productID: product.productID,
          itemCount: product.itemCount,
          setDealID: product.setDealID,
        })),
        productType: 'set',
        setDiscountAmount: setDeal.discountAmount,
        startAt: setDeal.startAt,
        expiredAt: setDeal.expiredAt,
      };
      await listSetProducts(newSetProducts);
      setSetItem(newSetProducts);
    }
  }, [listSetDeals, listSetProducts]);

  useEffect(() => {
    fetchSet();
  }, [fetchSet]);

  return { setItem, products, fetchSet };
};
