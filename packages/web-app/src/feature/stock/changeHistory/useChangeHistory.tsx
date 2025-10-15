import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useStore } from '@/contexts/StoreContext';
import { ProductStockHistorySourceKind } from '@prisma/client';
import { getProductStockHistoryApi } from 'api-generator';
import { MycaPosApiClient } from 'api-generator/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';

export type ProductChangeHistory = z.infer<
  (typeof getProductStockHistoryApi)['response']
>['histories'][number];
interface params {
  sourceKind?: ProductStockHistorySourceKind; //変動の種類を指定
  productId?: number; //変動対象の商品ID
  skip?: number;
  take?: number;
}

//在庫の変動履歴を取得
export const useChangeHistory = () => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();

  const [isLoading, setIsLoading] = useState(false);
  const [params, setParams] = useState<params>();
  const [histories, setHistories] = useState<ProductChangeHistory[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  // リクエストのレース条件を防ぐためのカウンター
  const requestCountRef = useRef(0);

  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({ BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api` }),
    [store.id],
  );

  const fetchStockChangeHistory = useCallback(async () => {
    setIsLoading(true);

    // 現在のリクエストカウントを取得し、インクリメント
    const currentRequestId = ++requestCountRef.current;

    try {
      const response = await mycaPosApiClient.product.getProductStockHistory({
        storeId: store.id,
        sourceKind: params?.sourceKind,
        productId: params?.productId,
        skip: params?.skip,
        take: params?.take || -1, //指定がないなら無制限,
      });

      // レース条件チェック: 最新のリクエストでない場合は処理を中断
      if (currentRequestId !== requestCountRef.current) {
        setIsLoading(false);
        return;
      }

      // idの降順でソート
      const sortedHistories = response.histories
        .map((h) => ({
          ...h,
          product: {
            ...h.product,
            created_at: new Date(h.product.created_at || Date.now()),
            updated_at: new Date(h.product.updated_at || Date.now()),
            sell_price_updated_at: new Date(
              h.product.sell_price_updated_at || Date.now(),
            ),
            buy_price_updated_at: new Date(
              h.product.buy_price_updated_at || Date.now(),
            ),
          },
          datetime: new Date(h.datetime || Date.now()),
        }))
        .sort((a, b) => b.id - a.id);

      setTotalCount(response.totalCount);
      setHistories(sortedHistories);
      return sortedHistories;
    } catch (error) {
      // レース条件チェック: 最新のリクエストでない場合はエラー処理もスキップ
      if (currentRequestId !== requestCountRef.current) {
        setIsLoading(false);
        return;
      }

      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [mycaPosApiClient, handleError, store.id, params]);

  useEffect(() => {
    if (params) {
      fetchStockChangeHistory();
    }
  }, [params, fetchStockChangeHistory]);

  return {
    histories,
    isLoading,
    fetchStockChangeHistory,
    setParams,
    totalCount,
  };
};
