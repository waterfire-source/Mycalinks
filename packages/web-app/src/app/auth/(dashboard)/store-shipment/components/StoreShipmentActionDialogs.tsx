'use client';
import { CancelShipmentDialog } from '@/app/auth/(dashboard)/store-shipment/components/CancelShipmentDialog';
import { ReshipmentDialog } from '@/app/auth/(dashboard)/store-shipment/components/ReshipmentDialog';
import { RollbackShipmentDialog } from '@/app/auth/(dashboard)/store-shipment/components/RollbackShipmentDialog';
import { ShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';

export type StoreShipmentDialogType = 'cancel' | 'rollback' | 'reship' | null;

type Props = {
  selectedInfo: ShipmentInfo['storeShipments'][number] | undefined;
  openDialog: StoreShipmentDialogType;
  setOpenDialog: (dialog: StoreShipmentDialogType) => void;
  onSuccess: () => void;
};

export const StoreShipmentActionDialogs = ({
  selectedInfo,
  openDialog,
  setOpenDialog,
  onSuccess,
}: Props) => {
  const handleClose = () => setOpenDialog(null);

  const handleSuccess = () => {
    handleClose();
    onSuccess();
  };

  return (
    <>
      <CancelShipmentDialog
        open={openDialog === 'cancel'}
        onClose={handleClose}
        shipmentInfo={selectedInfo}
        onSuccess={handleSuccess}
      />
      <RollbackShipmentDialog
        open={openDialog === 'rollback'}
        onClose={handleClose}
        shipmentInfo={selectedInfo}
        onSuccess={handleSuccess}
      />
      <ReshipmentDialog
        open={openDialog === 'reship'}
        onClose={handleClose}
        shipmentInfo={selectedInfo}
        onSuccess={handleSuccess}
      />
    </>
  );
};
