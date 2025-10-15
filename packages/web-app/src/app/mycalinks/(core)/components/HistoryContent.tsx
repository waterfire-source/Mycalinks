'use client';

import { mycalinksTransactionImplement } from '@/api/frontend/mycalinks/transaction/implement';
import { CustomError } from '@/api/implement';
import { BackendAllTransactionAPI } from '@/app/api/store/all/transaction/api';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';
import { TransactionInfo } from '@/app/mycalinks/(core)/types/transaction';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Loader from '@/components/common/Loader';
import { useAlert } from '@/contexts/AlertContext';

interface Props {
  selectedStore: PosCustomerInfo | null;
  posCustomerInfo: PosCustomerInfo[];
}
export const HistoryContent = ({ selectedStore, posCustomerInfo }: Props) => {
  const { setAlertState } = useAlert();
  //取引履歴のデータ
  const [transactions, setTransactions] = useState<
    BackendAllTransactionAPI[0]['response'][200]
  >([]);
  // 全ての完了している取引
  const [allCompletedTransactions, setAllCompletedTransactions] = useState<
    BackendAllTransactionAPI[0]['response'][200]
  >([]);
  //詳細を表示している取引
  const [transactionDetail, setTransactionDetail] =
    useState<TransactionInfo | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionDetailLoading, setTransactionDetailLoading] =
    useState(false);

  //取引履歴を取得する
  useEffect(() => {
    (async () => {
      const res = await mycalinksTransactionImplement().getAll();
      if (res instanceof CustomError) {
        setAlertState({
          message: '取引履歴の取得に失敗しました。',
          severity: 'error',
        });
      } else {
        //ステータスが完了になっているもののみセット
        setTransactions(res.filter((each) => each.status == 'completed'));
        setAllCompletedTransactions(
          res.filter((each) => each.status == 'completed'),
        );
        setTransactionsLoading(false);
      }
    })();
  }, []);

  // ストア切り替えで取引履歴を変更
  useEffect(() => {
    if (!selectedStore) {
      setTransactions(allCompletedTransactions);
    }
    if (selectedStore) {
      setTransactions(
        allCompletedTransactions.filter(
          (each) => each.store_id == selectedStore.store_id,
        ),
      );
    }
  }, [selectedStore]);

  //詳細情報を取得
  const getTransactionDetail = async (id: number) => {
    setTransactionDetailLoading(true);
    const detailInfo =
      await mycalinksTransactionImplement().getPosTransactionDetail({
        transactionId: id,
      });
    if (detailInfo instanceof CustomError) throw detailInfo;

    const converted: TransactionInfo = {
      id: detailInfo.id,
      buy__is_assessed: detailInfo.buy__is_assessed ?? false,
      customer_id: detailInfo.customer_id ?? 0,
      store__display_name: detailInfo.store__display_name || '',
      reception_number: detailInfo.reception_number || 0,
      total_price: detailInfo.total_price || 0,
      transaction_carts: detailInfo.transaction_carts.map((cart) => ({
        product__display_name: cart.product__display_name || '',
        product__image_url: cart.product__image_url || '',
        item_count: cart.item_count ?? 0,
        totalUnitPrice: cart.total_unit_price ?? 0,
        product__condition_option__display_name:
          cart.product__condition_option__display_name || '',
        unit_price: cart.unit_price ?? 0,
        discount_price: cart.discount_price ?? 0,
        sale_discount_price: cart.sale_discount_price ?? 0,
        product__id: cart.product__id ?? 0,
        item_expansion: cart.item_expansion || '',
        item_cardnumber: cart.item_cardnumber || '',
      })),
      updated_at: detailInfo.updated_at,
      transaction_kind: detailInfo.transaction_kind,
    };

    setTransactionDetail({
      ...converted,
    });
    setTransactionDetailLoading(false);
  };

  if (transactionsLoading || transactionDetailLoading)
    return (
      <Box sx={{ position: 'relative', top: '-110px', height: '100%' }}>
        <Loader />
      </Box>
    );

  // 詳細情報を表示している場合
  if (transactionDetail?.id)
    return (
      <Box p={1}>
        <Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              borderBottom: '0.5px solid rgba(0,0,0,0.5)',
              pb: 1.25,
            }}
          >
            <IconButton
              sx={{ position: 'absolute', left: 0 }}
              onClick={() => setTransactionDetail(null)}
            >
              <KeyboardArrowLeftIcon
                sx={{ color: 'primary.main', width: 40, height: 40 }}
              />
            </IconButton>

            <Typography fontSize="18px!important" fontWeight="bold">
              {transactionDetail?.store__display_name}
            </Typography>
            <Typography fontSize="14px!important" sx={{ opacity: 0.7 }}>
              {dayjs(transactionDetail?.updated_at).format('YYYY/MM/DD HH:mm')}
            </Typography>
            <Typography fontSize="16px!important" fontWeight="bold">
              {transactionDetail?.transaction_kind === 'sell' ? '購入' : '売却'}
              金額 ¥{(transactionDetail?.total_price || 0).toLocaleString()}
            </Typography>
          </Box>

          {(transactionDetail?.transaction_carts || []).map((item) => (
            <Box
              key={item.product__id}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                borderBottom: '0.6px solid rgba(0,0,0,0.5)',
                p: 1,
                gap: 1,
              }}
            >
              <Box>
                <Box
                  component="img"
                  src={item.product__image_url}
                  alt={item.product__display_name}
                  sx={{
                    width: 55,
                    aspectRatio: '3 / 4',
                    objectFit: 'cover',
                  }}
                />
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Typography fontSize="14px!important" sx={{ lineHeight: 1.3 }}>
                  {(item.item_expansion || item.item_cardnumber) && (
                    <>
                      {item.product__display_name}
                      <br />({item.item_expansion}
                      {item.item_cardnumber})
                    </>
                  )}
                </Typography>
                {item.product__condition_option__display_name && (
                  <Typography
                    fontSize="14px!important"
                    sx={{ lineHeight: 1.3 }}
                  >
                    状態：
                    {item.product__condition_option__display_name}
                  </Typography>
                )}
                <Typography fontSize="14px!important" sx={{ lineHeight: 1.3 }}>
                  ¥{(item.unit_price || 0).toLocaleString()} 数量
                  {item.item_count}
                </Typography>
              </Box>

              <Box sx={{ width: 70, alignSelf: 'flex-end', pb: 0.5 }}>
                <Typography fontSize="17px!important" textAlign="right">
                  ¥
                  {(
                    (item.item_count ?? 0) * (item.unit_price ?? 0)
                  ).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );

  return (
    <Box sx={{ backgroundColor: 'grey.100', p: 2 }}>
      {transactions.map((item) => {
        const targetPosCustomerInfo = posCustomerInfo.find(
          (each) => each.store_id === item.store_id,
        );

        return (
          <Paper
            key={item.id}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              p: 2,
              mb: 2,
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: 'white',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                maxWidth: '74%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  sx={{
                    backgroundColor:
                      item.transaction_kind === 'sell'
                        ? 'rgb(86, 173, 139)'
                        : 'primary.main',
                    color: 'white',
                    px: 3,
                    py: 0.3,
                    borderRadius: 4,
                    fontWeight: 'bold',
                    fontSize: '12px !important',
                  }}
                >
                  {item.transaction_kind === 'sell' ? '購入' : '売却'}
                </Typography>
                <Typography sx={{ fontSize: '12px !important' }}>
                  {item.transaction_kind === 'sell' ? '購入' : '売却'}日:{' '}
                  {dayjs(item.updated_at).format('YYYY/MM/DD')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {targetPosCustomerInfo?.store?.receipt_logo_url && (
                  <Box
                    component="img"
                    src={targetPosCustomerInfo.store.receipt_logo_url}
                    alt="store logo"
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '4px',
                      objectFit: 'contain',
                    }}
                  />
                )}
                <Typography
                  sx={{
                    fontSize: '13px !important',
                    fontWeight: 'bold',
                    mr: 1,
                    maxWidth: '45%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.store__display_name}
                </Typography>
                <Typography sx={{ fontSize: 16 }}>
                  ¥{(item.total_price || 0).toLocaleString()}
                </Typography>
                {Boolean(item.point_amount) && (
                  <Typography sx={{ color: 'primary.main', fontSize: 16 }}>
                    {(item.point_amount || 0).toLocaleString()}pt
                  </Typography>
                )}
              </Box>
            </Box>

            <Button
              variant="contained"
              size="small"
              sx={{
                backgroundColor: 'grey.500',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: 1,
                px: 2,
                py: 0.5,
                textTransform: 'none',
              }}
              onClick={() => getTransactionDetail(item.id)}
            >
              詳細
            </Button>
          </Paper>
        );
      })}

      {!transactions.length && (
        <Typography align="center" sx={{ mt: 4 }}>
          取引履歴が見つかりませんでした
        </Typography>
      )}
    </Box>
  );
};
