import { ReleaseProductRegisterTable } from '@/app/auth/(dashboard)/location/[locationId]/release/components/releaseProductRegisterModal/ReleaseProductRegisterTable';
import { LocationCartDetail } from '@/app/auth/(dashboard)/location/register/components/AddProductModal/LocationCartDetail';
import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import { Chip } from '@/components/chips/Chip';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  locationProducts: LocationProduct[];
  mode: 'out' | 'remain' | undefined;
  setReleaseProducts: Dispatch<SetStateAction<LocationProduct[]>>;
};

export const ReleaseProductRegisterModal = ({
  open,
  onClose,
  locationProducts,
  mode,
  setReleaseProducts,
}: Props) => {
  const [registerCart, setRegisterCart] = useState<LocationProduct[]>([]);

  const cartToReleaseProducts = () => {
    setReleaseProducts((prev) => {
      const updatedProducts = [...prev];

      registerCart.forEach((cartProduct) => {
        const existingProductIndex = updatedProducts.findIndex(
          (p) => p.id === cartProduct.id,
        );

        if (existingProductIndex !== -1) {
          // 既存商品の場合は数量を増加（上限チェック付き）
          const existingProduct = updatedProducts[existingProductIndex];
          const originalProduct = locationProducts.find(
            (lp) => lp.id === cartProduct.id,
          );
          const maxCount = originalProduct?.itemCount || 0;

          const newCount = Math.min(
            existingProduct.itemCount + cartProduct.itemCount,
            maxCount,
          );

          updatedProducts[existingProductIndex] = {
            ...existingProduct,
            itemCount: newCount,
          };
        } else {
          // 新規商品の場合はそのまま追加
          updatedProducts.push({ ...cartProduct });
        }
      });

      return updatedProducts;
    });

    // カートをクリア
    setRegisterCart([]);
    onClose();
  };

  const onItemCountChange = (productId: number, newValue: number) => {
    setRegisterCart((prev) => {
      const targetProduct = locationProducts.find((p) => p.id === productId);
      return prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              itemCount: Math.min(targetProduct?.itemCount || 0, newValue),
            }
          : p,
      );
    });
  };

  const deleteCartProduct = (productId: number) => {
    setRegisterCart((prev) => prev.filter((p) => p.id !== productId));
  };

  const addToRegisterCart = (product: LocationProduct, count: number) => {
    setRegisterCart((prev) => {
      const existingProduct = prev.find((p) => p.id === product.id);

      if (existingProduct) {
        // 既存商品の場合は数量をproduct.itemCount分増加
        // ただしlocationProductのitemCountを超えないように制限
        const newCount = Math.min(
          existingProduct.itemCount + count,
          product.itemCount,
        );
        return prev.map((p) =>
          p.id === product.id ? { ...p, itemCount: newCount } : p,
        );
      } else {
        // 新規商品の場合はproduct.itemCountで追加
        return [...prev, { ...product, itemCount: count }];
      }
    });
  };

  return (
    <CustomModalWithIcon
      width="90%"
      height="90%"
      open={open}
      onClose={onClose}
      hideButtons
      title={
        <Stack direction="row" spacing={2}>
          <Typography variant="h1">ロケーション解体</Typography>
          <Chip
            variant={mode === 'out' ? 'secondary' : 'primary'}
            text={mode === 'out' ? '出ていったものを登録' : '残ったものを登録'}
            sx={{ borderRadius: '20px', px: 1 }}
          />
        </Stack>
      }
    >
      <Stack sx={{ width: '100%', height: '100%' }} direction="row" spacing={2}>
        <Stack sx={{ flex: 7, minWidth: 0 }}>
          <ReleaseProductRegisterTable
            locationProducts={locationProducts}
            addToRegisterCart={addToRegisterCart}
          />
        </Stack>
        <Stack sx={{ flex: 4, minWidth: 0 }}>
          <LocationCartDetail
            cartProducts={registerCart}
            addLocationProductFromCart={cartToReleaseProducts}
            deleteCartProduct={deleteCartProduct}
            itemCountChange={onItemCountChange}
            onClose={onClose}
          />
        </Stack>
      </Stack>
    </CustomModalWithIcon>
  );
};
