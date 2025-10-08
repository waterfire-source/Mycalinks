import { Box, Typography, Paper } from '@mui/material';
import Image from 'next/image';
import { OrderItem } from '@/components/modals/ec/OrderDetailModal';

interface Props {
  items: OrderItem[];
  receivedDate: string;
  height?: string | number;
}

// 注文商品一覧
export const OrderItemsList = ({
  items,
  receivedDate,
  height = '650px',
}: Props) => {
  return (
    <Box sx={{ flex: 1 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 'bold',
            color: 'grey.700',
          }}
        >
          注文情報
        </Typography>
        <Typography variant="body2" sx={{ ml: 'auto' }}>
          受注日 {receivedDate}
        </Typography>
      </Box>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          height,
          overflow: 'auto',
        }}
      >
        {items.map((item, index) => (
          <Box key={index}>
            <Box sx={{ display: 'flex', gap: 2, py: 1.5 }}>
              <Image
                src={item.image}
                alt={item.name}
                width={60}
                height={80}
                style={{ objectFit: 'contain' }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">{item.name}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  状態：{item.condition}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mt: 1,
                  }}
                >
                  <Typography variant="body2">
                    ¥{item.price.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">数量 {item.quantity}</Typography>
                </Box>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  mt: 'auto',
                  fontSize: '1.6rem',
                }}
              >
                ¥{(item.price * item.quantity).toLocaleString()}
              </Typography>
            </Box>
            {index < items.length - 1 && (
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: 'grey.200',
                }}
              />
            )}
          </Box>
        ))}
      </Paper>
    </Box>
  );
};
