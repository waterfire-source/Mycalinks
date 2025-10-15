'use client';

import { useState } from 'react';
import { Box, Tabs, Tab, Typography, useTheme } from '@mui/material';
import { Theme, SxProps } from '@mui/material/styles';
import { DetailCard } from '@/components/cards/DetailCard';
import { SimpleButtonWithIcon } from '@/components/buttons/SimpleButtonWithIcon';
import { z } from 'zod';
import { getStatsApi } from '@api-defs/stats/def';
import { format } from 'date-fns';
import {
  PeriodKindEnum,
  PeriodKindType,
  TransactionKindEnum,
  TransactionKindType,
} from '@/app/auth/(dashboard)/sales-analytics/page';
import { SellDetailContent } from '@/app/auth/(dashboard)/sales-analytics/components/SellDetailContent';
import { BuyDetailContent } from '@/app/auth/(dashboard)/sales-analytics/components/BuyDetailContent';
import { StockDetailContent } from '@/app/auth/(dashboard)/sales-analytics/components/StockDetailContent';
import { DetailAnalyticsModal } from '@/app/auth/(dashboard)/sales-analytics/components/DetailAnalyticsModal';

// 型定義を Zod スキーマから抽出
type StatsResponse = z.infer<typeof getStatsApi.response>;
type StatsItem = StatsResponse['data'][number];

interface DetailContentProps {
  storeId: number;
  selectedPeriodKind: PeriodKindType;
  selectedStats: StatsItem | null;
  isTaxIncluded: boolean;
}

export type RowItem = {
  label: string;
  value: string;
  children?: RowItem[];
};

export function DetailContent({
  storeId,
  selectedPeriodKind,
  selectedStats,
  isTaxIncluded,
}: DetailContentProps) {
  const theme = useTheme();

  // 表示用の日付フォーマット
  const displayDate = (item: StatsItem): string => {
    const start = format(new Date(item.start_day), 'yyyy/MM/dd');
    const end = format(new Date(item.end_day), 'yyyy/MM/dd');
    if (selectedPeriodKind === PeriodKindEnum.DAY) return start;
    if (selectedPeriodKind === PeriodKindEnum.MONTH)
      return format(new Date(item.start_day), 'yyyy/MM');
    return `${start} - ${end}`;
  };

  // タブ切り替え
  const [transactionKind, setTransactionKind] = useState<TransactionKindType>(
    TransactionKindEnum.SELL,
  );
  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: TransactionKindType,
  ) => {
    setTransactionKind(newValue);
  };

  // タブのデザイン
  const getTabSx = (
    theme: Theme,
    kind: TransactionKindType,
  ): SxProps<Theme> => ({
    backgroundColor:
      transactionKind === kind
        ? kind === TransactionKindEnum.SELL
          ? theme.palette.secondary.main
          : kind === TransactionKindEnum.BUY
          ? theme.palette.primary.main
          : theme.palette.grey[700]
        : theme.palette.common.white,
    color:
      transactionKind === kind
        ? theme.palette.common.white
        : theme.palette.common.black,
    borderTopLeftRadius: '5px',
    borderTopRightRadius: '5px',
    border: `1px solid ${theme.palette.grey[700]}`,
    borderBottom: 'none',
    minWidth: '120px',
    minHeight: '31px',
    fontSize: theme.typography.body1.fontSize,
    textAlign: 'center',
    margin: 0,
    padding: '8px 10px',
  });

  // ジャンル別売上分析モーダルの表示
  const [showGenreAnalyticsModal, setShowGenreAnalyticsModal] = useState(false);
  const handleGenreAnalyticsModal = () => {
    setShowGenreAnalyticsModal(true);
  };

  return (
    <Box
      sx={{
        zIndex: '3',
        height: '100%',
        ml: '10px',
      }}
    >
      <Box
        sx={{
          width: '100%',
        }}
      >
        <Tabs
          value={transactionKind}
          onChange={handleTabChange}
          textColor="inherit"
          sx={{
            minHeight: '31px',
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab
            label="販売"
            value={TransactionKindEnum.SELL}
            sx={getTabSx(theme, TransactionKindEnum.SELL)}
          />
          <Tab
            label="買取"
            value={TransactionKindEnum.BUY}
            sx={getTabSx(theme, TransactionKindEnum.BUY)}
          />
          <Tab
            label="在庫"
            value={TransactionKindEnum.STOCK}
            sx={getTabSx(theme, TransactionKindEnum.STOCK)}
          />
        </Tabs>
      </Box>

      <Box sx={{ height: 'calc(100% - 88px)' }}>
        <DetailCard
          title={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                height: '41px',
              }}
            >
              <Box>
                <Typography variant="h1" color="text.secondary">
                  {selectedStats ? displayDate(selectedStats) : ''}
                </Typography>
              </Box>
              <Box>
                <SimpleButtonWithIcon
                  onClick={handleGenreAnalyticsModal}
                  disabled={!selectedStats}
                >
                  詳細分析
                </SimpleButtonWithIcon>
              </Box>
            </Box>
          }
          titleTextColor={'text.secondary'}
          titleBackgroundColor={
            transactionKind === TransactionKindEnum.STOCK
              ? 'grey.700'
              : transactionKind === TransactionKindEnum.BUY
              ? 'primary.main'
              : transactionKind === TransactionKindEnum.SELL
              ? 'secondary.main'
              : 'common.white'
          }
          titleSx={{ borderRadius: 0 }}
          containerSx={{
            border: '1px solid #fff',
            maxHeight: 'calc(100% - 20px)',
          }}
          content={
            <>
              {transactionKind === TransactionKindEnum.SELL && (
                <SellDetailContent
                  storeId={storeId}
                  selectedStats={selectedStats}
                  isTaxIncluded={isTaxIncluded}
                />
              )}
              {transactionKind === TransactionKindEnum.BUY && (
                <BuyDetailContent
                  storeId={storeId}
                  selectedStats={selectedStats}
                  isTaxIncluded={isTaxIncluded}
                />
              )}
              {transactionKind === TransactionKindEnum.STOCK && (
                <StockDetailContent
                  storeId={storeId}
                  selectedStats={selectedStats}
                  isTaxIncluded={isTaxIncluded}
                />
              )}
            </>
          }
        />
      </Box>

      {/* フッター部分 */}
      <Box
        sx={{
          width: '100%',
          height: '57px',
          backgroundColor: 'common.white',
          boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.1)',
          '@media (max-width: 1400px)': {
            height: '51px',
          },
        }}
      />

      {/* 詳細分析モーダル（共通コンポーネント使用） */}
      <DetailAnalyticsModal
        open={showGenreAnalyticsModal}
        onClose={() => setShowGenreAnalyticsModal(false)}
        storeId={storeId}
        selectedStats={selectedStats}
        selectedDate={selectedStats ? displayDate(selectedStats) : ''}
        isTaxIncluded={isTaxIncluded}
        type={
          transactionKind === TransactionKindEnum.SELL
            ? 'sell'
            : transactionKind === TransactionKindEnum.BUY
            ? 'buy'
            : 'stock'
        }
      />
    </Box>
  );
}
