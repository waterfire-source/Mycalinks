'use client';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { LocationAddProductModal } from '@/app/auth/(dashboard)/location/register/components/AddProductModal/LocationAddProductModal';
import { LocationDetail } from '@/app/auth/(dashboard)/location/register/components/LocationDetail';
import { LocationRegisterTable } from '@/app/auth/(dashboard)/location/register/components/LocationRegisterTable';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useStore } from '@/contexts/StoreContext';
import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';

export type LocationProduct =
  BackendProductAPI[0]['response']['200']['products'][number] & {
    itemCount: number;
  };

const LocationRegisterPage = () => {
  const { store } = useStore();

  const [isOpenAddProductModal, setIsOpenAddProductModal] = useState(false);
  const [locationProducts, setLocationProducts] = useState<LocationProduct[]>(
    [],
  );

  const addLocationProduct = (products: LocationProduct[]) => {
    setLocationProducts((prev) => {
      return products.reduce((acc, product) => {
        const existProduct = acc.find((p) => p.id === product.id);

        if (existProduct) {
          return acc.map((p) =>
            p.id === product.id
              ? { ...p, itemCount: p.itemCount + product.itemCount }
              : p,
          );
        } else {
          return [...acc, product];
        }
      }, prev);
    });
  };

  useEffect(() => {
    setLocationProducts([]);
  }, [store.id]);

  return (
    <ContainerLayout
      title="ロケーション登録"
      actions={
        <PrimaryButton onClick={() => setIsOpenAddProductModal(true)}>
          ロケーションの商品追加
        </PrimaryButton>
      }
    >
      <Stack
        direction="row"
        sx={{ width: '100%', height: '100%', mt: 2 }}
        spacing={2}
      >
        <Stack sx={{ flex: 7, minWidth: 0 }}>
          <LocationRegisterTable locationProducts={locationProducts} />
        </Stack>
        <Stack sx={{ flex: 4, minWidth: 0 }}>
          <LocationDetail locationProducts={locationProducts} />
        </Stack>
      </Stack>
      <LocationAddProductModal
        open={isOpenAddProductModal}
        onClose={() => setIsOpenAddProductModal(false)}
        addLocationProduct={addLocationProduct}
      />
    </ContainerLayout>
  );
};

export default LocationRegisterPage;
