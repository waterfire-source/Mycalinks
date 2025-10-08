import { RegisterCashHistorySourceKind } from '@prisma/client';
import { mycaPosCommonConstants } from '@/constants/mycapos';
import { getRegisterCashHistoryDef } from '@/app/api/store/[store_id]/register/def';
import dayjs from 'dayjs';
import { Box, Stack, Typography, Tabs, Tab } from '@mui/material';
import { ReactNode, useEffect, useMemo, useState, useRef } from 'react';
import {
  InfiniteScrollCustomTable,
  ColumnDef,
} from '@/components/tables/InfiniteScrollCustomTable';
import { PaginationNav } from '@/components/pagination/PaginationNav';
import { CashHistorySearchState } from '@/feature/cash/hooks/useCashHistorySearch';

type Props = {
  cashHistories: typeof getRegisterCashHistoryDef.response.history;
  addField: ReactNode;
  searchState: CashHistorySearchState;
  setSearchState: (
    state:
      | CashHistorySearchState
      | ((prev: CashHistorySearchState) => CashHistorySearchState),
  ) => void;
  performSearch: () => void;
};

type ColorDict = {
  [K in RegisterCashHistorySourceKind]: string;
};
// 入出金の文字色
const colorDict: ColorDict = {
  [RegisterCashHistorySourceKind.import]: 'secondary.main',
  [RegisterCashHistorySourceKind.export]: 'primary.main',
  [RegisterCashHistorySourceKind.transaction_buy]: 'text.primary',
  [RegisterCashHistorySourceKind.transaction_buy_return]: 'text.primary',
  [RegisterCashHistorySourceKind.transaction_sell]: 'text.primary',
  [RegisterCashHistorySourceKind.transaction_sell_return]: 'text.primary',
  [RegisterCashHistorySourceKind.reservation_deposit]: 'text.primary',
  [RegisterCashHistorySourceKind.reservation_deposit_return]: 'text.primary',
  [RegisterCashHistorySourceKind.adjust]: 'text.primary',
  [RegisterCashHistorySourceKind.sales]: 'text.primary',
};

export const TabCashTable = ({
  cashHistories,
  addField,
  searchState,
  setSearchState,
  performSearch,
}: Props) => {
  const sourceDict =
    mycaPosCommonConstants.displayNameDict.register.cashHistory.sourceKind;
  const [selectedTab, setSelectedTab] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  type CashHistoryRow = {
    id: number;
    source_kind: RegisterCashHistorySourceKind;
    change_price: number;
    datetime: Date;
    staff_display_name: string | null;
    description: string | null;
  };

  /**
   * テーブルのカラム定義
   */
  const columns: ColumnDef<CashHistoryRow>[] = [
    {
      header: '区分',
      render: (row) => {
        const sourceKind = row.source_kind;
        return (
          <Typography
            sx={{
              color: colorDict[sourceKind] || 'black',
              fontWeight: 'bold',
            }}
          >
            {sourceDict[sourceKind] || ''}
          </Typography>
        );
      },
      sx: { width: '15%', minWidth: 100 },
    },
    {
      header: '金額',
      render: (row) => (
        <Typography>{row.change_price.toLocaleString()}円</Typography>
      ),
      sx: { width: '20%', minWidth: 120 },
    },
    {
      header: '日時',
      render: (row) => (
        <Typography>
          {dayjs(row.datetime).format('YYYY/MM/DD HH:mm')}
        </Typography>
      ),
      sx: { width: '25%', minWidth: 150 },
    },
    {
      header: '担当者',
      render: (row) => <Typography>{row.staff_display_name || ''}</Typography>,
      sx: { width: '20%', minWidth: 120 },
    },
    {
      header: '理由',
      render: (row) => <Typography>{row.description || ''}</Typography>,
      sx: { width: '20%', minWidth: 150, textAlign: 'left' },
    },
  ];

  // タブ
  const getFilteredData = useMemo(() => {
    if (!cashHistories) return [];

    switch (selectedTab) {
      case 0: // 全て
        return cashHistories;
      case 1: // 入金
        return cashHistories.filter(
          (item) =>
            item.source_kind === RegisterCashHistorySourceKind['import'],
        );
      case 2: // 出金
        return cashHistories.filter(
          (item) =>
            item.source_kind === RegisterCashHistorySourceKind['export'],
        );
      default:
        return cashHistories;
    }
  }, [cashHistories, selectedTab]);

  const rows: CashHistoryRow[] = useMemo(
    () =>
      getFilteredData.map((history) => ({
        id: history.id,
        source_kind: history.source_kind,
        change_price: history.change_price,
        datetime: history.datetime,
        staff_display_name: history.staff_display_name,
        description: history.description,
      })),
    [getFilteredData],
  );

  const totalPages = Math.ceil(searchState.totalCount / searchState.pageSize);

  // タブが変更されたらページを1に戻して再検索
  useEffect(() => {
    setSearchState((prev) => ({ ...prev, page: 1 }));
  }, [selectedTab, setSearchState]);

  useEffect(() => {
    if (tableContainerRef.current) {
      const scrollableElement = tableContainerRef.current.querySelector(
        '.MuiTableContainer-root',
      );
      if (scrollableElement) {
        scrollableElement.scrollTop = 0;
      }
    }
  }, [searchState.page]);

  return (
    <Stack height="100%">
      {/* タブ */}
      <Box sx={{ fontSize: '1rem' }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{
            minHeight: 37,
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTab-root': {
              minHeight: 37,
              fontSize: '1rem',
              padding: '8px 10px',
              textTransform: 'none',
              color: 'text.primary',
              backgroundColor: 'white',
              border: '1px solid gray',
              borderBottom: 'none',
              borderRadius: '4px 4px 0 0',
              minWidth: '120px',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
              },
              '&:not(.Mui-selected)': {
                backgroundColor: 'white',
                color: 'text.primary',
              },
            },
          }}
        >
          <Tab label="全て" />
          <Tab label="入金" />
          <Tab label="出金" />
        </Tabs>
      </Box>

      {/* 検索フィールド（入出金日時のUI） */}
      <Box
        sx={{ borderTop: (theme) => `5px solid ${theme.palette.primary.main}` }}
      >
        {addField}
      </Box>

      {/* テーブル */}
      <Box
        ref={tableContainerRef}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <InfiniteScrollCustomTable
            columns={columns}
            rows={rows}
            isLoading={false}
            rowKey={(row) => row.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              borderTop: '1px solid rgba(224, 224, 224, 1)',
              '& .MuiTableContainer-root': {
                flex: 1,
                overflow: 'auto',
              },
              '& .MuiTable-root': {
                tableLayout: 'fixed',
              },
              '& .MuiTableHead-root': {
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: 'white',
              },
              '& .MuiTableRow-root': {
                height: '60px',
              },
              '& .MuiTableCell-root': {
                borderBottom: '1px solid rgba(224, 224, 224, 0.3)',
              },
            }}
          />
        </Box>
        <PaginationNav
          currentPage={searchState.page}
          totalPages={totalPages}
          pageSize={searchState.pageSize}
          totalItems={searchState.totalCount}
          onPageChange={(newPage) => {
            setSearchState((prev) => ({ ...prev, page: newPage }));
            performSearch();
          }}
          onPageSizeChange={(newPageSize) => {
            setSearchState((prev) => ({
              ...prev,
              pageSize: newPageSize,
              page: 1,
            }));
            performSearch();
          }}
        />
      </Box>
    </Stack>
  );
};
