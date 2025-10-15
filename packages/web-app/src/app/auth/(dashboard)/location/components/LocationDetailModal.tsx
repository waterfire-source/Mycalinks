import { LocationDetailProductTable } from '@/app/auth/(dashboard)/location/components/LocationDetailProductTable';
import { LocationDetailTable } from '@/app/auth/(dashboard)/location/components/LocationDetailTable';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { PATH } from '@/constants/paths';
import { Location } from '@/feature/location/hooks/useLocation';
import { palette } from '@/theme/palette';
import { Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = { selectedLocation: Location | undefined; closeModal: () => void };

export const LocationDetailModal = ({
  selectedLocation,
  closeModal,
}: Props) => {
  const { push } = useRouter();

  const [isOpenSelectActionModal, setIsOpenSelectActionModal] = useState(false);
  return (
    <CustomModalWithIcon
      open={!!selectedLocation}
      onClose={closeModal}
      title={
        selectedLocation?.status === 'CREATED' ? (
          <Typography>ロケーション詳細：確保中 </Typography>
        ) : (
          <Typography>
            ロケーション詳細：
            <span style={{ color: palette.primary.main }}>解体済み</span>
          </Typography>
        )
      }
      width="90%"
      height="90%"
      cancelButtonText="とじる"
      onActionButtonClick={
        selectedLocation?.status === 'CREATED'
          ? () => setIsOpenSelectActionModal(true)
          : undefined
      }
      actionButtonText={
        selectedLocation?.status === 'CREATED' ? 'ロケーション解体' : undefined
      }
    >
      <Stack sx={{ width: '100%', height: '100%' }} spacing={2}>
        <Stack sx={{ minWidth: 0 }}>
          <LocationDetailTable selectedLocation={selectedLocation} />
        </Stack>
        <Stack sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <LocationDetailProductTable selectedLocation={selectedLocation} />
        </Stack>
      </Stack>

      <ConfirmationDialog
        title="登録の方法を選択"
        open={isOpenSelectActionModal}
        onClose={() => setIsOpenSelectActionModal(false)}
        isCancelButtonVisible={false}
        content={
          <Stack direction="row" spacing={3}>
            <SecondaryButton
              onClick={() =>
                push(PATH.LOCATION.release(selectedLocation?.id || -1, 'out'))
              }
            >
              出ていったものを登録
            </SecondaryButton>
            <PrimaryButton
              onClick={() =>
                push(
                  PATH.LOCATION.release(selectedLocation?.id || -1, 'remain'),
                )
              }
            >
              残っているものを登録
            </PrimaryButton>
          </Stack>
        }
      />
    </CustomModalWithIcon>
  );
};
