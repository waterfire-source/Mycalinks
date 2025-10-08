'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Grid, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { createClientAPI, CustomError } from '@/api/implement';
import { customDayjs } from 'common';
import {
  Transaction,
  TransactionPaymentMethod,
  TransactionStatus,
} from '@prisma/client';
import { TransactionDetail } from '@/feature/transaction/components/TransactionDetail';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { PATH } from '@/constants/paths';
import { TransactionTab } from '@/app/auth/(dashboard)/transaction/components/TransactionTab';
import { StockDetailModal } from '@/app/auth/(dashboard)/stock/components/detailModal/StockDetailModal';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { useRegister } from '@/contexts/RegisterContext';
import { MycaPosApiClient } from 'api-generator/client';
import { CsvDownloadModal } from '@/app/auth/(dashboard)/transaction/components/CsvDownloadModal';
import { TransactionSearchFilters } from '@/app/auth/(dashboard)/transaction/components/TransactionSearchFilters';
import { TransactionSummarySection } from '@/app/auth/(dashboard)/transaction/components/TransactionSummarySection';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { getTransactionApi } from 'api-generator';
import z from 'zod';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import dayjs from 'dayjs';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

type TransactionKind = 'all' | 'sell' | 'buy' | 'return';
type GetTransactionResponse = z.infer<typeof getTransactionApi.response>;
type MycaPosTransactionItem = GetTransactionResponse['transactions'][number];
type BackendTransactionItem =
  BackendTransactionAPI[5]['response']['200']['transactions'][number];

export interface ListTransactionsSearchState {
  transactionID?: string;
  searchCurrentPage: number;
  searchItemPerPage: number;
  searchProductName?: string;
  transactionKind: TransactionKind | '';
  registerId?: number;
  orderBy?: {
    finishedAt: 'asc' | 'desc' | undefined;
    totalPrice: 'asc' | 'desc' | undefined;
  };
}
// 取引種別を取得する関数
const getTransactionKind = (
  value: string | null,
): Exclude<TransactionKind, 'all'> | '' =>
  ['buy', 'sell', 'return'].includes(value as string)
    ? (value as Exclude<TransactionKind, 'all'>)
    : '';

interface Props {
  customerId?: number;
  isShow?: boolean;
}

export const TransactionContentsCard = ({
  customerId,
  isShow = true,
}: Props) => {
  const { store } = useStore();
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  // 返品がopenAPI化されたら移行したい
  const clientAPI = useMemo(() => createClientAPI(), []);
  const mycaPosAPI = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const { category, fetchCategoryList } = useCategory();
  const { genre, fetchGenreList } = useGenre();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productId, setProductId] = useState<number>();
  const { register } = useRegister();
  // 取引一覧（MycaPosApiClient用の型）
  const [transactions, setTransactions] = useState<MycaPosTransactionItem[]>(
    [],
  );

  // 選択された取引（BackendTransactionAPI用の型に変換済み）
  const [selectedTransaction, setSelectedTransaction] =
    useState<BackendTransactionItem | null>(null);

  // 販売合計＆買取合計
  const [totalAmount, setTotalAmount] = useState({ buy: 0, sell: 0 });

  // 支払い方法フィルタリング用
  const [selectedPaymentMethodKey, setSelectedPaymentMethodKey] = useState<
    TransactionPaymentMethod | undefined
  >(undefined);

  // タブ切り替え用
  const defaultTransactionKind = searchParams.get('transaction_kind');

  // 日付切り替え用
  const [searchDate, setSearchDate] = useState(() => {
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    return {
      startDate:
        startDateParam ||
        (isShow ? dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss') : ''),
      endDate:
        endDateParam || dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    };
  });

  // 取引合計値
  const [searchTotalCount, setSearchTotalCount] = useState<number>(0);

  // 検索条件
  const [searchState, setSearchState] = useState<ListTransactionsSearchState>({
    transactionID: undefined,
    searchCurrentPage: 0,
    searchItemPerPage: 30,
    searchProductName: undefined,
    transactionKind: getTransactionKind(defaultTransactionKind),
    registerId: undefined,
    orderBy: undefined,
  });

  //一覧検索処理
  const fetchTransactionData = useCallback(async () => {
    setIsLoading(true);

    // ソート順を設定、文字列カンマ区切りで結合する
    const orderBy = () => {
      const finishedAt =
        searchState.orderBy?.finishedAt === 'asc'
          ? 'finished_at'
          : searchState.orderBy?.finishedAt === 'desc'
          ? '-finished_at'
          : undefined;
      const totalPrice =
        searchState.orderBy?.totalPrice === 'asc'
          ? 'total_price'
          : searchState.orderBy?.totalPrice === 'desc'
          ? '-total_price'
          : undefined;
      return [finishedAt, totalPrice].filter(Boolean).join(',');
    };

    const response = await mycaPosAPI.transaction.getTransaction({
      id: searchState.transactionID || undefined,
      storeId: store.id,
      status: TransactionStatus.completed,
      transactionKind:
        searchState.transactionKind !== 'all' &&
        searchState.transactionKind !== 'return' &&
        searchState.transactionKind !== ''
          ? searchState.transactionKind
          : undefined,
      isReturn:
        searchState.transactionKind === 'return'
          ? true
          : searchState.transactionKind === 'all' ||
            searchState.transactionKind === ''
          ? undefined
          : false,
      paymentMethod: selectedPaymentMethodKey,
      registerId: searchState.registerId,
      finishedAtStart: searchDate.startDate
        ? new Date(searchDate.startDate).toISOString()
        : undefined,
      finishedAtEnd: searchDate.endDate
        ? new Date(searchDate.endDate).toISOString()
        : undefined,
      includeSales: true,
      includeStats: true,
      includeSummary: true,
      productName: searchState.searchProductName || undefined,
      customerId: customerId || undefined,
      skip: searchState.searchCurrentPage * searchState.searchItemPerPage,
      take: searchState.searchItemPerPage,
      orderBy: orderBy() || undefined,
    });

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }
    //合計額を計算
    if (response?.sales?.length && response.sales.length > 0) {
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
      setTotalAmount(amounts);
    } else {
      setTotalAmount({ buy: 0, sell: 0 });
    }
    if (searchState.transactionKind === 'return') {
      const returnTx = response.transactions.filter((t) => t.is_return);
      setTransactions(returnTx);
      setSearchTotalCount(response?.summary?.total_count ?? 0);
    } else {
      const normalTx = response.transactions.filter((t) => !t.is_return);
      setTransactions(normalTx);
      if (response.summary) {
        setSearchTotalCount(response.summary.total_count ?? 0);
      }
    }

    setIsLoading(false);
  }, [
    mycaPosAPI.transaction,
    setAlertState,
    store.id,
    searchState.transactionKind,
    selectedPaymentMethodKey,
    searchState.transactionID,
    searchState.registerId,
    register?.id,
    searchDate,
    searchState.searchProductName,
    customerId,
    searchState.searchCurrentPage,
    searchState.searchItemPerPage,
    searchState.orderBy,
  ]);

  useEffect(() => {
    if (store) fetchTransactionData();
  }, [fetchTransactionData, store]);

  const handleFetchTransactionData = () => {
    if (store) fetchTransactionData();
  };

  // 日付変更
  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedDate = event.target.value;
    if (selectedDate) {
      setSearchDate((prev) => ({
        ...prev,
        startDate: customDayjs(selectedDate).tz().startOf('day').utc().format(),
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
        endDate: customDayjs(selectedDate).tz().endOf('day').utc().format(),
      }));
    } else {
      setSearchDate((prev) => ({ ...prev, endDate: '' }));
    }
    setSearchState((prev) => ({
      ...prev,
      searchCurrentPage: 0,
    }));
  };

  // タブが切り替わったとき
  const handleTabChange = (transactionKindValue: string) => {
    setSearchState((prev) => ({
      ...prev,
      transactionKind: getTransactionKind(transactionKindValue),
      searchCurrentPage: 0,
    }));
  };

  // 返品処理
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReturnLoading, setIsReturnLoading] = useState(false);
  const handleClickReturn = async (transaction_id: Transaction['id']) => {
    try {
      if (!register) {
        setAlertState({
          message: `レジアカウントで入り直してください。`,
          severity: 'error',
        });
        return;
      }

      setIsReturnLoading(true);

      const response = await clientAPI.transaction.processReturn({
        store_id: store.id,
        transaction_id,
        body: {
          register_id: register.id,
          dontRefund: false,
        },
      });

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      } else {
        setAlertState({
          message: `返品が完了しました`,
          severity: 'success',
        });
        fetchTransactionData();
        setIsReturnModalOpen(false);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsReturnLoading(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  // CSV種類選択用のstate
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvTransactionType, setCsvTransactionType] = useState<
    'sell' | 'buy' | 'return' | 'all'
  >('all');

  // CSVダウンロード選択画面を開く
  const handleClickDownload = () => {
    setCsvDialogOpen(true);
  };

  // 実際のCSVダウンロード処理
  const handleDownloadCsv = async () => {
    try {
      setIsDownloading(true);
      setCsvDialogOpen(false);

      const res = await mycaPosAPI.transaction.getTransactionCsv({
        storeId: store.id!,
        targetDayGte: searchDate.startDate,
        targetDayLte: searchDate.endDate,
        transactionTypes: csvTransactionType,
      });

      if (res instanceof CustomError) throw res;

      setAlertState({
        message: 'CSVダウンロードが完了しました',
        severity: 'success',
      });

      // ダウンロード実行
      if (res.data.fileUrl) {
        window.location.href = res.data.fileUrl;
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNavigateToProductView = () => {
    const queryParams = new URLSearchParams({
      startDate: searchDate.startDate,
      endDate: searchDate.endDate,
    }).toString();

    push(`${PATH.TRANSACTION_PRODUCT}?${queryParams}`);
  };

  //カテゴリの取得
  useEffect(() => {
    fetchCategoryList();
  }, [store.id, fetchCategoryList]);

  //ジャンルの取得
  useEffect(() => {
    fetchGenreList();
  }, [store.id, fetchGenreList]);

  // モーダルを閉じる処理
  const closeModal = () => {
    setIsDetailModalOpen(false);
    setProductId(undefined);
  };

  const returnModalContent = () => {
    if (
      selectedTransaction?.payment_method === TransactionPaymentMethod.square ||
      selectedTransaction?.payment_method === TransactionPaymentMethod.paypay ||
      selectedTransaction?.payment_method === TransactionPaymentMethod.felica
    ) {
      return (
        <>
          <Typography variant="h4" sx={{ mb: 4 }}>
            取引を返品処理しても大丈夫でしょうか？（この操作は取り消せません）
            <br />
            返品処理と同時に、在庫も元に戻ります
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            決済方法に関する注意事項
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>交通系ICの電子マネー：</strong>
            非対応払い戻しは現金でご対応ください。この場合、手数料は払い戻しされませんのでご注意ください。現金による対応の場合もPOSレジには取引記録が残るため、売上に不一致が生じます。
            <br />
            <strong>iDとQUICPay：</strong>
            全額払い戻しのみ対応。一部払い戻しはできません。ご希望の場合は、該当の決済を全額払い戻したうえで、正しい金額で再度決済を行ってください。
            <br />
            <strong>QRコード決済：</strong>
            楽天ペイの取引では、商品ごとの払い戻しおよび一部払い戻しはご利用になれません。
            <br />
            （参考：
            <a href="https://squareup.com/help/jp/ja/article/6116-process-refunds">
              https://squareup.com/help/jp/ja/article/6116-process-refunds
            </a>
            ）
          </Typography>
        </>
      );
    } else {
      return (
        <Typography variant="h4">
          取引を返品処理しても大丈夫でしょうか？（この操作は取り消せません）
          <br />
          返品処理と同時に、在庫も元に戻ります
        </Typography>
      );
    }
  };

  return (
    <ContainerLayout
      title={!isShow ? '' : '取引一覧'}
      helpArchivesNumber={isShow ? 853 : undefined}
      showTitle={isShow}
      actions={
        isShow && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              height: '100%',
            }}
          >
            <PrimaryButton
              variant="contained"
              onClick={handleNavigateToProductView}
              sx={{ marginLeft: 5 }}
            >
              商品ごとに表示する
            </PrimaryButton>
          </div>
        )
      }
    >
      {/* 検索条件 */}
      <TransactionSearchFilters
        searchState={searchState}
        setSearchState={setSearchState}
        searchDate={searchDate}
        handleStartDateChange={handleStartDateChange}
        handleEndDateChange={handleEndDateChange}
      />

      {/* 合計金額 / ソート */}
      <TransactionSummarySection
        totalAmount={totalAmount}
        handleStartDateChange={handleStartDateChange}
        onDownloadClick={handleClickDownload}
        isDownloading={isDownloading}
        isShow={isShow}
      />

      <Grid
        container
        spacing={2}
        sx={{
          height: 'calc(100vh - 280px)',
          overflow: 'hidden',
          mt: 1,
          minHeight: '500px',
        }}
      >
        <Grid
          item
          xs={8}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TransactionTab
            transactions={transactions}
            selectedTransaction={selectedTransaction}
            setSelectedTransaction={(transaction) => {
              setSelectedTransaction(
                transaction as unknown as BackendTransactionItem | null,
              );
            }}
            setSelectedPaymentMethodKey={setSelectedPaymentMethodKey}
            onTabChange={handleTabChange}
            isLoading={isLoading}
            searchTotalCount={searchTotalCount}
            searchState={searchState}
            setSearchState={setSearchState}
          />
        </Grid>

        <Grid item xs={4} sx={{ height: 'calc(100% - 40px)', mt: '40px' }}>
          {/* 選択された取引を詳細表示 */}
          {/* 返品処理は props 経由で handleClickReturn を呼ぶ */}
          <TransactionDetail
            selectedTransaction={selectedTransaction}
            handleClickReturn={() => setIsReturnModalOpen(true)}
            isShow={isShow}
            setProductId={setProductId}
            setIsDetailModalOpen={setIsDetailModalOpen}
            handleFetchTransactionData={handleFetchTransactionData}
            onShowOriginalTransaction={async (originalTransactionId) => {
              let originalTransaction = transactions.find(
                (t) => t.id === originalTransactionId,
              );

              // 元取引が見つからない場合、APIを叩いて全体の取引を取得
              if (!originalTransaction && originalTransactionId) {
                try {
                  const response = await mycaPosAPI.transaction.getTransaction({
                    id: undefined,
                    storeId: store.id,
                    status: undefined,
                    transactionKind: undefined,
                    paymentMethod: undefined,
                    finishedAtStart: undefined,
                    finishedAtEnd: undefined,
                    includeSales: true,
                    includeStats: true,
                    includeSummary: true,
                    productName: undefined,
                    customerId: undefined,
                    skip: 0,
                    take: 1000, // 十分な数を取得
                    orderBy: undefined,
                  });

                  if (response instanceof CustomError) {
                    console.error('API error:', response);
                    return;
                  }

                  // 全体の取引から元取引を探す
                  originalTransaction = response.transactions.find(
                    (t) => t.id === originalTransactionId,
                  );
                } catch (error) {
                  console.error('Error fetching transactions:', error);
                  return;
                }
              }

              if (originalTransaction) {
                setSelectedTransaction(
                  originalTransaction as unknown as BackendTransactionItem | null,
                );
                console.log(
                  'setSelectedTransaction called with:',
                  originalTransaction,
                );
              }
            }}
          />
        </Grid>
      </Grid>

      {productId && category && genre && (
        <StockDetailModal
          productId={productId}
          isOpen={isDetailModalOpen}
          onClose={closeModal}
          category={category}
          genre={genre}
          fetchAllProducts={fetchTransactionData}
        />
      )}

      {/* CSV種類選択モーダル */}
      <CsvDownloadModal
        open={csvDialogOpen}
        onClose={() => setCsvDialogOpen(false)}
        transactionType={csvTransactionType}
        onTransactionTypeChange={setCsvTransactionType}
        onDownload={handleDownloadCsv}
        isDownloading={isDownloading}
      />

      {/* 返品モーダル */}
      <ConfirmationDialog
        open={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="返品"
        isLoading={isReturnLoading}
        confirmButtonText="返品"
        onConfirm={() => handleClickReturn(selectedTransaction?.id ?? 0)}
        content={returnModalContent()}
      />
    </ContainerLayout>
  );
};
