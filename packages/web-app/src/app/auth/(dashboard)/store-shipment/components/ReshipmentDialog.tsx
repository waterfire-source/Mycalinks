'use client';
import { CustomError } from '@/api/implement';
import { ShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { MycaPosApiClient } from 'api-generator/client';
import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  shipmentInfo: ShipmentInfo['storeShipments'][number] | undefined;
  onSuccess: () => void;
};

export const ReshipmentDialog = ({
  open,
  onClose,
  shipmentInfo,
  onSuccess,
}: Props) => {
  const { setAlertState } = useAlert();
  const { store } = useStore();

  const [loading, setLoading] = useState(false);

  const mycaPosApiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const handleConfirm = async () => {
    if (!shipmentInfo) return;

    try {
      setLoading(true);

      const res = await mycaPosApiClient.storeShipment.reshipStoreShipment({
        storeId: store.id,
        storeShipmentId: shipmentInfo.id,
      });

      if (res instanceof CustomError) throw res;

      setAlertState({
        message: '再出荷しました',
        severity: 'success',
      });

      onSuccess();
    } catch (err) {
      console.error('Reship error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="再出荷"
      message="この商品を再出荷しますか？"
      onConfirm={handleConfirm}
      confirmButtonText="再出荷"
      confirmButtonLoading={loading}
    />
  );
};
