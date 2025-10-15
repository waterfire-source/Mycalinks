import { ItemImage } from '@/feature/item/components/ItemImage';
import { useListItemsWithTransaction } from '@/feature/transaction/hooks/useListItemsWithTransaction';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  ButtonGroup,
  TextField,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Store } from '@prisma/client';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { ItemText } from '@/feature/item/components/ItemText';
import { ItemAPI } from '@/api/frontend/item/api';
import { CustomError } from '@/api/implement';

interface Props {
  store: Store;
}

type ListItemType = Exclude<
  ItemAPI['listItemWithTransaction']['response'],
  CustomError
>['items'];

export const TopTransactionsItemCard = ({ store }: Props) => {
  // 買取・販売アイテムの状態管理
  const [buyItems, setBuyItems] = useState<ListItemType>([]);
  const [sellItems, setSellItems] = useState<ListItemType>([]);
  // 表示タブの状態管理（デフォルトは販売）
  const [activeTab, setActiveTab] = useState<'sell' | 'buy'>('sell');
  // 販売数と買取数の情報が更新されたかどうかのフラグ
  const [isInformationUpdated, setIsInformationUpdated] = useState<{
    sell: boolean;
    buy: boolean;
  }>({ sell: false, buy: false });
  const router = useRouter();
  const searchParams = useSearchParams();

  // 商品マスタごとの取引一覧取得
  const {
    items,
    searchState,
    searchDate,
    setSearchState,
    setSearchDate,
    fetchItemsWithTransaction,
    isLoading,
  } = useListItemsWithTransaction(store.id, true, true, true, searchParams);

  // 初回マウント時とstore変更時にデータ取得
  useEffect(() => {
    if (store) {
      if (activeTab === searchState.transactionKind) {
        // アクティブタブが正しく設定済みの場合はそのままrefetch
        fetchItemsWithTransaction();
      } else {
        // アクティブタブが現在の設定と異なる場合はsearchStateの更新によりrefetch
        setSearchState((prev) => ({
          ...prev,
          transactionKind: activeTab,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchItemsWithTransaction, store]);

  // itemsが更新されたら買取・販売ごとにアイテムを保存
  useEffect(() => {
    if (activeTab === 'buy') {
      // 買取のフラグを更新
      setIsInformationUpdated((prev) => {
        return {
          ...prev,
          buy: true,
        };
      });
      setBuyItems(items);
    }
    if (activeTab === 'sell') {
      // 販売のフラグを更新
      setIsInformationUpdated((prev) => {
        return {
          ...prev,
          sell: true,
        };
      });
      setSellItems(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // アクティブタブが変更されたらsearchStateを更新
  useEffect(() => {
    if (activeTab === 'buy' && !isInformationUpdated.buy) {
      // searchStateを更新
      setSearchState((prev) => ({
        ...prev,
        transactionKind: 'buy',
      }));
    } else if (activeTab === 'sell' && !isInformationUpdated.sell) {
      // searchStateを更新
      setSearchState((prev) => ({
        ...prev,
        transactionKind: 'sell',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 日付変更時の検索
  useEffect(() => {
    if (store) {
      setIsInformationUpdated({
        sell: activeTab === 'sell',
        buy: activeTab === 'buy',
      });
      if (activeTab === searchState.transactionKind) {
        // アクティブタブが正しく設定されている場合は、日付の変更を反映するためrefetch
        fetchItemsWithTransaction();
      } else {
        // アクティブタブが変更されている場合はsearchStateの更新により、refetch
        setSearchState((prev) => ({
          ...prev,
          transactionKind: activeTab,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDate.startDate, searchDate.endDate]);

  // アクティブタブに応じて表示するアイテムを切り替え
  const displayItems = activeTab === 'sell' ? sellItems : buyItems;

  // 開始日の変更ハンドラー
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
    }
  };

  // 終了日の変更ハンドラー
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    if (selectedDate) {
      setSearchDate((prev) => ({
        ...prev,
        endDate: dayjs(selectedDate).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
      }));
    }
  };

  return (
    <Card sx={{ border: '1px solid #ccc', height: '100%' }}>
      {/* カードヘッダー */}
      <CardHeader
        title={
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
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
              <Typography>取引情報</Typography>
            </Box>
            <Typography
              sx={{ color: 'primary.main', cursor: 'pointer' }}
              onClick={() => {
                router.push(PATH.TRANSACTION);
              }}
            >
              取引一覧へ
            </Typography>
          </Box>
        }
        sx={{ borderBottom: '1px solid #ccc' }}
      />

      <CardContent>
        <Stack spacing={2}>
          {/* 日付選択と合計金額表示エリア */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* 日付選択フィールド */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              {/* 開始日入力フィールド */}
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
                  sx: {
                    color: 'black',
                  },
                }}
              />
              <Typography>~</Typography>
              {/* 終了日入力フィールド */}
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
                  sx: {
                    color: 'black',
                  },
                }}
              />
            </Box>
            {/* 合計金額表示エリア */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* <TotalSalesOrPurchases
                totalAmount={totalAmount}
                type="sell"
                handleStartDateChange={handleStartDateChange}
              />
              <TotalSalesOrPurchases
                totalAmount={totalAmount}
                type="buy"
                handleStartDateChange={handleStartDateChange}
              /> */}
            </Box>
          </Box>

          {/* 販売/買取切り替えボタン */}
          <ButtonGroup
            variant="contained"
            size="small"
            sx={{ mb: 1, boxShadow: 'none' }}
          >
            <Button
              onClick={() => setActiveTab('sell')}
              disabled={isLoading}
              sx={{
                bgcolor: activeTab === 'sell' ? 'grey.700' : 'grey.200',
                color: activeTab === 'sell' ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: activeTab === 'sell' ? 'grey.700' : 'grey.300',
                },
              }}
            >
              販売数上位
            </Button>
            <Button
              onClick={() => setActiveTab('buy')}
              disabled={isLoading}
              sx={{
                bgcolor: activeTab === 'buy' ? 'grey.700' : 'grey.200',
                color: activeTab === 'buy' ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: activeTab === 'buy' ? 'grey.700' : 'grey.300',
                },
              }}
            >
              買取数上位
            </Button>
          </ButtonGroup>

          {/* 取引データテーブル */}
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : displayItems.length > 0 ? (
            <TableContainer sx={{ maxHeight: '275px', overflowY: 'auto' }}>
              <Table size="small">
                <TableBody>
                  {displayItems.map((item: ListItemType[0]) => (
                    <TableRow key={item.item.id}>
                      <TableCell sx={{ width: '15%' }}>
                        <ItemImage imageUrl={item.item.image_url} />
                      </TableCell>
                      <TableCell sx={{ width: '45%' }}>
                        <ItemText text={item.item.display_name || ''} />
                      </TableCell>
                      <TableCell sx={{ width: '25%' }}>
                        <Typography>
                          取引{item.transactionStats.transactionCount}件 （
                          {item.transactionStats.transactionProductsCount}点）
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ width: '15%' }}>
                        <Typography>
                          ¥
                          {item.transactionStats.transactionTotalPrice.toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Typography color="textPrimary" sx={{ p: 2 }}>
                {activeTab === 'sell' ? '販売' : '買取'}データがありません
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
