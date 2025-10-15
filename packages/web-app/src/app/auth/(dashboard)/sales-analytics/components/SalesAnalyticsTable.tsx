'use client';

import { useEffect, useState } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAlert } from '@/contexts/AlertContext';
import {
  CustomTabTable,
  ColumnDef,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import { z } from 'zod';
import { getStatsApi } from '@api-defs/stats/def';
import { MycaPosApiClient } from 'api-generator/client';
import { format } from 'date-fns';
import {
  PeriodKindEnum,
  PeriodKindType,
} from '@/app/auth/(dashboard)/sales-analytics/page';

// 型定義を Zod スキーマから抽出
type StatsResponse = z.infer<typeof getStatsApi.response>;
type StatsItem = StatsResponse['data'][number];

interface SalesAnalyticsTableProps {
  storeId: number;
  onSelectStats: (data: StatsItem | null) => void;
  onSelectPeriodKind: (data: PeriodKindType) => void;
  isTaxIncluded: boolean;
}

export const SalesAnalyticsTable: React.FC<SalesAnalyticsTableProps> = ({
  storeId,
  onSelectStats,
  onSelectPeriodKind,
  isTaxIncluded,
}: SalesAnalyticsTableProps) => {
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const { setAlertState } = useAlert();
  const [periodKind, setPeriodKind] = useState<PeriodKindType>(
    PeriodKindEnum.DAY,
  );
  const [statsData, setStatsData] = useState<StatsItem[]>([]);
  const [selected, setSelected] = useState<StatsItem>();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(30);
  const [totalRowCount, setTotalRowCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortKey, setSortKey] = useState<string>('start_day');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 一意なキー生成
  const generateKey = (item: StatsItem): string => {
    return `${periodKind}_${item.start_day}_${item.end_day}`;
  };

  // 表示用の日付フォーマット
  const displayDate = (item: StatsItem): string => {
    const start = format(new Date(item.start_day), 'yyyy/MM/dd');
    const end = format(new Date(item.end_day), 'yyyy/MM/dd');
    if (periodKind === PeriodKindEnum.DAY) return start;
    if (periodKind === PeriodKindEnum.MONTH)
      return format(new Date(item.start_day), 'yyyy/MM');
    return `${start} - ${end}`;
  };

  // 売上分析データをAPIから取得する
  const fetchStats = async (
    kind: typeof periodKind,
    page: number,
    take: number,
  ) => {
    setIsLoading(true);
    try {
      //ここのAPI使ってる意味はある？これのせいで返品込みの利益
      const res = await apiClient.stats.getStats({
        storeId: storeId,
        periodKind: kind,
        take,
        skip: page * take,
        orderBy: `${sortDirection === 'desc' ? '-' : ''}${sortKey}`,
      });

      const converted = res.data.map((item) => ({
        ...item,
        start_day: new Date(item.start_day),
        end_day: new Date(item.end_day),
      }));

      setStatsData(converted);
      setTotalRowCount(res.summary?.totalCount ?? 0);
    } catch (e) {
      setAlertState({
        message: '売上分析の取得に失敗しました。',
        severity: 'error',
      });
      console.error('売上分析の取得に失敗しました', e);
      setStatsData([]); // データ取得に失敗した場合はテーブルを空とする
      setTotalRowCount(0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats(periodKind, currentPage, rowPerPage);
  }, [storeId, periodKind, currentPage, rowPerPage, sortKey, sortDirection]);

  // タブ変更ハンドラ
  const handleTabChange = (value: string) => {
    let kind: typeof periodKind = PeriodKindEnum.DAY;
    switch (value) {
      case 'DAILY':
        kind = PeriodKindEnum.DAY;
        break;
      case 'WEEKLY':
        kind = PeriodKindEnum.WEEK;
        break;
      case 'MONTHLY':
        kind = PeriodKindEnum.MONTH;
        break;
    }
    onSelectStats(null);
    setPeriodKind(kind);
    onSelectPeriodKind(kind);
    setCurrentPage(0);
  };

  // ページネーション用ハンドラ
  const handlePrevPagination = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };
  const handleNextPagination = () => {
    setCurrentPage((prev) => prev + 1);
  };
  const handleRowPerPageChange = (take: number) => {
    setRowPerPage(take);
    setCurrentPage(0);
  };

  // ソートハンドラ
  const handleSort =
    (key: string) => (direction: 'asc' | 'desc' | undefined) => {
      if (!direction) return;

      setSortKey(key);
      setSortDirection(direction);
      setCurrentPage(0); // ページリセット
    };

  // 金額の税込・税別の変換処理
  const getDisplayPrice = (price: number): string => {
    if (isTaxIncluded) {
      return `${price.toLocaleString()}円`;
    } else {
      const taxExcluded = Math.round(price / 1.1);
      return `${taxExcluded.toLocaleString()}円`;
    }
  };

  // カラム定義
  const columns: ColumnDef<StatsItem>[] = [
    {
      header: '日付',
      isSortable: true,
      onSortChange: handleSort('start_day'),
      render: (data) => displayDate(data),
    },
    {
      header: '販売合計',
      isSortable: true,
      onSortChange: handleSort('sell_total_price'),
      render: (data) => getDisplayPrice(data.sell_total_price),
    },
    {
      header: '買取合計',
      isSortable: true,
      onSortChange: handleSort('buy_total_price'),
      render: (data) => getDisplayPrice(data.buy_total_price),
    },
    {
      header: '総在庫金額',
      isSortable: true,
      onSortChange: handleSort('total_wholesale_price'),
      render: (data) => getDisplayPrice(data.total_wholesale_price),
    },
    {
      header: '総客数',
      isSortable: true,
      onSortChange: handleSort('total_count'),
      render: (data) => `${data.total_count.toLocaleString()}人`,
    },
    {
      header: '', // 最後のカラムは矢印アイコンにする
      render: () => <ChevronRightIcon />,
    },
  ];

  // タブ定義
  const tabs: TabDef<StatsItem>[] = [
    {
      label: '日別',
      value: 'DAILY',
    },
    {
      label: '週別',
      value: 'WEEKLY',
    },
    {
      label: '月別',
      value: 'MONTHLY',
    },
  ];

  return (
    <CustomTabTable<StatsItem>
      isShowFooterArea
      currentPage={currentPage}
      rowPerPage={rowPerPage}
      totalRow={totalRowCount}
      handleRowPerPageChange={handleRowPerPageChange}
      handlePrevPagination={handlePrevPagination}
      handleNextPagination={handleNextPagination}
      isSingleSortMode={true}
      data={statsData}
      columns={columns}
      tabs={tabs}
      rowKey={(item) => generateKey(item)}
      onRowClick={(item) => {
        setSelected(item);
        onSelectStats(item);
      }}
      selectedRow={selected}
      onTabChange={handleTabChange}
      isLoading={isLoading}
      tableWrapperSx={{ height: 'calc(100% - 80px)' }}
      tabTableWrapperSx={{ flex: 1 }}
    />
  );
};
