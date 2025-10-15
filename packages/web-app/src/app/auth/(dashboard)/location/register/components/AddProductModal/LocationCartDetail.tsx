import { LocationCartDetailItem } from '@/app/auth/(dashboard)/location/register/components/AddProductModal/LocationCartDetailItem';
import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { DetailCard } from '@/components/cards/DetailCard';
import { Box, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';

type Props = {
  cartProducts: LocationProduct[];
  addLocationProductFromCart: () => void;
  deleteCartProduct: (productId: number) => void;
  itemCountChange: (productId: number, newValue: number) => void;
  onClose: () => void;
};

export const LocationCartDetail = ({
  cartProducts,
  addLocationProductFromCart,
  deleteCartProduct,
  itemCountChange,
  onClose,
}: Props) => {
  const [totalProductCount, totalProductPrice] = useMemo(
    () =>
      cartProducts.reduce(
        (acc, current) => [
          acc[0] + current.itemCount,
          acc[1] + (current.actual_sell_price ?? 0) * current.itemCount,
        ],
        [0, 0],
      ),
    [cartProducts],
  );

  return (
    <DetailCard
      title={
        <Stack
          direction="row"
          sx={{ width: '100%', justifyContent: 'space-between' }}
        >
          <Typography>封入商品</Typography>
          <Typography>
            {cartProducts.length}点{totalProductCount}商品
            {totalProductPrice}円
          </Typography>
        </Stack>
      }
      content={
        <Stack sx={{ width: '100%', height: '100%' }} spacing={1}>
          {cartProducts.map((p) => {
            return (
              <LocationCartDetailItem
                key={p.id}
                product={p}
                deleteCartProduct={deleteCartProduct}
                itemCountChange={itemCountChange}
              />
            );
          })}
        </Stack>
      }
      bottomContent={
        <Stack
          direction="row"
          sx={{
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <SecondaryButton onClick={onClose}>登録内容を破棄</SecondaryButton>
          </Box>
          <Box>
            <PrimaryButton
              onClick={() => {
                addLocationProductFromCart();
                onClose();
              }}
            >
              商品を封入
            </PrimaryButton>
          </Box>
        </Stack>
      }
    />
  );
};
