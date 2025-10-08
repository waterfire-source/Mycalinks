import { Box, Typography } from '@mui/material';
import { EcOrderByStoreInfoType } from '@/app/auth/(dashboard)/ec/transaction/type';
import { EcTransactionProductDetailList } from '@/app/auth/(dashboard)/ec/transaction/components/EcTransactionProductDetailList';
import dayjs from 'dayjs';
import { EC_PAYMENT_METHOD_MAP } from '@/constants/shipping';
import { EcPaymentMethod } from '@prisma/client';

interface Props {
  transactionID: number | null;
  transaction: EcOrderByStoreInfoType | null;
}

export const EcTransactionDetailContent = ({
  transactionID,
  transaction,
}: Props) => {
  if (!transactionID || !transaction) {
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
        <Typography variant="body1">取引をクリックして詳細を表示</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
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
            合計
            <Typography variant="body1" component="span">
              {transaction.products.reduce(
                (total, cart) => total + (cart.item_count || 0),
                0,
              )}
              点 ({transaction.products.length}商品)
            </Typography>
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Typography variant="body1" sx={{ ml: 1 }}>
              合計金額
            </Typography>
            <Typography variant="body1" component="span">
              {transaction.total_price.toLocaleString()}円
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* 取引詳細一覧 */}
      <Box
        sx={{
          flex: 1,
          maxHeight: '400px', // カート部分の最大高さ
          overflowY: 'auto',
        }}
      >
        <EcTransactionProductDetailList
          transactionProducts={transaction.products}
        />
      </Box>
      {/* お客様情報 */}
      <Box sx={{ flex: 'none' }}>
        <Box
          sx={{
            display: 'flex',
            padding: '8px',
            justifyContent: 'center',
            borderTop: '1px solid #ddd',
            paddingTop: '10px',
          }}
        >
          <Box sx={{ textAlign: 'left', width: '80%' }}>
            <Typography sx={{ fontSize: '14px', marginBottom: '3px' }}>
              発送先：{transaction.order.shipping_address}）
            </Typography>
            <Typography sx={{ fontSize: '14px', marginBottom: '3px' }}>
              お客様氏名：{transaction.order.customer_name}
            </Typography>
            <Typography sx={{ fontSize: '14px', marginBottom: '3px' }}>
              メールアドレス：
              {transaction.order.customer_email}
            </Typography>
            <Typography sx={{ fontSize: '14px', marginBottom: '3px' }}>
              受注日時：
              {dayjs(transaction.order.ordered_at).format('YYYY/MM/DD HH:mm')}
            </Typography>
            <Typography sx={{ fontSize: '14px', marginBottom: '3px' }}>
              支払い方法：
              {
                EC_PAYMENT_METHOD_MAP[
                  transaction.order.payment_method as EcPaymentMethod
                ]
              }
            </Typography>
            <Typography sx={{ fontSize: '14px', marginBottom: '3px' }}>
              配送方法：
              {transaction.shipping_method?.display_name}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
