'use client';

import { LocationReleaseDetail } from '@/app/auth/(dashboard)/location/[locationId]/release/components/LocationReleaseDetail';
import { LocationReleaseProductTable } from '@/app/auth/(dashboard)/location/[locationId]/release/components/LocationReleaseProductTable';
import { ReleaseProductRegisterModal } from '@/app/auth/(dashboard)/location/[locationId]/release/components/releaseProductRegisterModal/ReleaseProductRegisterModal';
import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Chip } from '@/components/chips/Chip';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useLocation } from '@/feature/location/hooks/useLocation';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { Stack, Typography } from '@mui/material';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const LocationReleasePage = () => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { locationId } = useParams();
  const { getLocation, locations } = useLocation();
  const { listProductsByProductIDs } = useProducts();

  const [
    isOpenReleaseProductRegisterModal,
    setIsOpenReleaseProductRegisterModal,
  ] = useState(true);
  //解体する際に利用する在庫情報
  const [releaseProducts, setReleaseProducts] = useState<LocationProduct[]>([]);
  //このロケーションに登録されている在庫情報
  const [locationProducts, setLocationProducts] = useState<LocationProduct[]>(
    [],
  );

  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  useEffect(() => {
    const fetchLocations = async () => {
      const location = await getLocation({
        id: Number(locationId),
        status: 'CREATED',
      });

      if (!location)
        return setAlertState({
          message: '指定されたIDのロケーションがみつかりません',
          severity: 'error',
        });

      const productIds = location[0].products.map((p) => p.product_id);
      const products = await listProductsByProductIDs(store.id, productIds);

      const converted: LocationProduct[] =
        products
          ?.map((p) => {
            const targetProductInfo = location[0].products.find(
              (lp) => lp.product_id === p.id,
            );

            if (!targetProductInfo) return null;

            return { ...p, itemCount: targetProductInfo.item_count };
          })
          .filter((p) => p !== null) ?? [];

      setLocationProducts(converted);
    };

    fetchLocations();
  }, [store.id]);

  return (
    <ContainerLayout
      title={
        <Stack direction="row" spacing={2}>
          <Typography variant="h1">{locations[0]?.display_name}解体</Typography>
          <Chip
            variant={mode === 'out' ? 'secondary' : 'primary'}
            text={mode === 'out' ? '出ていったものを登録' : '残ったものを登録'}
            sx={{ borderRadius: '20px', px: 1 }}
          />
        </Stack>
      }
      actions={
        <PrimaryButton
          onClick={() => setIsOpenReleaseProductRegisterModal(true)}
        >
          商品登録
        </PrimaryButton>
      }
    >
      <Stack direction="row" sx={{ width: '100%', height: '100%' }} spacing={2}>
        <Stack sx={{ flex: 7, minWidth: 0 }}>
          <LocationReleaseProductTable releaseProducts={releaseProducts} />
        </Stack>
        <Stack sx={{ flex: 4, minWidth: 0 }}>
          <LocationReleaseDetail
            locationId={Number(locationId)}
            releaseProducts={releaseProducts}
            locationProducts={locationProducts}
            mode={mode === 'out' ? mode : mode === 'remain' ? mode : undefined}
          />
        </Stack>
      </Stack>
      <ReleaseProductRegisterModal
        open={isOpenReleaseProductRegisterModal}
        onClose={() => setIsOpenReleaseProductRegisterModal(false)}
        locationProducts={locationProducts}
        mode={mode === 'out' ? mode : mode === 'remain' ? mode : undefined}
        setReleaseProducts={setReleaseProducts}
      />
    </ContainerLayout>
  );
};

export default LocationReleasePage;
