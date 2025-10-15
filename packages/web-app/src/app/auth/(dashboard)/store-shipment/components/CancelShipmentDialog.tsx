'use client';
import { ShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { MycaPosApiClient } from 'api-generator/client';
import { CustomError } from '@/api/implement';
import { useMemo, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  shipmentInfo: ShipmentInfo['storeShipments'][number] | undefined;
  onSuccess: () => void;
};

export const CancelShipmentDialog = ({
  open,
  onClose,
  shipmentInfo,
  onSuccess,
}: Props) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const [loading, setLoading] = useState(false);

  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({ BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api` }),
    [],
  );

  const handleConfirm = async () => {
    if (!shipmentInfo) return;

    try {
      setLoading(true);
      const res = await mycaPosApiClient.storeShipment.cancelStoreShipment({
        storeId: store.id,
        storeShipmentId: shipmentInfo.id,
      });

      if (res instanceof CustomError) throw res;

      setAlertState({
        message: '出荷をキャンセルしました',
        severity: 'success',
      });

      onSuccess();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="出荷キャンセル"
      message="この出荷をキャンセルしますか？"
      onConfirm={handleConfirm}
      confirmButtonText="出荷キャンセル"
      confirmButtonLoading={loading}
    />
  );
};
