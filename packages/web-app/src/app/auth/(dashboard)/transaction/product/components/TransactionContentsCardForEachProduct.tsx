'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Grid, Stack } from '@mui/material';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { SimpleButtonWithIcon } from '@/components/buttons/SimpleButtonWithIcon';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { createClientAPI, CustomError } from '@/api/implement';
import dayjs from 'dayjs';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { PATH } from '@/constants/paths';
import { TotalSalesOrPurchases } from '@/app/auth/(dashboard)/transaction/product/components/TotalSalesOrPurchases';
import { useListItemsWithTransaction } from '@/feature/transaction/hooks/useListItemsWithTransaction';
import { SearchProduct } from '@/app/auth/(dashboard)/transaction/product/components/SearchProduct';
import { ProductList } from '@/app/auth/(dashboard)/transaction/product/components/ProductList'; // 変更後の ProductList
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Transaction } from 'backend-core';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  isShow?: boolean; // 情報を見せるかどうか
  customerId?: number; // 顧客単位のデータの場合は、顧客IDを付与する
}

export const TransactionContentsCardForEachProduct = ({
  isShow = true,
  customerId,
}: Props) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { push } = useRouter();
  const { handleError } = useErrorAlert();

  // customerId が渡された場合のみ、検索条件に追加
  const searchParamsFromNext = useSearchParams();
  const searchParams = useMemo(() => {
    const params = new URLSearchParams(searchParamsFromNext.toString());
    if (customerId != null) {
      params.set('customer_id', customerId.toString());
    }
    return params;
  }, [searchParamsFromNext, customerId]);

  // 販売合計＆買取合計
  const [totalTransactionAmount, setTotalTransactionAmount] = useState({
    buy: 0,
    sell: 0,
  });

  // 商品マスタごとの取引一覧取得
  const {
    items,
    searchState,
    searchTotalCount,
    totalAmount,
    searchDate,
    setSearchDate,
    setSearchState,
    fetchItemsWithTransaction,
    isLoading,
  } = useListItemsWithTransaction(store.id, true, true, true, searchParams);

  useEffect(() => {
    if (store) {
      fetchItemsWithTransaction();
      fetchTransactionData();
    }
  }, [fetchItemsWithTransaction, store]);

  //合計金額を出すため取引ごとの一覧を取得
  const fetchTransactionData = useCallback(async () => {
    const response = await clientAPI.transaction.listTransactions({
      id: undefined,
      store_id: store.id,
      status: undefined,
      transaction_kind: undefined,
      payment_method: undefined,
      finishedAtStart: searchDate.startDate
        ? new Date(searchDate.startDate)
        : undefined,
      finishedAtEnd: searchDate.endDate
        ? new Date(searchDate.endDate)
        : undefined,
      includeSales: true,
      includeStats: true,
      includeSummary: true,
      productName: undefined,
      skip: searchState.searchCurrentPage * searchState.searchItemPerPage,
      take: searchState.searchItemPerPage,
    });

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }
    //合計額を計算
    if (response.sales.length > 0) {
      const amounts = response.sales.reduce(
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
      setTotalTransactionAmount(amounts);
    } else {
      setTotalTransactionAmount({ buy: 0, sell: 0 });
    }
  }, [
    searchDate,
    searchState.searchCurrentPage,
    searchState.searchItemPerPage,
  ]);

  // 日付変更
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
  };
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    setSearchDate((prev) => ({
      ...prev,
      endDate: selectedDate
        ? dayjs(selectedDate).endOf('day').format('YYYY/MM/DD HH:mm:ss')
        : '',
    }));
  };

  // CSVダウンロード
  const [isDownloading, setIsDownloading] = useState(false);
  // CSV種類選択用のstate
  // const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  // const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  // const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
  //   null,
  // );

  // CSVダウンロード選択画面を開く
  // const handleClickDownload = () => {
  //   setCsvDialogOpen(true);
  // };

  // 実際のCSVダウンロード処理
  const handleDownloadCsv = async () => {
    setIsDownloading(true);

    const apiClient = new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    });

    if (!searchDate.startDate || !searchDate.endDate) {
      setAlertState({
        message: '日付を選択してください',
        severity: 'error',
      });
      return;
    }

    try {
      const res = await apiClient.stats.getTransactionStatsProductCsv({
        storeId: store.id!,
        targetDayGte: new Date(searchDate.startDate).toISOString(),
        targetDayLte: new Date(searchDate.endDate).toISOString(),
        genreId: searchState.searchGenreId,
        categoryId: searchState.searchCategoryId,
      });

      window.location.href = res.fileUrl;
      // setCsvDialogOpen(false);
    } catch (error) {
      handleError(error);
    }

    setIsDownloading(false);
  };

  //日付を保持して遷移する
  const handleNavigateToTransactionView = () => {
    const queryParams = new URLSearchParams({
      startDate: searchDate.startDate,
      endDate: searchDate.endDate,
    }).toString();

    push(`${PATH.TRANSACTION}?${queryParams}`);
  };

  return (
    <ContainerLayout
      title={!isShow ? '' : '取引一覧'}
      helpArchivesNumber={isShow ? 853 : undefined}
      showTitle={isShow}
      actions={
        isShow && (
          <Box
            sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <PrimaryButton
              variant="contained"
              onClick={handleNavigateToTransactionView}
            >
              取引ごとに表示する
            </PrimaryButton>
          </Box>
        )
      }
    >
      {/* 検索/ダウンロードボタン */}
      <Grid
        container
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          mt: 1,
          rowGap: 1,
        }}
      >
        {/* 検索フォーム */}
        <SearchProduct
          searchDate={searchDate}
          handleStartDateChange={handleStartDateChange}
          handleEndDateChange={handleEndDateChange}
          setSearchState={setSearchState}
        />

        {/* 合計金額 / ソート */}
        <Box
          sx={{
            display: 'flex',
            alignItems: isShow ? 'end' : 'start',
            gap: 1,
          }}
        >
          <TotalSalesOrPurchases
            totalAmount={totalTransactionAmount}
            type="sell"
            handleStartDateChange={handleStartDateChange}
          />
          <TotalSalesOrPurchases
            totalAmount={totalTransactionAmount}
            type="buy"
            handleStartDateChange={handleStartDateChange}
          />
          {isShow && (
            <Stack direction="row" gap={1}>
              <SimpleButtonWithIcon
                onClick={handleDownloadCsv}
                loading={isDownloading}
              >
                CSVダウンロード
              </SimpleButtonWithIcon>
              <HelpIcon helpArchivesNumber={330} />
            </Stack>
          )}
        </Box>
      </Grid>

      {/* 商品リスト (CustomTab + テーブル) */}
      <Grid container spacing={1} sx={{ flex: 1, overflow: 'auto', mt: 1 }}>
        <ProductList
          storeId={store.id}
          items={items}
          searchTotalCount={searchTotalCount}
          searchState={searchState}
          setSearchState={setSearchState}
          searchDate={searchDate}
          isLoading={isLoading}
          customerId={customerId}
        />
      </Grid>
      {/* CSV種類選択モーダル */}
      {/* <CsvDownloadModal
        open={csvDialogOpen}
        onClose={() => setCsvDialogOpen(false)}
        onDownload={handleDownloadCsv}
        selectedGenreId={selectedGenreId}
        setSelectedGenreId={setSelectedGenreId}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        isDownloading={isDownloading}
      /> */}
    </ContainerLayout>
  );
};
