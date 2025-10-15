import { ItemImage } from '@/feature/item/components/ItemImage';
import { Delete } from '@mui/icons-material';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { CartItem } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryAddModal';

interface Props {
  cartItem: CartItem;
  setAddCart: Dispatch<SetStateAction<CartItem[]>>;
}

export const InventoryProductDetail = ({ cartItem, setAddCart }: Props) => {
  const removeProduct = () => {
    setAddCart((prev) =>
      prev.filter((p) => p.cart_item_id !== cartItem.cart_item_id),
    );
  };

  const handleCountChange = (newCount: number) => {
    // 0個以下の値は設定しない
    if (newCount <= 0) return;

    setAddCart((prev) =>
      prev.map((p) =>
        p.cart_item_id === cartItem.cart_item_id
          ? { ...p, count: newCount }
          : p,
      ),
    );
  };

  return (
    <Stack
      direction="row"
      width="100%"
      height={120}
      alignItems="stretch"
      sx={{ p: '4px 10px' }}
      gap={1.5}
    >
      <Box width="80px" flex={0}>
        <ItemImage imageUrl={cartItem.image_url} />
      </Box>
      <Stack flexDirection="column" flex={2} sx={{ height: '100%' }}>
        <Typography
          sx={{
            fontSize: '14px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {cartItem.displayNameWithMeta}
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            backgroundColor: 'primary.main',
            color: 'text.secondary',
            p: '2px 4px',
            borderRadius: 1,
            width: 'fit-content',
            overflow: 'hidden',
          }}
        >
          <Typography variant="caption">
            {cartItem.condition_option_display_name}
          </Typography>
        </Box>
      </Stack>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="space-between"
        flex={0}
        sx={{ height: '100%' }}
      >
        <Stack direction="row" sx={{ width: '100%', justifyContent: 'right' }}>
          <Delete
            sx={{
              fontSize: '24px',
              color: 'grey.700',
            }}
            onClick={removeProduct}
          />
        </Stack>
        <TextField
          type="number"
          value={cartItem.count}
          label="登録数"
          InputLabelProps={{ sx: { color: 'grey' } }}
          InputProps={{ sx: { height: '35px', width: '80px', p: '2px' } }}
          onChange={(e) => handleCountChange(Number(e.target.value))}
        />
      </Stack>
    </Stack>
  );
};
