import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { ConditionChip } from '@/feature/products/components/ConditionChip';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Stack, Typography } from '@mui/material';

type Props = {
  product: ShipmentProduct;
  quantityChange: (id: number, value: number) => void;
  deleteFromCart: (id: number) => void;
};

export const ShipmentCartDetailRow = ({
  product,
  quantityChange,
  deleteFromCart,
}: Props) => {
  const onQuantityChange = (value: number) => {
    quantityChange(product.id, value);
  };
  return (
    <Stack
      direction="row"
      gap="6px"
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      <Box sx={{ flex: 1 }}>
        <ItemImage imageUrl={product.image_url || ''} />
      </Box>
      <Stack gap="4px" sx={{ flex: 3 }}>
        <ItemText text={product.displayNameWithMeta} />
        <ConditionChip condition={`${getConditionDisplayName(product)}`} />
        <Stack direction="row" gap="4px">
          <Typography variant="caption">
            仕入れ：{product.average_wholesale_price?.toLocaleString() || 0}円
          </Typography>
          <Typography variant="caption">
            販売：{product.actual_sell_price?.toLocaleString() || 0}円
          </Typography>
        </Stack>
      </Stack>
      <Box sx={{ flex: 1, maxWidth: 70 }}>
        <NumericTextField
          value={product.itemCount}
          onChange={onQuantityChange}
          min={1}
          max={product.stock_number}
        />
      </Box>
      <IconButton
        sx={{ width: '20px' }}
        onClick={() => deleteFromCart(product.id)}
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
};
