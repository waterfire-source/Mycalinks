import { StoreShipmentDetailTableContent } from '@/app/auth/(dashboard)/store-shipment/components/StoreShipmentDetailTableContent';
import {
  ShipmentInfo,
  useGetShipmentInfo,
} from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import { PATH } from '@/constants/paths';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = {
  storeShipmentInfo: ShipmentInfo['storeShipments'][number] | undefined;
};

export const StoreShipmentDetailTable = ({ storeShipmentInfo }: Props) => {
  const { apiProductToShipmentProduct, loading } = useGetShipmentInfo();
  const { push } = useRouter();

  const [selectedProducts, setSelectedProducts] = useState<ShipmentProduct[]>(
    [],
  );

  const editStoreShipment = () => {
    if (!storeShipmentInfo) return;
    push(PATH.STORESHIPMENT.edit(storeShipmentInfo.id));
  };

  const fetchShipmentProducts = async () => {
    const products = await apiProductToShipmentProduct(
      storeShipmentInfo?.products || [],
    );
    setSelectedProducts(products || []);
  };

  useEffect(() => {
    fetchShipmentProducts();
  }, [storeShipmentInfo]);
  return (
    <StoreShipmentDetailTableContent
      shipmentInfo={storeShipmentInfo}
      shipmentProducts={selectedProducts}
      loading={loading}
      editStoreShipment={editStoreShipment}
    />
  );
};
