import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import { Chip } from '@/components/chips/Chip';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { IconButton, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';

type Props = {
  product: LocationProduct;
  deleteCartProduct: (productId: number) => void;
  itemCountChange: (productId: number, newValue: number) => void;
};

export const LocationCartDetailItem = ({
  product,
  deleteCartProduct,
  itemCountChange,
}: Props) => {
  return (
    <Stack
      spacing={1}
      direction="row"
      sx={{
        width: '100%',
        justifyContent: 'left',
      }}
    >
      <Stack sx={{ minWidth: 0 }}>
        <ItemImage imageUrl={product.image_url}></ItemImage>
      </Stack>
      <Stack sx={{ flex: 3, justifyContent: 'center' }} spacing={0.5}>
        <Typography>{product.displayNameWithMeta}</Typography>
        <Chip variant="primary" text={product.condition_option_display_name} />
        <Stack direction="row" justifyContent="left" spacing={1}>
          <Typography variant="caption">
            仕入れ:{product.average_wholesale_price}円
          </Typography>
          <Typography variant="caption">
            販売:{product.actual_sell_price || 0}円
          </Typography>
        </Stack>
      </Stack>
      <Stack
        sx={{
          width: '90px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <QuantityControlField
          quantity={product.itemCount}
          maxQuantity={product.stock_number}
          onQuantityChange={(e) => {
            itemCountChange(product.id, e);
          }}
          containerSx={{ width: '100%' }}
        />
      </Stack>
      <Stack
        sx={{
          minWidth: '30px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <IconButton onClick={() => deleteCartProduct(product.id)}>
          <DeleteIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};
