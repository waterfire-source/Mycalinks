import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { useGetItem } from '@/feature/item/hooks/useGetItem';
import { ItemType } from '@prisma/client';
import { useListBundleProducts } from '@/feature/stock/bundle/hooks/useListBundleProducts';

// クエリパラメータ、URLパラメータのどちらかにbundle_idがある場合はそれを取得する
export const useGetBundleByParams = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { fetchItem } = useGetItem();
  const [bundleItem, setBundleItem] = useState<ItemAPIRes['get']['items'][0]>();
  const { listBundleProducts, products } = useListBundleProducts();

  const getBundleId = useCallback(() => {
    // URLパラメータがある場合はそれを取得
    if (params.bundle_id) {
      return Number(params.bundle_id);
    }
    // 新しいクエリパラメータ形式（id）
    if (searchParams.get('id')) {
      return Number(searchParams.get('id'));
    }
    // 旧クエリパラメータ形式（bundleId）
    if (searchParams.get('bundleId')) {
      return Number(searchParams.get('bundleId'));
    }
    return null;
  }, [params, searchParams]);
  const fetchBundle = useCallback(async () => {
    const bundleId = getBundleId();
    if (!bundleId) {
      return;
    }
    const res = await fetchItem(bundleId, ItemType.BUNDLE);
    if (res) {
      setBundleItem(res);
      await listBundleProducts(res);
    }
  }, [fetchItem, getBundleId, listBundleProducts]);

  useEffect(() => {
    fetchBundle();
  }, [fetchBundle]);

  return { bundleItem, products, fetchBundle };
};
