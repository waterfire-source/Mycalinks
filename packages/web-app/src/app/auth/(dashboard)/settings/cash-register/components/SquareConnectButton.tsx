import SecondaryButton from '@/components/buttons/SecondaryButton';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { useStore } from '@/contexts/StoreContext';
import { useSquareDeviceCode } from '@/feature/square/hooks/useSquareDeviceCode';

import { Typography } from '@mui/material';
import { useState } from 'react';

import { Register } from '@prisma/client';

interface Props {
  selectedRegister?: Register | null;
}
export const SquareConnectButton = ({ selectedRegister }: Props) => {
  const { createSquareDeviceCode, deviceCode } = useSquareDeviceCode();
  const { store } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Square端末との連携コードを作成
  const handleClickSquareAccount = async () => {
    try {
      setIsLoading(true);

      // Squareアカウントと連携するためのデバイスコードを作成
      if (selectedRegister) {
        await createSquareDeviceCode({
          storeID: store.id,
          registerID: selectedRegister.id,
        });
        setIsOpen(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {deviceCode ? (
        <Typography variant="body1">連携コード: {deviceCode}</Typography>
      ) : (
        <SecondaryButton onClick={handleClickSquareAccount} loading={isLoading}>
          Square端末との連携
        </SecondaryButton>
      )}
      <CustomModalWithHeader
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Square端末との連携"
      >
        <Typography variant="body1">
          Square端末との連携コード: {deviceCode}
        </Typography>
      </CustomModalWithHeader>
    </>
  );
};
