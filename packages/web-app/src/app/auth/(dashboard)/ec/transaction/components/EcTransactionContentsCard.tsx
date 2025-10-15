'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, TextField } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/contexts/StoreContext';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import dayjs from 'dayjs';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { PATH } from '@/constants/paths';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { EcTransactionTab } from '@/app/auth/(dashboard)/ec/transaction/components/EcTransactionTab';
import {
  EcOrderByStoreInfoType,
  EcOrderSearchState,
  platformKind,
  PlatformKindEnum,
} from '@/app/auth/(dashboard)/ec/transaction/type';
import { EcTransactionDetail } from '@/app/auth/(dashboard)/ec/transaction/components/EcTransactionDetail';
import { EcTotalSales } from '@/app/auth/(dashboard)/ec/transaction/product/components/EcTotalSales';
import { MycaPosApiClient } from 'api-generator/client';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { useErrorAlert } from '@/hooks/useErrorAlert';
export const EcTransactionContentsCard = () => {
  const { store } = useStore();
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const { handleError } = useErrorAlert();
  const [isLoading, setIsLoading] = useState(false);
  const { genre, fetchGenreList } = useGenre();
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // 取引一覧
  const [transactions, setTransactions] = useState<EcOrderByStoreInfoType[]>(
    [],
  );

  // 選択された取引
  const [selectedTransaction, setSelectedTransaction] =
    useState<EcOrderByStoreInfoType | null>(null);
  // 取引が切り替わった際の処理
  const handleTransactionChange = (item: EcOrderByStoreInfoType | null) => {
    setSelectedTransaction(item);
  };
  // 取引販売合計
  const [totalAmount, setTotalAmount] = useState(0);
  // 取引総数
  const [searchTotalCount, setSearchTotalCount] = useState<number>(0);

  // 検索条件
  const [searchState, setSearchState] = useState<EcOrderSearchState>({
    transactionID: undefined,
    productName: undefined,
    genreId: undefined,
    platform: undefined,
    orderBy: undefined,
    searchCurrentPage: 0,
    searchItemPerPage: 30,
  });

  // ページ変更
  const handleRowPerPageChange = (newItemPerPage: number) => {
    setSearchState((prev) => {
      return {
        ...prev,
        searchCurrentPage: 0,
        searchItemPerPage: newItemPerPage,
      };
    });
  };
  // 前のページ
  const handlePrevPagination = () => {
    if (searchState.searchCurrentPage > 0) {
      setSearchState((prev) => {
        return {
          ...prev,
          searchCurrentPage: prev.searchCurrentPage - 1,
        };
      });
    }
  };
  // 次のページ
  const handleNextPagination = () => {
    if (
      searchState.searchCurrentPage * searchState.searchItemPerPage <
      searchTotalCount
    ) {
      setSearchState((prev) => {
        return {
          ...prev,
          searchCurrentPage: prev.searchCurrentPage + 1,
        };
      });
    }
  };

  // タブ(ジャンル)が切り替わった際の処理
  const handleTabChange = (value: string) => {
    const newSearchGenreId: number | undefined =
      value !== 'all' ? Number(value) : undefined;
    setSearchState((prev) => ({
      ...prev,
      genreId: newSearchGenreId,
      searchCurrentPage: 0,
    }));
  };
  // 検索条件（プラットフォーム）が切り替わった際の処理
  const handlePlatformChange = (platformName: string) => {
    const targetPlatform = platformKind.find(
      (item) => item.shopName === platformName,
    );
    setSearchState((prev) => ({
      ...prev,
      platform: targetPlatform?.id as PlatformKindEnum,
      searchCurrentPage: 0,
    }));
  };

  // ソート条件（受注日時）が切り替わった際の処理
  const handleSortOrderedAt = (direction: 'asc' | 'desc' | undefined) => {
    setSearchState((prev) => {
      if (direction === undefined) {
        const { orderBy, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        orderBy: `${direction === 'desc' ? '-' : ''}ordered_at`,
        searchCurrentPage: 0,
      };
    });
  };

  // 検索条件(日付) (初回レンダリング時に query を考慮)
  const [searchDate, setSearchDate] = useState(() => {
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    return {
      startDate:
        startDateParam || dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss'),
      endDate:
        endDateParam || dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    };
  });

  //一覧検索処理
  const fetchEcTransactionData = useCallback(async () => {
    setIsLoading(true);
    const apiClient = new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    });

    try {
      const response = await apiClient.ec.getEcOrderByStore({
        storeId: store.id,
        id: searchState.transactionID,
        orderBy: searchState.orderBy,
        skip: searchState.searchCurrentPage * searchState.searchItemPerPage,
        take: searchState.searchItemPerPage,
        includesSummary: true,
        orderedAtGte: dayjs(searchDate.startDate).toISOString(),
        orderedAtLt: dayjs(searchDate.endDate).toISOString(),
        productDisplayName: searchState.productName,
        genreId: searchState.genreId,
        platform: searchState.platform,
      });

      setTransactions(response.storeOrders);
      setSearchTotalCount(response.summary?.totalCount ?? 0);

      // 合計額を計算
      const totals = response.storeOrders.reduce(
        (acc: any, { total_price = 0 }: any) => {
          acc.sell += total_price;
          return acc;
        },
        { sell: 0 },
      );
      setTotalAmount(totals.sell);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [searchDate, searchState, handleError]);

  useEffect(() => {
    if (store) fetchEcTransactionData();
  }, [fetchEcTransactionData, store]);

  // 日付変更
  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedDate = event.target.value;
    if (selectedDate) {
      setSearchDate((prev) => ({
        ...prev,
        startDate: dayjs(selectedDate)
          .startOf('day')
          .format('YYYY/MM/DD HH:mm:ss'),
      }));
    } else {
      setSearchDate((prev) => ({ ...prev, startDate: '' }));
    }
    setSearchState((prev) => ({
      ...prev,
      searchCurrentPage: 0,
    }));
  };
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    if (selectedDate) {
      setSearchDate((prev) => ({
        ...prev,
        endDate: dayjs(selectedDate).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
      }));
    } else {
      setSearchDate((prev) => ({ ...prev, endDate: '' }));
    }
    setSearchState((prev) => ({
      ...prev,
      searchCurrentPage: 0,
    }));
  };

  const handleNavigateToProductView = () => {
    const queryParams = new URLSearchParams({
      startDate: searchDate.startDate,
      endDate: searchDate.endDate,
    }).toString();

    push(`${PATH.EC.transaction_product}?${queryParams}`);
  };

  //ジャンルの取得
  useEffect(() => {
    fetchGenreList();
  }, [store.id, fetchGenreList]);

  return (
    <ContainerLayout
      title="EC取引一覧"
      actions={
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <PrimaryButton
            variant="contained"
            onClick={handleNavigateToProductView}
            sx={{ marginLeft: 5 }}
          >
            商品ごとに表示する
          </PrimaryButton>
        </Box>
      }
    >
      {/* 検索条件 */}
      <Grid
        container
        sx={{
          height: '40px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
          mt: 1,
        }}
      >
        <TextField
          placeholder="商品名"
          type="text"
          size="small"
          value={searchState.productName}
          onChange={(event) =>
            setSearchState((prev) => ({
              ...prev,
              productName: event.target.value,
              currentPage: 0,
            }))
          }
          sx={{ width: 200, backgroundColor: 'white' }}
          InputLabelProps={{ sx: { color: 'black' } }}
        />
        <NumericTextField
          placeholder="注文番号"
          size="small"
          value={searchState.transactionID}
          onChange={(value) => {
            {
              const targetId = value === 0 ? undefined : value;
              setSearchState((prev) => ({
                ...prev,
                transactionID: targetId,
              }));
            }
          }}
          sx={{ width: 100, backgroundColor: 'white' }}
          noSpin
        />
        {/* 日付 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '4px',
            alignItems: 'center',
          }}
        >
          <TextField
            label="取引日時"
            type="date"
            size="small"
            value={
              searchDate.startDate
                ? dayjs(searchDate.startDate).format('YYYY-MM-DD')
                : ''
            }
            onChange={handleStartDateChange}
            sx={{ width: 160, backgroundColor: 'white' }}
            InputLabelProps={{
              shrink: true,
              sx: { color: 'black' },
            }}
          />
          <Typography>~</Typography>
          <TextField
            type="date"
            size="small"
            value={
              searchDate.endDate
                ? dayjs(searchDate.endDate).format('YYYY-MM-DD')
                : ''
            }
            onChange={handleEndDateChange}
            sx={{ width: 160, backgroundColor: 'white' }}
            InputLabelProps={{
              shrink: true,
              sx: { color: 'black' },
            }}
          />
        </Box>

        {/* 合計金額 */}
        <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
          <EcTotalSales totalAmount={totalAmount} />
        </Box>
      </Grid>

      <Grid container spacing={1} sx={{ flex: 1, overflow: 'auto', mt: 1 }}>
        <Grid item xs={8} sx={{ height: '100%' }}>
          <EcTransactionTab
            transactions={transactions}
            selectedTransaction={selectedTransaction}
            handleTransactionChange={handleTransactionChange}
            totalCount={searchTotalCount}
            searchState={searchState}
            handleSortOrderedAt={handleSortOrderedAt}
            handleRowPerPageChange={handleRowPerPageChange}
            handlePrevPagination={handlePrevPagination}
            handleNextPagination={handleNextPagination}
            genre={genre}
            handleTabChange={handleTabChange}
            handlePlatformChange={handlePlatformChange}
            isLoading={isLoading}
          />
        </Grid>

        <Grid item xs={4} sx={{ height: 'calc(100% - 40px)', mt: '40px' }}>
          {/* 選択された取引を詳細表示 */}
          <EcTransactionDetail
            selectedTransaction={selectedTransaction}
            isReturnModalOpen={isReturnModalOpen}
            setIsReturnModalOpen={setIsReturnModalOpen}
          />
        </Grid>
      </Grid>
    </ContainerLayout>
  );
};
