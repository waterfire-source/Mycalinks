import { TableRow, TableCell, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ORDER_STATUS_MAP,
  OrderInfo,
  OrderStatus,
} from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';
import { EC_PAYMENT_METHOD_MAP } from '@/constants/shipping';
import { EcPaymentMethod } from '@prisma/client';

// カスタムTableCell
const StyledTableCell = styled(TableCell)<{ isRead: number }>(({ isRead }) => ({
  backgroundColor: isRead ? 'inherit' : 'rgb(255, 217, 217) !important',
}));

interface Props {
  order: OrderInfo;
  onRowClick: (order: OrderInfo) => void;
}

export const OrderTableRow = ({ order, onRowClick }: Props) => {
  return (
    <TableRow
      key={order.orderId}
      onClick={() => onRowClick(order)}
      sx={{
        cursor: 'pointer',
        height: '100px',
        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
      }}
    >
      <StyledTableCell
        isRead={order.addInfo.read ? 1 : 0}
        sx={{ width: '50px' }}
      >
        {/* 余白調整 */}
      </StyledTableCell>
      <StyledTableCell
        isRead={order.addInfo.read ? 1 : 0}
        sx={{ width: '150px' }}
      >
        {order.orderId}
      </StyledTableCell>
      <StyledTableCell
        isRead={order.addInfo.read ? 1 : 0}
        sx={{ width: '200px' }}
      >
        {ORDER_STATUS_MAP[order.status as OrderStatus]}
      </StyledTableCell>
      <StyledTableCell
        isRead={order.addInfo.read ? 1 : 0}
        sx={{ width: '200px' }}
      >
        {order.orderDate
          .toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
          .replace(/\//g, '/')}
      </StyledTableCell>
      <StyledTableCell
        isRead={order.addInfo.read ? 1 : 0}
        sx={{ width: '200px' }}
      >
        {EC_PAYMENT_METHOD_MAP[order.paymentMethod as EcPaymentMethod] ||
          order.paymentMethod}
      </StyledTableCell>
      <StyledTableCell
        isRead={order.addInfo.read ? 1 : 0}
        sx={{ width: '300px' }}
      >
        {order.deliveryMethod.displayName}
      </StyledTableCell>
      <StyledTableCell
        isRead={order.addInfo.read ? 1 : 0}
        sx={{ width: '400px' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {order.items[0].name}
          {order.items.length > 1 && (
            <Box
              sx={{
                backgroundColor: '#f0f0f0',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '20px',
                borderRadius: '4px',
                padding: '0 4px',
              }}
            >
              <Typography variant="caption">
                他 {order.items.length - 1}
                商品
              </Typography>
            </Box>
          )}
        </Box>
      </StyledTableCell>
      <StyledTableCell
        isRead={order.addInfo.read ? 1 : 0}
        sx={{ width: '200px' }}
      >
        {order.totalAmount.toLocaleString()}円
      </StyledTableCell>
      <StyledTableCell
        isRead={order.addInfo.read ? 1 : 0}
        sx={{ width: '100px' }}
      ></StyledTableCell>
    </TableRow>
  );
};
