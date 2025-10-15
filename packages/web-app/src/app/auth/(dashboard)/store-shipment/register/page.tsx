'use client';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useGetShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { ShipmentProductAddModal } from '@/app/auth/(dashboard)/store-shipment/register/components/ShipmentProductAddModal';
import { ShipmentRegisterTable } from '@/app/auth/(dashboard)/store-shipment/register/components/ShipmentRegisterTable';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export type ShipmentProduct =
  BackendProductAPI[0]['response']['200']['products'][0] & {
    itemCount: number;
  };

export default function StoreShipmentRegisterPage() {
  const { fetchShipmentInfo, apiProductToShipmentProduct, loading } =
    useGetShipmentInfo();

  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [shipmentProducts, setShipmentProducts] = useState<ShipmentProduct[]>(
    [],
  );

  const searchParams = useSearchParams();
  const toStoreId = Number(searchParams.get('toStoreId') || 0);
  const shipmentId = Number(searchParams.get('shipmentId') || 0);
  const isEdit = !!shipmentId;

  useEffect(() => {
    const fetchInitialProduct = async () => {
      if (isEdit && shipmentId) {
        const shipmentInfo = await fetchShipmentInfo(shipmentId);
        if (!shipmentInfo) return;
        const shipmentProducts = await apiProductToShipmentProduct(
          shipmentInfo.storeShipments[0].products,
        );
        setShipmentProducts(shipmentProducts || []);
      }
    };

    fetchInitialProduct();
  }, []);

  return (
    <ContainerLayout
      title={isEdit ? '出荷情報編集' : '新規出荷'}
      actions={
        <PrimaryButton onClick={() => setIsOpenAddModal(true)}>
          出荷商品の選択
        </PrimaryButton>
      }
    >
      <ShipmentRegisterTable
        shipmentProducts={shipmentProducts}
        setShipmentProducts={setShipmentProducts}
        shipmentId={shipmentId}
        toStoreId={toStoreId}
        loading={loading}
      />

      <ShipmentProductAddModal
        isOpen={isOpenAddModal}
        onClose={() => setIsOpenAddModal(false)}
        shipmentProducts={shipmentProducts}
        setShipmentProducts={setShipmentProducts}
      />
    </ContainerLayout>
  );
}
