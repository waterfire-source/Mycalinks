'use client';

import { useState } from 'react';
import { Box, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { z } from 'zod';
import { useStore } from '@/contexts/StoreContext';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { getStatsApi } from '@api-defs/stats/def';
import { SalesAnalyticsTable } from '@/app/auth/(dashboard)/sales-analytics/components/SalesAnalyticsTable';
import { DetailContent } from '@/app/auth/(dashboard)/sales-analytics/components/DetailContent';
import { KobutsuExportModal } from '@/app/auth/(dashboard)/sales-analytics/components/KobutsuExportModal';
import { ActionSelectModal } from '@/components/modals/ActionSelectModal';
import { MycaPosApiClient } from 'api-generator/client';
import { useAlert } from '@/contexts/AlertContext';
import { CustomError } from '@/api/implement';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useRouter } from 'next/navigation';

// 型定義を Zod スキーマから抽出
type StatsResponse = z.infer<typeof getStatsApi.response>;
type StatsItem = StatsResponse['data'][number];

// MEMO: API側のEnum設定を参照できなかったため独自定義
export const PeriodKindEnum = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
} as const;
export type PeriodKindType =
  (typeof PeriodKindEnum)[keyof typeof PeriodKindEnum];

export const TransactionKindEnum = {
  SELL: 'SELL',
  BUY: 'BUY',
  STOCK: 'STOCK',
} as const;
export type TransactionKindType =
  (typeof TransactionKindEnum)[keyof typeof TransactionKindEnum];

export default function SalesAnalyticsPage() {
  const { store } = useStore();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const [selectedStats, setSelectedStats] = useState<StatsItem | null>(null);
  const [selectedPeriodKind, setSelectedPeriodKind] = useState<PeriodKindType>(
    PeriodKindEnum.DAY,
  );
  const [loading, setLoading] = useState(false);
  const { push } = useRouter();
  const [showKobutsuExportModal, setShowKobutsuExportModal] = useState(false);
  const [selectCsvModeModal, setSelectCsvModeModal] = useState(false);
  const [taxMode, setTaxMode] = useState<'exclusive' | 'inclusive'>(
    'inclusive',
  );

  const handleTaxModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: 'exclusive' | 'inclusive' | null,
  ) => {
    if (newValue !== null) {
      setTaxMode(newValue);
    }
  };

  const downloadCsv = async (periodKind: PeriodKindType) => {
    try {
      setLoading(true);
      const res = await apiClient.stats.getStatsCsv({
        storeId: store.id,
        groupBy: periodKind,
      });

      if (res instanceof CustomError) throw res;

      push(res.fileUrl);
    } catch (e) {
      handleError(e);
      setAlertState({
        severity: 'error',
        message: 'CSVのダウンロードに失敗しました。',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateTransactionStats = async () => {
    await apiClient.stats.calculateTransactionStats({
      storeId: store.id,
    });
    alert('取引集計が完了しました');
    window.location.reload();
  };
  const handleCalculateProductStats = async () => {
    await apiClient.stats.calculateProductStats({
      storeId: store.id,
    });
    alert('在庫集計が完了しました');
    window.location.reload();
  };

  const actions = (
    <>
      {/* 税込・税別切り替え */}
      <Box
        sx={{
          width: '90%',
          display: 'flex',
          justifyContent: 'flex-start',
          ml: 1,
        }}
      >
        <ToggleButtonGroup
          value={taxMode}
          exclusive
          onChange={handleTaxModeChange}
          size="small"
          color="primary"
        >
          <ToggleButton value="exclusive">税別</ToggleButton>
          <ToggleButton value="inclusive">税込</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* CSV出力ボタン */}
      <Box
        sx={{
          width: '90%',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
        }}
      >
        {process.env.NEXT_PUBLIC_DATABASE_KIND == 'staging' && (
          <SecondaryButton onClick={() => handleCalculateTransactionStats()}>
            本日分取引集計実行
          </SecondaryButton>
        )}
        {process.env.NEXT_PUBLIC_DATABASE_KIND == 'staging' && (
          <SecondaryButton onClick={() => handleCalculateProductStats()}>
            本日分在庫集計実行
          </SecondaryButton>
        )}
        <SecondaryButton onClick={() => setShowKobutsuExportModal(true)}>
          古物台帳出力
        </SecondaryButton>
        <SecondaryButton onClick={() => setSelectCsvModeModal(true)}>
          csv出力
        </SecondaryButton>
      </Box>
    </>
  );

  return (
    <ContainerLayout
      title="売上分析"
      helpArchivesNumber={1479}
      actions={actions}
    >
      <Box
        sx={{
          height: '100%',
          width: '100%',
          position: 'relative',
        }}
      >
        <Grid
          container
          sx={{
            height: '100%',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* テーブルエリア */}
          <Grid item xs={8} sx={{ height: '100%' }}>
            <SalesAnalyticsTable
              storeId={store.id}
              onSelectStats={setSelectedStats}
              onSelectPeriodKind={setSelectedPeriodKind}
              isTaxIncluded={taxMode === 'inclusive'}
            />
          </Grid>

          {/* 詳細エリア */}
          <Grid
            item
            xs={4}
            sx={{
              height: '100%',
            }}
          >
            <DetailContent
              storeId={store.id}
              selectedPeriodKind={selectedPeriodKind}
              selectedStats={selectedStats}
              isTaxIncluded={taxMode === 'inclusive'}
            ></DetailContent>
          </Grid>
        </Grid>
      </Box>

      <KobutsuExportModal
        open={showKobutsuExportModal}
        onClose={() => setShowKobutsuExportModal(false)}
      ></KobutsuExportModal>
      {/* CSV出力モーダル */}
      <ActionSelectModal
        isOpen={selectCsvModeModal}
        onClose={() => setSelectCsvModeModal(false)}
        option1={{
          label: '日別',
          onClick: () => {
            downloadCsv('day');
          },
        }}
        option2={{
          label: '週別',
          onClick: () => {
            downloadCsv('week');
          },
        }}
        option3={{
          label: '月別',
          onClick: () => {
            downloadCsv('month');
          },
        }}
        loading={loading}
      />
    </ContainerLayout>
  );
}
