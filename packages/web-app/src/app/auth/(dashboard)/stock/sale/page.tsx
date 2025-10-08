'use client';

import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Stack, Grid, Box } from '@mui/material';
import {
  CustomTabTable,
  ColumnDef,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { useStores } from '@/app/hooks/useStores';
import { TransactionKind, SaleStatus } from '@prisma/client';
import dayjs from 'dayjs';
import { getRepeatPatternLabel } from '@/feature/sale/utils/repeatPatternUtils';
import SaleRegistrationModal from '@/components/modals/sale/SaleRegistrationModal';
import SaleDepartmentDetailModal from '@/components/modals/sale/SaleDepartmentDetailModal';
import SaleItemDetailModal from '@/components/modals/sale/SaleItemDetailModal';
import { SaleRule } from '@prisma/client';
import { getTransactionKindName } from '@/feature/transaction/utlis';
import { useSale, SaleTab } from '@/feature/stock/sale/hooks/useSale';
import { CustomError } from '@/api/implement';
import { filterSalesByTransactionKind } from '@/feature/stock/sale/utlis';

// ステータスの表示テキストを取得する関数
const getStatusText = (status: string, onPause: boolean) => {
  switch (status) {
    case 'ON_HELD':
      return onPause ? '中止中' : '実施中';
    case 'NOT_HELD':
      return onPause ? '中止予定' : '実施前';
    case 'FINISHED':
      return onPause ? '終了' : '完了';
    default:
      return '不明';
  }
};

// SaleItemの型定義
export interface SaleItem {
  id: number;
  storeId: number;
  status: SaleStatus;
  onPause: boolean;
  displayName: string;
  transactionKind: TransactionKind;
  startDatetime: Date;
  discountAmount: string | null;
  endDatetime: Date | null;
  endTotalItemCount: number | null;
  endUnitItemCount: number | null;
  repeatCronRule: string | null;
  saleEndDatetime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  products: Array<{
    rule: SaleRule;
    productId: number;
    productName: string;
    productDisplayNameWithMeta: string;
  }>;
  departments: Array<{
    rule: SaleRule;
    itemGenreId: number;
    itemGenreDisplayName: string;
    itemCategoryId: number;
    itemCategoryDisplayName: string;
  }>;
}

/**
 * タブの定義
 */
const saleTabs: TabDef<SaleItem>[] = [
  { label: '実施中', value: SaleTab.ACTIVE },
  { label: '実施前', value: SaleTab.SCHEDULED },
  { label: '完了', value: SaleTab.FINISHED },
  { label: '中止中', value: SaleTab.STOPPED },
  { label: '終了', value: SaleTab.PAUSED },
  { label: 'すべて', value: SaleTab.ALL },
];

export default function SalePage() {
  // セール情報の状態管理
  const [selectedSale, setSelectedSale] = useState<SaleItem | null>(null);
  const [displaySales, setDisplaySales] = useState<SaleItem[]>([]);

  // フィルタリング用の状態管理
  const [selectedTab, setSelectedTab] = useState<SaleTab>(SaleTab.ACTIVE);
  const [filterTransactionKind, setFilterTransactionKind] = useState<
    '販売' | '買取' | 'すべて'
  >('すべて');

  // ローディング状態の管理
  const [isLoading, setIsLoading] = useState(false);

  // モーダルの表示状態管理
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isSaleDepartmentDetailModalOpen, setIsSaleDepartmentDetailModalOpen] =
    useState(false);
  const [isSaleItemDetailModalOpen, setIsSaleItemDetailModalOpen] =
    useState(false);

  // グローバルステートとAPIクライアントの取得
  const { store } = useStore();
  const { stores, fetchStores } = useStores();
  const { fetchSales } = useSale();

  // 店舗の取得
  useEffect(() => {
    fetchStores();
    // 画面遷移時のみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // セールの取得
  useEffect(() => {
    updateSales();
    // セールのステータスが変わった場合に再実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, selectedTab, filterTransactionKind]);

  const updateSales = async () => {
    setIsLoading(true);
    const sales = await fetchSales(store.id, {
      status: selectedTab,
    });
    setIsLoading(false);
    if (sales instanceof CustomError) return;
    const filtered =
      filterTransactionKind !== 'すべて'
        ? filterSalesByTransactionKind(sales, filterTransactionKind)
        : sales;
    setDisplaySales(filtered as SaleItem[]);
  };

  // テーブルのカラム定義
  const columns: ColumnDef<SaleItem>[] = [
    {
      header: 'セール/キャンペーン名',
      key: 'displayName',
      render: (item) => item.displayName,
      sx: { width: '20%' },
      isSortable: true,
    },
    {
      header: 'ステータス',
      key: 'status',
      render: (item) => getStatusText(item.status, item.onPause),
      sx: { width: '10%', textAlign: 'left' },
    },
    {
      header: '販売/買取',
      key: 'transactionKind',
      render: (item) => getTransactionKindName(item.transactionKind),
      filterConditions: ['販売', '買取'],
      sx: { width: '8%', textAlign: 'left' },
      onFilterConditionChange: (condition: string) => {
        setFilterTransactionKind(
          condition ? (condition as '販売' | '買取') : 'すべて',
        );
      },
    },
    {
      header: '対象店舗',
      key: 'store_id',
      render: (item) => {
        const store = stores.find((s) => s.id === item.storeId);
        return store ? store.display_name : `${item.storeId}`;
      },
      sx: { width: '12%', textAlign: 'left' },
    },
    {
      header: '開始日時',
      key: 'startDatetime',
      render: (item) => (
        <Stack>
          <div>{dayjs(item.startDatetime).format('YYYY/MM/DD')}</div>
          <div style={{ fontSize: '0.8em' }}>
            {dayjs(item.startDatetime).format('HH:mm')}
          </div>
        </Stack>
      ),
      isSortable: true,
      sx: { width: '12%', textAlign: 'left' },
    },
    {
      header: '終了日時/条件',
      key: 'endDatetime',
      render: (item) => {
        if (!item.endDatetime) return '-';
        return (
          <Stack>
            <div>{dayjs(item.endDatetime).format('YYYY/MM/DD')}</div>
            <div style={{ fontSize: '0.8em' }}>
              {dayjs(item.endDatetime).format('HH:mm')}
            </div>
          </Stack>
        );
      },
      isSortable: true,
      sx: { width: '12%', textAlign: 'left' },
    },
    {
      header: '繰り返し',
      key: 'repeatCronRule',
      render: (item) => {
        const pattern = getRepeatPatternLabel(
          item.repeatCronRule ?? '',
          item.endDatetime ?? undefined,
        );
        return (
          <Stack spacing={0.5}>
            <div style={{ textAlign: 'left', width: '100%' }}>
              {/* 繰り返し頻度を表示 */}
              {pattern.frequency}
              {/* 終了日時がある場合は終了日時を表示 */}
              {pattern.end &&
                `（${dayjs(pattern.end).format('YYYY/MM/DD')}まで）`}
            </div>
            <div
              style={{
                textAlign: 'left',
                width: '100%',
                fontSize: '0.8em',
                marginLeft: '8px',
                marginTop: '0',
              }}
            >
              {/* 曜日指定がある場合は曜日を表示 */}
              {pattern.weekdays &&
                pattern.weekdays.length > 0 &&
                pattern.weekdays.join('、')}
              {/* 日付指定がある場合は日付を表示 */}
              {pattern.day && `${pattern.day}`}
            </div>
          </Stack>
        );
      },
      sx: { width: '26%', textAlign: 'left' },
    },
  ];

  // イベントハンドラ
  const handleTabChange = (value: string) => {
    setSelectedTab(value as SaleTab);
  };

  const handleOpenRegistrationModal = () => {
    setIsRegistrationModalOpen(true);
  };

  const handleCloseRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
  };

  return (
    <ContainerLayout
      title="セール・キャンペーン一覧"
      helpArchivesNumber={785}
      actions={
        <Stack
          direction="column"
          gap="12px"
          marginLeft="auto"
          marginRight="0px"
        >
          <PrimaryButton
            variant="contained"
            onClick={handleOpenRegistrationModal}
            sx={{ marginLeft: 5 }}
          >
            新規セール・キャンペーン作成
          </PrimaryButton>
        </Stack>
      }
    >
      <Box>
        <Grid container spacing={2} sx={{ position: 'relative' }}>
          <Grid item xs={12} sx={{ height: 'calc(100vh - 203px)', zIndex: 2 }}>
            <CustomTabTable<SaleItem>
              data={displaySales}
              columns={columns}
              tabs={saleTabs}
              rowKey={(item) => item.id}
              onRowClick={(item) => {
                setSelectedSale(item);
                if (item.departments && item.departments.length > 0) {
                  setIsSaleDepartmentDetailModalOpen(true);
                } else {
                  setIsSaleItemDetailModalOpen(true);
                }
              }}
              selectedRow={selectedSale}
              onTabChange={handleTabChange}
              variant="scrollable"
              scrollButtons={false}
              isLoading={isLoading}
              isSingleSortMode={true}
            />
          </Grid>
          <div
            style={{
              height: '57px',
              width: '100%',
              backgroundColor: 'white',
              borderTop: '2px solid #E0E0E0',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 3,
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              backgroundColor: 'white',
              height: 'calc(100vh - 203px)',
              width: '100%',
              zIndex: 1,
            }}
          ></div>
        </Grid>
      </Box>

      {/* モーダルコンポーネント */}
      <SaleRegistrationModal
        open={isRegistrationModalOpen}
        onClose={handleCloseRegistrationModal}
      />
      <SaleDepartmentDetailModal
        open={isSaleDepartmentDetailModalOpen}
        onClose={() => {
          setIsSaleDepartmentDetailModalOpen(false);
        }}
        saleListType={
          ['ON_HELD', 'NOT_HELD'].includes(selectedSale?.status ?? '')
            ? 'active'
            : 'completed'
        }
        selectedSale={selectedSale}
        updateSales={updateSales}
      />
      <SaleItemDetailModal
        open={isSaleItemDetailModalOpen}
        onClose={() => {
          setIsSaleItemDetailModalOpen(false);
        }}
        saleListType={
          ['ON_HELD', 'NOT_HELD'].includes(selectedSale?.status ?? '')
            ? 'active'
            : 'completed'
        }
        selectedSale={selectedSale}
        updateSales={updateSales}
      />
    </ContainerLayout>
  );
}
