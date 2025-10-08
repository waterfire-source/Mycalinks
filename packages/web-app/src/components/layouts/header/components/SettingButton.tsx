import SecondaryButton from '@/components/buttons/SecondaryButton';
import { EposDeviceModal } from '@/components/layouts/header/components/EposDeviceModal';
import { HeaderStaffAccount } from '@/components/layouts/header/components/HeaderStaffAccount';
import { LabelPrinterHistoryModal } from '@/components/layouts/header/components/LabelPrinterHistoryModal';
import { StoreStatus } from '@/components/layouts/header/components/StoreStatus';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { Stack } from '@mui/material';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { PosRunMode } from '@/types/next-auth';
import { StockUrlButton } from '@/components/layouts/header/components/StockUrlButton';
export const HeaderSettingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const isSales = session?.user.mode === PosRunMode.sales;
  const BUTTON_HEIGHT = '60px';
  return (
    <>
      <SecondaryButton onClick={() => setIsOpen(true)}>
        各種設定
      </SecondaryButton>
      <CustomModalWithHeader
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="各種設定"
      >
        <Stack direction="column" gap={2}>
          <StockUrlButton sx={{ height: BUTTON_HEIGHT }} />
          <StoreStatus sx={{ height: BUTTON_HEIGHT }} />
          <EposDeviceModal sx={{ height: BUTTON_HEIGHT }} />
          <LabelPrinterHistoryModal sx={{ height: BUTTON_HEIGHT }} />
          {/* 販売モードの時は従業員バーコードを読み取るボタンを表示 */}
          {isSales && <HeaderStaffAccount sx={{ height: BUTTON_HEIGHT }} />}
          <SecondaryButton
            onClick={() => {
              signOut();
            }}
            sx={{ mt: 4, height: BUTTON_HEIGHT }}
          >
            ログアウト
          </SecondaryButton>
        </Stack>
      </CustomModalWithHeader>
    </>
  );
};
