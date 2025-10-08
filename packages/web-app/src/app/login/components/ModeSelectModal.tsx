import { ModeBox } from '@/app/login/components/ModeBox';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { PosRunMode } from '@/types/next-auth';
import { Stack, useMediaQuery } from '@mui/material';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  posRunMode: PosRunMode | null;
  setPosRunMode: (posRunMode: PosRunMode) => void;
  adminLogin: () => void;
}
export const ModeSelectModal = ({
  open,
  onClose,
  posRunMode,
  setPosRunMode,
  adminLogin,
}: Props) => {
  const isMobile = useMediaQuery('(max-width: 600px)');
  const [selectedMode, setSelectedMode] = useState<PosRunMode>(
    posRunMode ?? PosRunMode.sales,
  );
  const handleLogin = () => {
    if (selectedMode === PosRunMode.admin) {
      adminLogin();
      return;
    }
    // 管理者モードでない場合は、ログインモードを選択したモードに設定
    setPosRunMode(selectedMode);
    onClose();
  };
  return (
    <CustomModalWithIcon
      title="ログインモードを選択"
      open={open}
      onClose={onClose}
      width={isMobile ? '80%' : 400}
      height={250}
      actionButtonText="ログイン"
      cancelButtonText="キャンセル"
      onActionButtonClick={handleLogin}
    >
      <Stack
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          gap: '16px',
        }}
      >
        <ModeBox
          mode={PosRunMode.sales}
          onClick={() => setSelectedMode(PosRunMode.sales)}
          selectedMode={selectedMode}
        />
        <ModeBox
          mode={PosRunMode.admin}
          onClick={() => setSelectedMode(PosRunMode.admin)}
          selectedMode={selectedMode}
        />
      </Stack>
    </CustomModalWithIcon>
  );
};
