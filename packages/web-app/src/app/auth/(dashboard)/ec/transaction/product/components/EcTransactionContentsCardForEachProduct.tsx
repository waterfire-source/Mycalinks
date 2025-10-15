'use client';

import { useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { useStore } from '@/contexts/StoreContext';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import dayjs from 'dayjs';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { PATH } from '@/constants/paths';
import { useRouter } from 'next/navigation';
import { EcTotalSales } from '@/app/auth/(dashboard)/ec/transaction/product/components/EcTotalSales';
import { EcSearchProduct } from '@/app/auth/(dashboard)/ec/transaction/product/components/EcSearchProduct';
import { EcProductList } from '@/app/auth/(dashboard)/ec/transaction/product/components/EcProductList';
import { useListItemWithEcOrder } from '@/feature/ec/hooks/useListItemWithEcOrder';

export const EcTransactionContentsCardForEachProduct = () => {
  const { store } = useStore();
  const { push } = useRouter();

  // ECの在庫別取引一覧取得
  const {
    items,
    searchState,
    searchTotalCount,
    totalAmount,
    searchDate,
    setSearchDate,
    setSearchState,
    fetchItemsWithEcOrder,
    isLoading,
  } = useListItemWithEcOrder({ storeId: store.id, includesSummary: true });

  useEffect(() => {
    if (store) {
      fetchItemsWithEcOrder();
    }
  }, [fetchItemsWithEcOrder, store]);

  // 検索条件(取引開始日付) が切り替わった際の処理
  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedDate = event.target.value;
    setSearchDate((prev) => ({
      ...prev,
      startDate: selectedDate
        ? dayjs(selectedDate).startOf('day').format('YYYY/MM/DD HH:mm:ss')
        : '',
    }));
    setSearchState((prev) => ({
      ...prev,
      searchCurrentPage: 0,
    }));
  };
  // 検索条件(取引終了日付) が切り替わった際の処理
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    setSearchDate((prev) => ({
      ...prev,
      endDate: selectedDate
        ? dayjs(selectedDate).endOf('day').format('YYYY/MM/DD HH:mm:ss')
        : '',
    }));
    setSearchState((prev) => ({
      ...prev,
      searchCurrentPage: 0,
    }));
  };

  //日付を保持して遷移する
  const handleNavigateToTransactionView = () => {
    const queryParams = new URLSearchParams({
      startDate: searchDate.startDate,
      endDate: searchDate.endDate,
    }).toString();

    push(`${PATH.EC.transaction}?${queryParams}`);
  };

  return (
    <ContainerLayout
      title="EC取引一覧"
      actions={
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <PrimaryButton
            variant="contained"
            onClick={handleNavigateToTransactionView}
          >
            取引ごとに表示する
          </PrimaryButton>
        </Box>
      }
    >
      {/* 検索/販売合計金額 */}
      <Grid
        container
        sx={{
          height: '40px',
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          mt: 1,
        }}
      >
        {/* 検索フォーム */}
        <EcSearchProduct
          searchDate={searchDate}
          handleStartDateChange={handleStartDateChange}
          handleEndDateChange={handleEndDateChange}
          searchState={searchState}
          setSearchState={setSearchState}
        />

        {/* 合計金額*/}
        <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
          <EcTotalSales totalAmount={totalAmount} />
        </Box>
      </Grid>

      {/* 商品リスト */}
      <Grid container spacing={1} sx={{ flex: 1, overflow: 'auto', mt: 1 }}>
        <EcProductList
          storeId={store.id}
          items={items}
          searchTotalCount={searchTotalCount}
          searchState={searchState}
          setSearchState={setSearchState}
          searchDate={searchDate}
          isLoading={isLoading}
        />
      </Grid>
    </ContainerLayout>
  );
};
