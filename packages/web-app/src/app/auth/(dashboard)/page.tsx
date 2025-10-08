'use client';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Grid } from '@mui/material';
import { TransactionAmountCard } from '@/feature/dashboard/components/TransactionAmountCard';
import { OutOfStockTodayCard } from '@/feature/dashboard/components/OutOfStockTodayCard';
import { TopTransactionsItemCard } from '@/feature/dashboard/components/TopTransactionsItemCard';
import { ArrivalCard } from '@/feature/dashboard/components/ArrivalCard';
import { MemoCard } from '@/feature/dashboard/components/MemoCard';
import { useStore } from '@/contexts/StoreContext';

export default function Dashboard() {
  const { store } = useStore();

  // store が null の場合、何も表示しない
  if (!store) return null;

  return (
    <ContainerLayout
      title="ダッシュボード"
      helpArchivesNumber={1005}
      descriptionAlign="left"
    >
      <Grid
        container
        spacing={2}
        columns={10}
        sx={{ height: '100%', minHeight: 0 }}
      >
        {/* 左カラム (4/10) */}
        <Grid item xs={4} sx={{ height: '100%' }}>
          <Grid
            container
            direction="column"
            spacing={1}
            sx={{ height: '100%' }}
          >
            <Grid item sx={{ height: '30%' }}>
              <TransactionAmountCard store={store} />
            </Grid>
            <Grid item sx={{ height: '70%' }}>
              <OutOfStockTodayCard store={store} />
            </Grid>
          </Grid>
        </Grid>

        {/* 右カラム (6/10) */}
        <Grid item xs={6} sx={{ height: '100%', minHeight: 0 }}>
          <Grid
            container
            direction="column"
            spacing={1}
            sx={{ height: '100%' }}
          >
            <Grid item sx={{ height: '50%', minHeight: 0 }}>
              <TopTransactionsItemCard store={store} />
            </Grid>
            <Grid item sx={{ height: '50%', minHeight: 0 }}>
              <Grid
                container
                spacing={1}
                columns={10}
                sx={{ height: '100%', minHeight: 0 }}
              >
                <Grid item xs={5} sx={{ height: '100%', minHeight: 0 }}>
                  <ArrivalCard store={store} />
                </Grid>
                <Grid item xs={5} sx={{ height: '100%', minHeight: 0 }}>
                  <MemoCard store={store} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ContainerLayout>
  );
}
