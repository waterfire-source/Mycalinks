'use client';
import { useDateTransactions } from '@/feature/transaction/hooks/useDateTransactions';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Store, Transaction } from '@prisma/client';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

// Props の型を定義
interface Props {
  store: Store;
}

//共通関数：sales データから buy & sell の合計金額を計算
const calculateAmounts = (transactions: any) => {
  if (!transactions?.sales) return { buy: 0, sell: 0 };
  const amounts = transactions.sales.reduce(
    (
      acc: { buy: number; sell: number },
      sale: {
        total_price: number;
        transaction_kind: Transaction['transaction_kind'];
      },
    ) => {
      if (sale.transaction_kind === 'buy') {
        acc.buy += sale.total_price;
      } else if (sale.transaction_kind === 'sell') {
        acc.sell += sale.total_price;
      }
      return acc;
    },
    { buy: 0, sell: 0 },
  );
  return amounts;
};

//前日比比 / 前月比を計算する関数
const calculateChangeRate = (current: number, previous: number) => {
  if (previous === 0) return '0.0%';
  const rate = ((current - previous) / previous) * 100;
  return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}% ${rate >= 0 ? '↑' : '↓'}`;
};

//取引情報表示コンポーネント
const TransactionSummary = ({
  title,
  amount,
  changeRate,
  color,
  text,
}: {
  title: string;
  amount: number;
  changeRate: string;
  color: string;
  text?: string;
}) => (
  <Grid item xs={6}>
    <Box textAlign="left">
      <Typography>{title}</Typography>
      <Box display="flex" justifyContent="left" alignItems="center" gap={2}>
        <Typography sx={{ color: color }} fontWeight="bold" fontSize={20}>
          {amount.toLocaleString()}円
        </Typography>
        <Typography variant="caption">
          {text}
          {changeRate}
        </Typography>
      </Box>
    </Box>
  </Grid>
);

export const TransactionAmountCard = ({ store }: Props) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1400)); // 画面幅1400px以下

  // 取引データの取得
  const {
    transactions: todaysTransactions,
    fetchListTransactions: fetchTodaysTransactions,
  } = useDateTransactions(store.id);
  const {
    transactions: yesterdaysTransactions,
    fetchListTransactions: fetchYesterdaysTransactions,
  } = useDateTransactions(store.id);
  const {
    transactions: thisMonthsTransactions,
    fetchListTransactions: fetchThisMonthsTransactions,
  } = useDateTransactions(store.id);
  const {
    transactions: lastMonthsTransactions,
    fetchListTransactions: fetchLastMonthsTransactions,
  } = useDateTransactions(store.id);

  //合計金額の state
  const [amounts, setAmounts] = useState({
    today: { buy: 0, sell: 0 },
    yesterday: { buy: 0, sell: 0 },
    thisMonth: { buy: 0, sell: 0 },
    lastMonth: { buy: 0, sell: 0 },
  });

  //日付範囲をメモ化
  const dateRanges = useMemo(
    () => ({
      today: {
        start: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        end: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      },
      yesterday: {
        start: dayjs()
          .subtract(1, 'day')
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ss'),
        end: dayjs()
          .subtract(1, 'day')
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss'),
      },
      thisMonth: {
        start: dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
        end: dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
      },
      lastMonth: {
        start: dayjs()
          .subtract(1, 'month')
          .startOf('month')
          .format('YYYY-MM-DD HH:mm:ss'),
        end: dayjs()
          .subtract(1, 'month')
          .endOf('month')
          .format('YYYY-MM-DD HH:mm:ss'),
      },
    }),
    [],
  );

  // ✅ 各期間のデータ取得を実行
  useEffect(() => {
    fetchTodaysTransactions(dateRanges.today.start, dateRanges.today.end);
    fetchYesterdaysTransactions(
      dateRanges.yesterday.start,
      dateRanges.yesterday.end,
    );
    fetchThisMonthsTransactions(
      dateRanges.thisMonth.start,
      dateRanges.thisMonth.end,
    );
    fetchLastMonthsTransactions(
      dateRanges.lastMonth.start,
      dateRanges.lastMonth.end,
    );
  }, [
    fetchTodaysTransactions,
    fetchYesterdaysTransactions,
    fetchThisMonthsTransactions,
    fetchLastMonthsTransactions,
    dateRanges,
  ]);

  // ✅ 取得したデータから合計を計算して state を更新
  useEffect(() => {
    setAmounts({
      today: calculateAmounts(todaysTransactions),
      yesterday: calculateAmounts(yesterdaysTransactions),
      thisMonth: calculateAmounts(thisMonthsTransactions),
      lastMonth: calculateAmounts(lastMonthsTransactions),
    });
  }, [
    todaysTransactions,
    yesterdaysTransactions,
    thisMonthsTransactions,
    lastMonthsTransactions,
  ]);

  return (
    <Card
      sx={{
        border: '1px solid #ccc',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '& .MuiCardContent-root': {
          flexGrow: 1,
          overflow: 'hidden',
        },
      }}
    >
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                width: 10,
                height: 10,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                mr: 1,
              }}
            />
            <Typography>売上情報</Typography>
          </Box>
        }
        sx={{
          borderBottom: '1px solid #ccc',
          bgcolor: 'white',
          p: 1.5,
        }}
      />

      <CardContent sx={{ height: '100%', p: 1 }}>
        <Box
          sx={{
            px: 1,
            height: '100%',
            maxHeight: isSmallScreen ? '200px' : '300px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'white',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
            },
          }}
        >
          <Grid container spacing={1} justifyContent="center">
            {/* 本日 */}
            <TransactionSummary
              title="本日の販売"
              amount={amounts.today.sell}
              changeRate={calculateChangeRate(
                amounts.today.sell,
                amounts.yesterday.sell,
              )}
              color="secondary.main"
              text={'前日比'}
            />
            <TransactionSummary
              title="本日の買取"
              amount={amounts.today.buy}
              changeRate={calculateChangeRate(
                amounts.today.buy,
                amounts.yesterday.buy,
              )}
              color="primary.main"
              text={'前日比'}
            />

            {/* 今月 */}
            <TransactionSummary
              title="今月の販売"
              amount={amounts.thisMonth.sell}
              changeRate={calculateChangeRate(
                amounts.thisMonth.sell,
                amounts.lastMonth.sell,
              )}
              color="secondary.main"
              text={'先月比'}
            />
            <TransactionSummary
              title="今月の買取"
              amount={amounts.thisMonth.buy}
              changeRate={calculateChangeRate(
                amounts.thisMonth.buy,
                amounts.lastMonth.buy,
              )}
              color="primary.main"
              text={'先月比'}
            />
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
