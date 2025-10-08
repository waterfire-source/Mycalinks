import { EcOrderByStoreProps } from '@/feature/ec/inquiry/components/OrderDetail';
import { Box, Typography } from '@mui/material';
import { EcPaymentMethod } from '@prisma/client';

interface Props {
  order: EcOrderByStoreProps['storeOrders'][0];
}

export const MycaCustomerDetail = ({ order }: Props) => {
  const paymentMethodTransfer = (paymentMethod: EcPaymentMethod | null) => {
    if (!paymentMethod) return '';
    switch (paymentMethod) {
      case 'CARD':
        return 'クレジットカード';
      case 'PAYPAY':
        return 'PayPay';
      case 'CASH_ON_DELIVERY':
        return '代金引換';
      case 'CONVENIENCE_STORE':
        return 'コンビニ決済';
      case 'BANK':
        return '銀行振込';
      default:
        return 'その他';
    }
  };
  return (
    <Box
      sx={{
        borderTop: '2px solid',
        borderTopColor: 'grey.200',
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        flex: 1,
        minHeight: '180px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          py: 2,
        }}
      >
        <Typography>発送先： {order.order.shippingAddress}</Typography>
        <Typography>お客様氏名： {order.order.customerName}</Typography>
        <Typography>メールアドレス： {order.order.customerEmail}</Typography>
        <Typography>
          受注日時：
          {order.order.orderedAt
            ? new Date(order.order.orderedAt).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })
            : ''}
        </Typography>
        <Typography>
          支払い方法： {paymentMethodTransfer(order.order.paymentMethod)}
        </Typography>
        <Typography>配送方法： {order.shippingMethod.displayName}</Typography>
      </Box>
    </Box>
  );
};
