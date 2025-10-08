import { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useListItemsWithTransaction } from '@/feature/transaction/hooks/useListItemsWithTransaction';
import { TransactionKind } from '@prisma/client';
import { DetailCard } from '@/components/cards/DetailCard';
import { TransactionCartDetailForProductList } from '@/app/auth/(dashboard)/transaction/product/components/TransactionCartDetailForProductList';

/**
 * Props:
 * - storeId: 店舗ID
 * - itemId?: 表示対象の商品ID
 * - transactionFinishedAtGte: 開始日時
 * - transactionFinishedAtLt: 終了日時
 * - resultTransactionKind: 取引種類 (買 or 売)
 * - isIncludesTransactions: 取引詳細を表示するかどうか
 */
interface Props {
  storeId: number;
  itemId?: number;
  transactionFinishedAtGte: string;
  transactionFinishedAtLt: string;
  resultTransactionKind?: TransactionKind;
  customerId?: number;
}

export const ProductDetail = ({
  storeId,
  itemId,
  transactionFinishedAtGte,
  transactionFinishedAtLt,
  resultTransactionKind,
  customerId,
}: Props) => {
  // useListItemsWithTransaction を利用
  const {
    items,
    searchState,
    setSearchDate,
    setSearchState,
    fetchItemsWithTransaction,
    isLoading,
  } = useListItemsWithTransaction(storeId, false, false);

  // itemId が変わったら fetch
  useEffect(() => {
    if (itemId && itemId === searchState.itemId) {
      fetchItemsWithTransaction();
    }
  }, [itemId, searchState.itemId, fetchItemsWithTransaction]);

  // itemId or 日付や取引種類が変わったら state 更新
  useEffect(() => {
    if (itemId) {
      // 日付をセット
      setSearchDate({
        startDate: transactionFinishedAtGte,
        endDate: transactionFinishedAtLt,
      });
      // other conditions
      setSearchState((prev) => ({
        ...prev,
        itemId: itemId,
        includesTransactions: true,
        // 取引種類が指定されていればセット
        ...(resultTransactionKind !== undefined && {
          transactionKind: resultTransactionKind,
        }),
        ...(customerId !== undefined && { customerId }),
      }));
    }
  }, [
    itemId,
    transactionFinishedAtGte,
    transactionFinishedAtLt,
    resultTransactionKind,
    customerId,
    setSearchDate,
    setSearchState,
  ]);

  const currentItem = items?.[0];
  const transactions = currentItem?.transactions;

  const detailContent = (() => {
    // 選択商品がなければメッセージ表示
    if (!itemId) {
      return (
        <Box
          sx={{
            mt: 2,
            p: 2,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1">商品をクリックして詳細を表示</Typography>
        </Box>
      );
    }

    // ローディング中
    if (isLoading) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            py: 2,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    // 取引詳細を表示するか判定
    if (!currentItem) {
      return (
        <Box
          sx={{
            mt: 2,
            p: 2,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography>データがありません</Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* 取引件数・取引点数部分（固定）*/}
        <Box
          sx={{
            borderBottom: '1px solid',
            borderBottomColor: 'grey.200',
            flexShrink: 0, // この部分は縮まないように固定
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 1,
            }}
          >
            <Typography variant="body1">
              取引件数 {currentItem.transactionStats.transactionCount}件
            </Typography>
            <Typography variant="body1">
              取引点数 {currentItem.transactionStats.transactionProductsCount}点
            </Typography>
          </Box>
        </Box>

        {/* 取引リスト（スクロール可能）*/}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            minHeight: 0, // flex子要素でのスクロールを有効にするため
          }}
        >
          {transactions?.map((tx, index) => (
            <TransactionCartDetailForProductList key={index} data={tx} />
          ))}
        </Box>
      </Box>
    );
  })();

  return (
    <DetailCard
      title={'取引詳細'}
      titleTextColor={
        resultTransactionKind === 'sell' || resultTransactionKind === 'buy'
          ? 'text.secondary'
          : 'text.primary'
      }
      titleBackgroundColor={
        resultTransactionKind === 'sell'
          ? 'secondary.main'
          : resultTransactionKind === 'buy'
          ? 'primary.main'
          : 'common.white'
      }
      content={detailContent}
    />
  );
};