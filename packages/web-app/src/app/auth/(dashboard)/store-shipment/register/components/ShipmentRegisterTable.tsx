import { createClientAPI, CustomError } from '@/api/implement';
import { ShipmentRegisterTableContent } from '@/app/auth/(dashboard)/store-shipment/register/components/ShipmentRegisterTableContent';
import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { MycaPosApiClient } from 'api-generator/client';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';

type Props = {
  shipmentProducts: ShipmentProduct[];
  setShipmentProducts: Dispatch<SetStateAction<ShipmentProduct[]>>;
  shipmentId: number;
  toStoreId: number;
  loading: boolean;
};

export const ShipmentRegisterTable = ({
  shipmentProducts,
  setShipmentProducts,
  shipmentId,
  toStoreId,
  loading: fetching,
}: Props) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const { push } = useRouter();

  const [loading, setLoading] = useState(false);

  const apiClient = useMemo(() => createClientAPI(), [store.id]);
  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({ BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api` }),
    [store.id],
  );

  const handleCountChange = (productId: number, value: number) => {
    setShipmentProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, itemCount: value } : p)),
    );
  };

  const handleDelete = (productId: number) => {
    setShipmentProducts((prev) =>
      prev.filter((product) => product.id !== productId),
    );
  };

  const handleReject = () => {
    push(PATH.STORESHIPMENT.root);
  };

  const save = async () => {
    try {
      setLoading(true);

      const wholesalePrices = await Promise.all(
        shipmentProducts.map(async (cur) => {
          const productId = cur.id;
          const count = cur.itemCount;
          const res = await apiClient.product.getWholesalePrice({
            storeID: store.id,
            productID: productId,
            itemCount: count,
          });
          if (res instanceof CustomError) throw res;
          return res.totalWholesalePrice;
        }),
      );

      const totalWholesalePrice = wholesalePrices.reduce(
        (prev, cur) => prev + cur,
        0,
      );

      const requestBody = shipmentId
        ? {
            id: shipmentId,
            total_wholesale_price: totalWholesalePrice,
            products: shipmentProducts.map((p) => ({
              product_id: p.id,
              item_count: p.itemCount,
            })),
          }
        : {
            to_store_id: toStoreId!,
            total_wholesale_price: totalWholesalePrice,
            shipment_date: new Date().toString(),
            products: shipmentProducts.map((p) => ({
              product_id: p.id,
              item_count: p.itemCount,
            })),
          };

      const res =
        await mycaPosApiClient.storeShipment.createOrUpdateStoreShipment({
          storeId: store.id,
          requestBody,
        });

      if (res instanceof CustomError) throw res;

      setAlertState({
        message: '出荷情報を保存しました',
        severity: 'success',
      });

      return res.id;
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemporarySave = async () => {
    const isOk = await save();
    if (isOk) {
      push(PATH.STORESHIPMENT.root);
    }
  };

  const handleNextStage = async () => {
    const returnShipmentId = await save();
    if (returnShipmentId) {
      push(PATH.STORESHIPMENT.apply(returnShipmentId));
    }
  };

  return (
    <ShipmentRegisterTableContent
      shipmentProducts={shipmentProducts}
      handleCountChange={handleCountChange}
      handleDelete={handleDelete}
      handleTemporarySave={handleTemporarySave}
      handleNextStage={handleNextStage}
      handleReject={handleReject}
      loading={fetching}
      buttonLoading={loading}
    />
  );
};
