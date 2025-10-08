import { RegisterAPIRes } from '@/api/frontend/register/api';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { useStore } from '@/contexts/StoreContext';
import { useSquareDeviceCode } from '@/feature/square/hooks/useSquareDeviceCode';

import { Typography } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';

interface Props {
  onCreateRegister: () => Promise<
    RegisterAPIRes['createRegister']['response'] | undefined
  >;
  setCreatedRegisterId: Dispatch<SetStateAction<number | null>>;
}
export const SquareConnectButton = ({
  onCreateRegister,
  setCreatedRegisterId,
}: Props) => {
  const { createSquareDeviceCode, deviceCode } = useSquareDeviceCode();
  const { store } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Square端末との連携コードを作成
  const handleClickSquareAccount = async () => {
    try {
      setIsLoading(true);
      // 先にレジ情報を作成
      const register = await onCreateRegister();
      setCreatedRegisterId(register?.id ?? null);
      // Squareアカウントと連携するためのデバイスコードを作成
      if (register) {
        await createSquareDeviceCode({
          storeID: store.id,
          registerID: register.id,
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
        <Typography variant="body1">
          Square端末との連携コード: {deviceCode}
        </Typography>
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
