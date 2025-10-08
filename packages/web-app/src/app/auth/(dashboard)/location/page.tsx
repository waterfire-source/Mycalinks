'use client';
import { LocationDetailModal } from '@/app/auth/(dashboard)/location/components/LocationDetailModal';
import { LocationTable } from '@/app/auth/(dashboard)/location/components/LocationTable';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { PATH } from '@/constants/paths';
import { Location } from '@/feature/location/hooks/useLocation';
import { Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const LocationPage = () => {
  const { push } = useRouter();

  const [selectedLocation, setSelectedLocation] = useState<
    Location | undefined
  >(undefined);

  const closeModal = () => {
    setSelectedLocation(undefined);
  };

  return (
    <ContainerLayout
      title="ロケーション作成"
      actions={
        <PrimaryButton onClick={() => push(PATH.LOCATION.register())}>
          新規ロケーション作成
        </PrimaryButton>
      }
    >
      <Stack sx={{ width: '100%', height: '100%' }}>
        <LocationTable setSelectedLocation={setSelectedLocation} />
      </Stack>

      <LocationDetailModal
        selectedLocation={selectedLocation}
        closeModal={closeModal}
      />
    </ContainerLayout>
  );
};
export default LocationPage;
