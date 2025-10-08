import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { ApiError, MycaPosApiClient } from 'api-generator/client';
import { useState, useEffect, useCallback, useMemo } from 'react';

export type CsvHistory = {
  id: string;
  fileName: string;
  status: 'QUEUED' | 'PROCESSING' | 'FINISHED' | 'ERRORED';
  startedAt: string;
  queuedCount: number;
  processedCount: number;
  targetData: string[];
  progressRate: string;
};

type CsvHistoryResponse = Awaited<
  ReturnType<MycaPosApiClient['task']['getTask']>
>;

type Props = {
  count: number;
};

export const useGetCsvHistory = ({ count }: Props) => {
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );

  const { setAlertState } = useAlert();
  const { store } = useStore();
  const [csvHistories, setCsvHistories] = useState<CsvHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.task.getTask({
        storeId: store.id,
        source: 'CSV',
        take: count,
      });

      const csvData: CsvHistory[] = res.tasks.map((task) => {
        //API都合の単位からシンプルな件数へ
        const queuedCount =
          task.total_queued_task_count * task.item_count_per_task;

        const processedCount =
          task.total_processed_task_count * task.item_count_per_task;

        const progressRate = ((processedCount / queuedCount) * 100).toFixed(1);

        const fileName = task.metadata.find(
          (meta: any) => meta.kind === 'csvFileName',
        )?.fileName;

        const jst = task.started_at
          ? new Date(task.started_at).toLocaleString('ja-JP', {
              timeZone: 'Asia/Tokyo',
              hour12: false,
            })
          : undefined;

        const tagData = task.metadata.find(
          (meta: any) =>
            meta.kind === 'itemCsvOption' || meta.kind === 'productCsvOption',
        );

        const labelMap: Record<string, string> = {
          changeDisplayName: '商品名',
          changeDisplayNameRuby: '商品名カナ',
          changeExpansion: 'エキスパンション',
          changeCardNumber: 'カード番号',
          changeRarity: 'レアリティ',
          changePackName: 'パック名',
          changeKeyword: 'キーワード',
          changeReadOnlyProductCode: 'JANコード',
          changeOrderNumber: '表示順',
          changeSellPrice: '販売価格',
          changeBuyPrice: '買取価格',
          changeIsBuyOnly: '買取専用',
          changeTabletAllowed: 'タブレットで販売可能',
          changeInfiniteStock: '在庫無限',
          changeDisallowRound: '端数処理無効設定',
          changeHidden: '非表示',
          changeSpecificSellPrice: '独自販売価格',
          changeSpecificBuyPrice: '独自買取価格',
          stocking: '仕入れを行う',
          printLabel: 'ラベル印刷',
          mycalinksEcEnabled: 'Mycalinks Mall出品',
          ochanokoProductId: 'おちゃのこ在庫ID',
        };

        const tags = Object.entries(tagData)
          .filter(
            ([key, value]) =>
              key !== 'kind' && value === true && key in labelMap,
          )
          .map(([key]) => labelMap[key]);

        return {
          id: task.process_id,
          fileName: fileName ?? '-',
          status: task.status,
          startedAt: jst ?? '-',
          queuedCount: queuedCount,
          processedCount: processedCount,
          targetData: tags,
          progressRate: progressRate,
        };
      });

      setCsvHistories(csvData);
    } catch (err) {
      if (err instanceof ApiError) {
        setAlertState({ message: err.message, severity: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [count, store.id]);

  useEffect(() => {
    updateHistory();
  }, [store.id, updateHistory]);

  return { isLoading, csvHistories, updateHistory };
};
