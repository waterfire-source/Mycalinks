'use client';

import { StoreAPI } from '@/api/frontend/store/api';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useStore } from '@/contexts/StoreContext';
import { AddDeliveryMethodModal } from '@/feature/ec/setting/delivery/components/AddDeliveryMethodModal';
import { DeliverySettingsDetail } from '@/feature/ec/setting/delivery/components/DeliverySettingsDetail';
import { DeliverySettingsList } from '@/feature/ec/setting/delivery/components/DeliverySettingsList';
import { useDeliveryMethod } from '@/feature/ec/setting/delivery/hooks/useDeliveryMethod';
import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';

export default function ECDeliverySettingsPage() {
  const { store } = useStore();
  const { deliveryMethods, fetchDeliveryMethods } = useDeliveryMethod();
  const [isOpenAddDeliveryMethodModal, setIsOpenAddDeliveryMethodModal] =
    useState<boolean>(false);

  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<
    StoreAPI['updateShippingMethod']['request']['body'] | null
  >(null);

  useEffect(() => {
    fetchDeliveryMethods(store.id, true);
    setSelectedDeliveryMethod(null);
  }, [store.id, fetchDeliveryMethods]);

  return (
    <>
      <ContainerLayout
        title="MycalinksMALL配送料・配送方法設定"
        helpArchivesNumber={2697}
        actions={
          <PrimaryButton onClick={() => setIsOpenAddDeliveryMethodModal(true)}>
            新規配送方法追加
          </PrimaryButton>
        }
      >
        <Stack
          width={'100%'}
          height={'100%'}
          display={'flex'}
          flexDirection={'row'}
          gap="10px"
          overflow="auto"
        >
          <Stack sx={{ width: '60%', overflowY: 'auto' }}>
            <DeliverySettingsList
              deliveryMethods={deliveryMethods}
              selectedDeliveryMethod={selectedDeliveryMethod}
              setSelectedDeliveryMethod={setSelectedDeliveryMethod}
            />
          </Stack>
          <Stack sx={{ flex: 1, overflowY: 'auto' }}>
            <DeliverySettingsDetail
              selectedDeliveryMethod={selectedDeliveryMethod}
              setSelectedDeliveryMethod={setSelectedDeliveryMethod}
              fetchDeliveryMethods={fetchDeliveryMethods}
            />
          </Stack>
        </Stack>
      </ContainerLayout>
      <AddDeliveryMethodModal
        open={isOpenAddDeliveryMethodModal}
        onClose={() => setIsOpenAddDeliveryMethodModal(false)}
        fetchDeliveryMethods={fetchDeliveryMethods}
      />
    </>
  );
}
