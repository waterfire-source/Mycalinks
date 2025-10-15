import { Grid, Box, Typography, Stack } from '@mui/material';
import dayjs from 'dayjs';
import TagLabel from '@/components/common/TagLabel';
import { useMemo } from 'react';

interface ProductTransaction {
  transaction: {
    id: number;
    finished_at: Date;
    payment_method: string;
  };
  item_count: number;
  total_unit_price: number;
  total_discount_price: number;
  product: {
    id: number;
    condition_option: {
      display_name: string;
    };
  };
}

interface Props {
  data: ProductTransaction;
}

export const TransactionCartDetailForProductList = ({ data }: Props) => {
  const { transaction, item_count, total_unit_price } = data;
  const conditionName = data.product.condition_option?.display_name || 'N/A';
  const totalPrice = useMemo(() => {
    return item_count * total_unit_price;
  }, [item_count, total_unit_price]);

  return (
    <Grid
      container
      spacing={1}
      sx={{
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderBottomColor: 'grey.200',
      }}
    >
      <Grid
        item
        xs={6}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body1">取引ID: {transaction.id}</Typography>
        <Typography variant="body1">
          {dayjs(transaction.finished_at).format('YYYY/MM/DD HH:mm:ss')}
        </Typography>
        {conditionName && (
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <TagLabel
              width="fit-content"
              height="20px"
              typographyVariant="caption"
            >
              {conditionName}
            </TagLabel>
          </Box>
        )}
      </Grid>

      <Grid
        item
        xs={6}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          justifyContent: 'center',
        }}
      >
        <Stack gap="12px" direction="row" alignItems="center">
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            単価: {total_unit_price.toLocaleString()}円
          </Typography>
        </Stack>
        <Stack gap="12px" direction="row" alignItems="center">
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            数量: {item_count.toLocaleString()}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          商品合計: {totalPrice.toLocaleString()}円
        </Typography>
      </Grid>
    </Grid>
  );
};
