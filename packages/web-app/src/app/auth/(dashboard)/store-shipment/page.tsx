'use client';
import { CreateShipmentModal } from '@/app/auth/(dashboard)/store-shipment/components/CreateShipmentModal';
import { RelationSettingModal } from '@/app/auth/(dashboard)/store-shipment/components/RelationSettingModal';
import { SearchStoreShipment } from '@/app/auth/(dashboard)/store-shipment/components/SearchStoreShipment';
import { StoreShipmentDetailModal } from '@/app/auth/(dashboard)/store-shipment/components/StoreShipmentDetailModal';
import { StoreShipmentTabTable } from '@/app/auth/(dashboard)/store-shipment/components/StoreShipmentTabTable';
import { useGetShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { HelpIcon } from '@/components/common/HelpIcon';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useStore } from '@/contexts/StoreContext';
import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function StoreShipmentPage() {
  const { store } = useStore();
  const { fetchShipmentInfo, shipmentInfo } = useGetShipmentInfo();

  const [isOpenNewShipmentModal, setIsOpenNewShipmentModal] = useState(false);
  const [openRelationSettingModal, setOpenRelationSettingModal] =
    useState(false);
  const [whichStoreShipmentDetailIsOpen, setWhichStoreShipmentDetailIsOpen] =
    useState<number | undefined>(undefined);

  useEffect(() => {
    fetchShipmentInfo();
  }, [store.id]);

  return (
    <>
      <ContainerLayout
        title="出荷管理"
        isFullWidthTitle={false}
        actions={
          <Stack
            width="100%"
            justifyContent="space-between"
            alignItems="center"
            flexDirection="row"
          >
            <Typography variant="body1">
              状態の紐づけが完了していない店舗へは出荷できません。先に状態の紐づけを行ってください。
            </Typography>
            <Stack direction="row" gap={1} ml={2} mt={1}>
              <HelpIcon helpArchivesNumber={4335} />
              <PrimaryButtonWithIcon
                onClick={() => setIsOpenNewShipmentModal(true)}
              >
                新規出荷登録
              </PrimaryButtonWithIcon>
              <SecondaryButton
                onClick={() => setOpenRelationSettingModal(true)}
              >
                状態等の紐づけ
              </SecondaryButton>
            </Stack>
          </Stack>
        }
      >
        {/* 検索バー */}
        <SearchStoreShipment />
        {/* 出荷管理テーブル */}
        <StoreShipmentTabTable
          storeShipments={shipmentInfo?.storeShipments || []}
          setWhichStoreShipmentDetailIsOpen={setWhichStoreShipmentDetailIsOpen}
        />
      </ContainerLayout>

      {/* // 状態等の紐付けmodal */}
      {openRelationSettingModal && (
        <RelationSettingModal
          onClose={() => {
            fetchShipmentInfo();
            setOpenRelationSettingModal(false);
          }}
        />
      )}

      <CreateShipmentModal
        isOpen={isOpenNewShipmentModal}
        onClose={() => setIsOpenNewShipmentModal(false)}
      />

      <StoreShipmentDetailModal
        shipmentInfo={shipmentInfo}
        fetchShipmentInfo={fetchShipmentInfo}
        whichStoreShipmentDetailIsOpen={whichStoreShipmentDetailIsOpen}
        setWhichStoreShipmentDetailModal={setWhichStoreShipmentDetailIsOpen}
      />
    </>
  );
}
