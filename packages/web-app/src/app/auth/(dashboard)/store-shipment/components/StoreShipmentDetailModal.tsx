import {
  StoreShipmentDialogType,
  StoreShipmentActionDialogs,
} from '@/app/auth/(dashboard)/store-shipment/components/StoreShipmentActionDialogs';
import { StoreShipmentDetailCard } from '@/app/auth/(dashboard)/store-shipment/components/StoreShipmentDetailCard';
import { StoreShipmentDetailTable } from '@/app/auth/(dashboard)/store-shipment/components/StoreShipmentDetailTable';
import { useGetAllStore } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetAllStore';
import { ShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { Stack } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type Props = {
  shipmentInfo: ShipmentInfo | undefined;
  fetchShipmentInfo: () => void;
  whichStoreShipmentDetailIsOpen: number | undefined;
  setWhichStoreShipmentDetailModal: Dispatch<
    SetStateAction<number | undefined>
  >;
};

export const StoreShipmentDetailModal = ({
  shipmentInfo,
  fetchShipmentInfo,
  whichStoreShipmentDetailIsOpen,
  setWhichStoreShipmentDetailModal,
}: Props) => {
  const { fetchAllStores, allStores } = useGetAllStore();

  const [openDialog, setOpenDialog] = useState<StoreShipmentDialogType>(null);
  const [selectedInfo, setSelectedInfo] =
    useState<ShipmentInfo['storeShipments'][number]>();

  const onClose = () => setWhichStoreShipmentDetailModal(undefined);

  const getActionTitle = (status?: string) => {
    switch (status) {
      case 'NOT_YET':
        return '出荷キャンセル';
      case 'SHIPPED':
        return '出荷取り消し';
      case 'CANCELED':
        return '再出荷';
      default:
        return '';
    }
  };

  const getOnClickAction = (status?: string) => {
    switch (status) {
      case 'NOT_YET':
        return () => setOpenDialog('cancel');
      case 'SHIPPED':
        return () => setOpenDialog('rollback');
      case 'CANCELED':
        return () => setOpenDialog('reship');
      default:
        return undefined;
    }
  };

  const handleSuccess = () => {
    fetchShipmentInfo();
    onClose();
  };

  useEffect(() => {
    setSelectedInfo(() => {
      if (!shipmentInfo) return undefined;
      return shipmentInfo.storeShipments.find(
        (s) => s.id === whichStoreShipmentDetailIsOpen,
      );
    });
  }, [whichStoreShipmentDetailIsOpen, shipmentInfo]);

  useEffect(() => {
    fetchAllStores();
  }, []);

  return (
    <CustomModalWithIcon
      open={!!whichStoreShipmentDetailIsOpen}
      onClose={onClose}
      title="出荷詳細"
      cancelButtonText="閉じる"
      width="90%"
      height="90%"
      secondActionButtonText={getActionTitle(selectedInfo?.status)}
      onSecondActionButtonClick={getOnClickAction(selectedInfo?.status)}
    >
      <Stack direction="row" width="100%" height="100%" spacing={2}>
        <Stack sx={{ flex: 3 }}>
          <StoreShipmentDetailCard
            storeShipmentInfo={selectedInfo}
            allStores={allStores}
          />
        </Stack>
        <Stack sx={{ flex: 5 }}>
          <StoreShipmentDetailTable storeShipmentInfo={selectedInfo} />
        </Stack>
      </Stack>

      <StoreShipmentActionDialogs
        selectedInfo={selectedInfo}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        onSuccess={handleSuccess}
      />
    </CustomModalWithIcon>
  );
};
