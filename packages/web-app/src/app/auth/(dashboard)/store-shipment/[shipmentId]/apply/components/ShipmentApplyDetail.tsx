import { CustomError } from '@/api/implement';
import { ShipmentApplyDetailContent } from '@/app/auth/(dashboard)/store-shipment/[shipmentId]/apply/components/ShipmentApplyDetailContent';
import { ShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { MycaPosApiClient } from 'api-generator/client';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

type Props = {
  shipmentInfo: ShipmentInfo | undefined;
  setShipmentInfo: Dispatch<SetStateAction<ShipmentInfo | undefined>>;

  shipmentProducts: ShipmentProduct[];
};

export const ShipmentApplyDetail = ({
  shipmentInfo,
  setShipmentInfo,
  shipmentProducts,
}: Props) => {
  const { store } = useStore();
  const { push } = useRouter();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const [aborting, setAborting] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [shipmentStores, setShipmentStores] = useState<
    {
      id: number;
      displayName: string;
    }[]
  >([]);

  const shipmentId = shipmentInfo?.storeShipments[0].id;
  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({ BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api` }),
    [store.id],
  );

  const fetchShipmentStores = async () => {
    try {
      const res = await mycaPosApiClient.store.getRelationToStore({
        storeId: store.id,
        mappingDefined: true,
      });

      if (res instanceof CustomError) throw res;

      setShipmentStores(() => {
        return res.storeRelations.map((r) => ({
          id: r.to_store_id,
          displayName: r.to_store.display_name || '',
        }));
      });
    } catch (err) {
      handleError(err);
    }
  };

  const save = async () => {
    try {
      const requestBody = {
        id: shipmentId,
        shipment_date: shipmentInfo?.storeShipments[0].shipment_date.toString(),
        to_store_id: shipmentInfo?.storeShipments[0].to_store_id,
        description: shipmentInfo?.storeShipments[0].description,
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

      return res;
    } catch (err) {
      handleError(err);
    }
  };

  const handleAbortShipment = async () => {
    setAborting(true);
    await save();
    push(PATH.STORESHIPMENT.root);
    setAborting(false);
  };

  const handleReregisterShipment = async () => {
    await save();
    push(PATH.STORESHIPMENT.edit(shipmentId!));
  };

  const handleApplyShipment = async () => {
    try {
      setShipping(true);
      await save();

      const res = await mycaPosApiClient.storeShipment.applyStoreShipment({
        storeId: store.id,
        storeShipmentId: shipmentId!,
      });

      if (res instanceof CustomError) throw res;

      setAlertState({ message: '出荷に成功しました', severity: 'success' });

      push(PATH.STORESHIPMENT.root);
    } catch (err) {
      handleError(err);
    } finally {
      setShipping(false);
    }
  };

  const editShipmentInfo = (filed: string, value: any) => {
    setShipmentInfo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        storeShipments: prev.storeShipments.map((shipment) => ({
          ...shipment,
          [filed]: value,
        })),
      };
    });
  };

  useEffect(() => {
    fetchShipmentStores();
  }, [shipmentProducts]);

  return (
    <ShipmentApplyDetailContent
      shipmentInfo={shipmentInfo}
      shipmentStores={shipmentStores}
      handleAbortShipment={handleAbortShipment}
      handleApplyShipment={handleApplyShipment}
      handleReregisterShipment={handleReregisterShipment}
      editShipmentInfo={editShipmentInfo}
      shipping={shipping}
      aborting={aborting}
    />
  );
};
