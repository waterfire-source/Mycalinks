import { createClientAPI, CustomError } from '@/api/implement';
import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { getStoreShipmentApi } from 'api-generator';
import { MycaPosApiClient } from 'api-generator/client';
import { useMemo, useState } from 'react';
import z from 'zod';

export type ShipmentInfo = z.infer<typeof getStoreShipmentApi.response>;

export const useGetShipmentInfo = () => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();

  const [loading, setLoading] = useState(false);
  const [shipmentInfo, setShipmentInfo] = useState<ShipmentInfo>();

  const apiClient = useMemo(() => createClientAPI(), [store.id]);
  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({ BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api` }),
    [store.id],
  );

  const fetchShipmentInfo = async (shipmentId?: number) => {
    try {
      setLoading(true);
      const res = await mycaPosApiClient.storeShipment.getStoreShipment({
        storeId: store.id,
        id: shipmentId,
      });

      if (res instanceof CustomError) throw res;
      //tk:todo:stringをDateへ
      setShipmentInfo(res);
      return res;
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const apiProductToShipmentProduct = async (
    apiProducts: ShipmentInfo['storeShipments'][0]['products'],
  ): Promise<ShipmentProduct[] | undefined> => {
    try {
      setLoading(true);

      if (apiProducts.length === 0) return;
      const ids = apiProducts.map((p) => p.product_id);
      const res = await apiClient.product.listProducts({
        storeID: store.id,
        id: ids,
      });

      if (res instanceof CustomError) throw res;

      return res.products.map((resProduct) => {
        const targetProduct = apiProducts.find(
          (p) => resProduct.id === p.product_id,
        );
        return { ...resProduct, itemCount: targetProduct?.item_count || 0 };
      });
    } catch (err) {
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    shipmentInfo,
    setShipmentInfo,
    fetchShipmentInfo,
    apiProductToShipmentProduct,
  };
};
