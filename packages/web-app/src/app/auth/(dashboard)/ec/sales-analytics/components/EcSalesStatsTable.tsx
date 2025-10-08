import { useState, useEffect } from 'react';
import { EcSalesStatsTableContent } from '@/app/auth/(dashboard)/ec/sales-analytics/components/EcSalesStatsTableContent';
import {
  useListSalesStats,
  EcStatsFetchParams,
} from '@/feature/ec/hooks/useListSalesStats';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';

type Props = {
  onRowClick?: (item: any) => void;
  isTaxIncluded?: boolean;
};

export const EcSalesStatsTable = ({
  onRowClick,
  isTaxIncluded = true,
}: Props) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { fetchingStats, totalCount, ecSalesStats, listSalesStats } =
    useListSalesStats();

  const [currentPage, setCurrentPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(30);
  const [selectedTab, setSelectedTab] =
    useState<EcStatsFetchParams['periodKind']>('day');
  const [sortField, setSortField] = useState<string>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchData = async () => {
    const params: any = {
      periodKind: selectedTab,
      skip: currentPage * rowPerPage,
      take: rowPerPage,
    };

    if (sortField && sortField !== 'none') {
      params.orderBy = sortDirection === 'desc' ? `-${sortField}` : sortField;
    } else {
      params.orderBy = '-start_day';
    }

    const ok = await listSalesStats(params);

    if (!ok)
      return setAlertState({
        message: 'EC売上分析の取得に失敗しました',
        severity: 'error',
      });
  };

  const handleTabChange = (value: string) => {
    if (value === 'day' || value === 'week' || value === 'month') {
      setSelectedTab(value);
      setCurrentPage(0); // タブ変更時はページを0にリセット
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowPerPageChange = (newRowPerPage: number) => {
    setRowPerPage(newRowPerPage);
    setCurrentPage(0); // ページサイズ変更時はページを0にリセット
  };

  const handlePrevPagination = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPagination = () => {
    handlePageChange(currentPage + 1);
  };

  const handleSortChange =
    (field: string) => (direction: 'asc' | 'desc' | undefined) => {
      if (direction) {
        setSortField(field);
        setSortDirection(direction);
      } else {
        setSortField('none');
      }
      setCurrentPage(0);
    };

  // 初回データ取得
  useEffect(() => {
    fetchData();
  }, [
    selectedTab,
    currentPage,
    rowPerPage,
    sortField,
    sortDirection,
    store.id,
  ]);

  return (
    <EcSalesStatsTableContent
      ecSalesStats={ecSalesStats}
      loading={fetchingStats}
      totalCount={totalCount}
      currentPage={currentPage}
      rowPerPage={rowPerPage}
      onTabChange={handleTabChange}
      onRowPerPageChange={handleRowPerPageChange}
      onPrevPagination={handlePrevPagination}
      onNextPagination={handleNextPagination}
      onSortChange={handleSortChange}
      onRowClick={onRowClick}
      isTaxIncluded={isTaxIncluded}
    />
  );
};
