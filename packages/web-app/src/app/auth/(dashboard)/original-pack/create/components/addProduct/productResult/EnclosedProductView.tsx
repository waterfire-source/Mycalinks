import { EnclosedProduct } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/EnclosedSelectModal';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ConditionChip } from '@/feature/products/components/ConditionChip';
import { Typography, IconButton } from '@mui/material';
import { Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dispatch, SetStateAction } from 'react';
import { ItemText } from '@/feature/item/components/ItemText';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';
interface Props {
  product: EnclosedProduct;
  setSelectedProducts: Dispatch<SetStateAction<EnclosedProduct[]>>;
}
export const EnclosedProductView = ({
  product,
  setSelectedProducts,
}: Props) => {
  return (
    <Stack
      direction="row"
      gap="6px"
      alignItems="center"
      justifyContent="flex-start"
      width="100%"
    >
      <ItemImage imageUrl={product.image_url} height={80} />
      <Stack minWidth="220px" gap="4px">
        <ItemText text={product.displayNameWithMeta} />
        <ConditionChip condition={getConditionDisplayName(product)} />
        <Stack direction="row" gap="4px">
          <Typography variant="caption">
            仕入れ：{product.mean_wholesale_price}円
          </Typography>
          <Typography variant="caption">
            販売：{product.actual_sell_price}円
          </Typography>
        </Stack>
      </Stack>
      <QuantityControlField
        containerSx={{ width: '100px' }}
        quantity={product.item_count ?? 0}
        onQuantityChange={(value) => {
          setSelectedProducts((prev) =>
            prev.map((p) =>
              p.id === product.id ? { ...p, item_count: value } : p,
            ),
          );
        }}
        maxQuantity={
          product.is_infinite_stock ? undefined : product.stock_number
        }
        minQuantity={1}
        textFieldProps={{
          sx: {
            width: '50px',
          },
        }}
      />
      <IconButton
        sx={{ width: '20px' }}
        onClick={() =>
          setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id))
        }
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
};
