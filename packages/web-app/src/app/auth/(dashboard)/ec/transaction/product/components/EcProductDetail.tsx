import { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { DetailCard } from '@/components/cards/DetailCard';
import { EcTransactionCartDetailForProductList } from '@/app/auth/(dashboard)/ec/transaction/product/components/EcTransactionCartDetailForProductList';
import { useListItemWithEcOrder } from '@/feature/ec/hooks/useListItemWithEcOrder';

interface Props {
  storeId: number;
  itemId?: number;
  orderCreatedAtGte: string;
  orderCreatedAtLt: string;
}

export const EcProductDetail = ({
  storeId,
  itemId,
  orderCreatedAtGte,
  orderCreatedAtLt,
}: Props) => {
  // ECの在庫別取引一覧取得
  const {
    items,
    searchState,
    setSearchDate,
    setSearchState,
    fetchItemsWithEcOrder,
    isLoading,
  } = useListItemWithEcOrder({
    storeId: storeId,
    includesEcOrders: true,
  });

  // itemId が変わったら fetch
  useEffect(() => {
    if (itemId && itemId === searchState.itemId) {
      fetchItemsWithEcOrder();
    }
  }, [itemId, searchState.itemId, fetchItemsWithEcOrder]);

  // itemId or 日付や取引種類が変わったら state 更新
  useEffect(() => {
    if (itemId) {
      // 日付をセット
      setSearchDate({
        startDate: orderCreatedAtGte,
        endDate: orderCreatedAtLt,
      });
      // other conditions
      setSearchState((prev) => ({
        ...prev,
        itemId: itemId,
        searchCurrentPage: 0,
      }));
    }
  }, [
    itemId,
    orderCreatedAtGte,
    orderCreatedAtLt,
    setSearchDate,
    setSearchState,
  ]);

  const currentItem = items?.[0];
  const transactions = currentItem?.ecOrderCartStoreProducts;

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
          height: '-webkit-fill-available',
        }}
      >
        <Box
          sx={{
            flex: 'none',
            borderBottom: '1px solid',
            borderBottomColor: 'grey.200',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pl: 1,
            }}
          >
            <Typography variant="body1">
              取引件数 {currentItem.ecOrderStats.ecOrderCount}件
            </Typography>
            <Typography variant="body1">
              取引点数 {currentItem.ecOrderStats.ecOrderItemCount}点
            </Typography>
          </Box>
        </Box>

        {/* 取引リスト */}
        <Box
          sx={{
            maxHeight: '550px', // カート部分の最大高さ
            overflowY: 'auto',
          }}
        >
          {transactions?.map((tx, index) => (
            <EcTransactionCartDetailForProductList key={index} data={tx} />
          ))}
        </Box>
      </Box>
    );
  })();

  return (
    <DetailCard
      title={'取引詳細'}
      titleTextColor={'text.primary'}
      titleBackgroundColor={'common.white'}
      content={detailContent}
    />
  );
};
