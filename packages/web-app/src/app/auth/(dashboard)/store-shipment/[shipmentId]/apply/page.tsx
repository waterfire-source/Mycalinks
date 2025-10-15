'use client';
import { ShipmentApplyTable } from '@/app/auth/(dashboard)/store-shipment/[shipmentId]/apply/components/ShipmentApplyTable';
import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Stack } from '@mui/material';
import { useParams } from 'next/navigation';
import { useGetShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { useEffect, useState } from 'react';
import { ShipmentApplyDetail } from '@/app/auth/(dashboard)/store-shipment/[shipmentId]/apply/components/ShipmentApplyDetail';

export default function StoreShipmentApplyPage() {
  const { shipmentId: tmp } = useParams();
  const {
    fetchShipmentInfo,
    apiProductToShipmentProduct,
    shipmentInfo,
    setShipmentInfo,
    loading: fetching,
  } = useGetShipmentInfo();

  const [shipmentProducts, setShipmentProducts] = useState<ShipmentProduct[]>(
    [],
  );

  const shipmentId = Number(tmp);

  useEffect(() => {
    const fetchShipment = async () => {
      const info = await fetchShipmentInfo(shipmentId);
      const products = await apiProductToShipmentProduct(
        info?.storeShipments[0].products || [],
      );

      setShipmentProducts(products || []);
    };

    fetchShipment();
  }, []);

  return (
    <ContainerLayout title="出荷確定">
      <Stack direction="row" width="100%" height="100%" spacing={2}>
        <Stack sx={{ flex: 5 }}>
          <ShipmentApplyTable
            shipmentInfo={shipmentInfo}
            shipmentProducts={shipmentProducts}
            loading={fetching}
          />
        </Stack>
        <Stack sx={{ flex: 3 }}>
          <ShipmentApplyDetail
            shipmentInfo={shipmentInfo}
            shipmentProducts={shipmentProducts}
            setShipmentInfo={setShipmentInfo}
          />
        </Stack>
      </Stack>
    </ContainerLayout>
  );
}
