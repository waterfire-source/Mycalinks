import { CustomError } from '@/api/implement';
import { MycaPosApiClient } from 'api-generator/client';
import { listStockingApi } from 'api-generator';
import { useStore } from '@/contexts/StoreContext';
import { Stocking } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { z } from 'zod';

export type StockingData = z.infer<
  typeof listStockingApi.response
>['data'][number];

// 検索パラメータの型定義
export type ListStockingParams = {
  id?: number;
  status?: Stocking['status'] | null;
  productName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  pageNum?: number;
  pageSizeParam?: number;
};

export const useListStocking = () => {
  const mycaPosApiClient = useMemo(() => new MycaPosApiClient(), []);
  const { store } = useStore();
  const { handleError } = useErrorAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [stockings, setStockings] = useState<StockingData[]>([]);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const itemsPerPage = 30;

  // フィルター条件を保持
  const [currentFilters, setCurrentFilters] = useState<{
    id?: number;
    status?: Stocking['status'] | null;
    productName?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }>({});

  // 一覧取得
  const listStocking = useCallback(
    async (params: ListStockingParams = {}) => {
      const {
        id,
        status,
        productName,
        startDate,
        endDate,
        pageNum = 0,
        pageSizeParam = itemsPerPage,
      } = params;

      try {
        setIsLoading(true);
        const currentPage = pageNum;
        const currentPageSize = pageSizeParam;

        // フィルター条件を更新
        const filters = {
          id,
          status,
          productName,
          startDate,
          endDate,
        };

        setCurrentFilters(filters);
        const res = await mycaPosApiClient.stocking.listStocking({
          storeId: store.id,
          id: id ?? undefined,
          status: status ?? undefined,
          productName: productName ?? undefined,
          gte: startDate ?? undefined,
          lte: endDate ?? undefined,
          skip: currentPage * currentPageSize,
          take: currentPageSize,
          includesSummary: true,
        });

        if (res instanceof CustomError) throw res;

        const converted = res.data.map((d) => ({
          ...d,
          actual_date: d.actual_date ? new Date(d.actual_date) : null,
        }));
        setStockings(converted);

        // 総件数とページ番号を更新
        setTotalCount(res.totalCount);
        setPage(currentPage);
        return res;
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },

    [mycaPosApiClient.stocking, store.id, handleError, itemsPerPage],
  );

  // 次のページを読み込む関数
  const loadNextPage = useCallback(() => {
    if (totalCount && stockings.length < totalCount) {
      listStocking({
        ...currentFilters,
        pageNum: page + 1,
      });
    }
  }, [listStocking, totalCount, stockings.length, page, currentFilters]);

  return {
    listStocking,
    stockings,
    isLoading,
    totalCount,
    page,
    loadNextPage,
    hasMore: totalCount ? stockings.length < totalCount : false,
  };
};
