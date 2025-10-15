import { CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { getEcOrderStatsApi, getEcStatsApi } from 'api-generator';
import { MycaPosApiClient } from 'api-generator/client';
import { useMemo, useState } from 'react';
import z from 'zod';

export type EcStatsFetchParams = z.infer<
  (typeof getEcStatsApi.request)['query']
>;
export type EcSalesStat = z.infer<
  typeof getEcStatsApi.response.shape.data
>[number];

export type EcSalesDetailFetchParams = Omit<
  z.infer<typeof getEcOrderStatsApi.request.query>,
  'commissionRate'
>;

export type EcSalesDetail = z.infer<typeof getEcOrderStatsApi.response>;

export const useListSalesStats = () => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();

  const [fetchingStats, setFetchingStats] = useState(false);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [ecSalesStats, setEcSalesStats] = useState<EcSalesStat[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<
    EcSalesDetail | undefined
  >(undefined);

  const mycaPosAPIClient = useMemo(
    () =>
      new MycaPosApiClient({ BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api` }),
    [store.id],
  );

  const listSalesStats = async (params: EcStatsFetchParams) => {
    try {
      setFetchingStats(true);
      const res = await mycaPosAPIClient.stats.getEcStats({
        storeId: store.id,
        ...params,
      });

      if (res instanceof CustomError) throw res;

      const converted = res.data.map((d) => ({
        ...d,
        start_day: new Date(d.start_day),
        end_day: new Date(d.end_day),
      }));

      setTotalCount(res.summary.totalCount);
      setEcSalesStats(converted);
      return res;
    } catch (err) {
      handleError(err);
    } finally {
      setFetchingStats(false);
    }
  };

  const findEcSalesDetail = async (params: EcSalesDetailFetchParams) => {
    try {
      setFetchingDetail(true);

      const res = await mycaPosAPIClient.stats.getEcOrderStats({
        storeId: store.id,
        ...params,
      });

      if (res instanceof CustomError) throw res;

      const converted = {
        ...res,
        start_day: res.start_day ? new Date(res.start_day) : null,
        end_day: res.end_day ? new Date(res.end_day) : null,
      };

      setSelectedDetail(converted);
      return converted;
    } catch (err) {
      handleError(err);
    } finally {
      setFetchingDetail(false);
    }
  };

  return {
    fetchingStats,
    totalCount,
    ecSalesStats,
    listSalesStats,
    findEcSalesDetail,
    fetchingDetail,
  };
};
