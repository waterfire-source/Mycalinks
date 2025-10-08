import { CustomError } from '@/api/implement';
import { useStores } from '@/app/hooks/useStores';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { getAllStoreItemApi } from 'api-generator';
import { MycaPosApiClient } from 'api-generator/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import z from 'zod';

type FetchRequestQuery = z.infer<typeof getAllStoreItemApi.request.query>;
type Response = z.infer<typeof getAllStoreItemApi.response>;
export type AllStoreProduct = Response['items'][number]['products'][number] & {
  storeDisplayName: string;
};

export const useGetAllStoreProducts = () => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();
  const { fetchStores, stores } = useStores();

  const [allProducts, setAllProducts] = useState<AllStoreProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [allStoreMap, setAllStoreMap] = useState<Map<number, string>>(
    new Map(),
  );
  const [pendingRequest, setPendingRequest] =
    useState<FetchRequestQuery | null>(null);

  const currentReqId = useRef(0);

  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({ BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api` }),
    [store.id],
  );

  const resetProducts = useCallback(() => {
    setAllProducts([]);
    setHasMore(true);
  }, []);

  const fetchAllStoreProducts = async (requestQuery?: FetchRequestQuery) => {
    // storeMapが空の場合はリクエストを保留
    if (allStoreMap.size === 0) {
      setPendingRequest(requestQuery || null);
      return;
    }

    setLoading(true);

    const reqId = ++currentReqId.current;

    try {
      const response = await mycaPosApiClient.item.getAllStoreItem(requestQuery || {});

      if (response instanceof CustomError) throw response;

      if (reqId !== currentReqId.current) return;

      // 重複を除去しながらflatmap
      const uniqueProductsMap = response.items.reduce((map, item) => {
        item.products.forEach((p) => {
          if (!map.has(p.id)) {
            map.set(p.id, p);
          }
        });
        return map;
      }, new Map());

      const converted = Array.from(uniqueProductsMap.values()).map((p) => {
        return {
          ...p,
          created_at: new Date(p.created_at || Date.now()),
          updated_at: new Date(p.updated_at || Date.now()),
          sell_price_updated_at: new Date(
            p.sell_price_updated_at || Date.now(),
          ),
          buy_price_updated_at: new Date(p.buy_price_updated_at || Date.now()),
          condition_option: p.condition_option
            ? {
                ...p.condition_option,
                created_at: new Date(
                  p.condition_option.created_at || Date.now(),
                ),
              }
            : null,
          specialty: p.specialty
            ? {
                ...p.specialty,
                created_at: new Date(p.specialty.created_at || Date.now()),
                updated_at: new Date(p.specialty.updated_at || Date.now()),
              }
            : null,
          storeDisplayName: allStoreMap.get(p.store_id) || '',
        };
      });

      setAllProducts((prev) => {
        // 既存データをMapに変換して新データをマージ
        const allProductsMap = new Map(prev.map((p) => [p.id, p]));

        // 新しいproductsを追加（既存IDは上書きされない）
        converted.forEach((p) => {
          if (!allProductsMap.has(p.id)) {
            allProductsMap.set(p.id, p);
          }
        });

        return Array.from(allProductsMap.values());
      });

      // より正確なhasMore判定
      const expectedDataCount = requestQuery?.take || 30;
      const actualUniqueProducts = uniqueProductsMap.size;

      // 1. レスポンスアイテム数が期待値未満 = 最後のページ
      // 2. 実際に追加されたユニークproduct数が0 = 全て重複で新規データなし
      setHasMore(
        response.items.length >= expectedDataCount && actualUniqueProducts > 0,
      );

      return response;
    } catch (err) {
      if (reqId !== currentReqId.current) return;
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAllStoreMap(new Map(stores.map((s) => [s.id, s.display_name || ''])));
  }, [stores]);

  // storeMapが初期化されたときに保留中のリクエストを実行
  useEffect(() => {
    if (allStoreMap.size > 0 && pendingRequest !== null) {
      const request = pendingRequest;
      setPendingRequest(null);
      fetchAllStoreProducts(request);
    }
  }, [allStoreMap]);

  useEffect(() => {
    fetchStores();
  }, []);

  return { fetchAllStoreProducts, allProducts, loading, hasMore, resetProducts };
};
