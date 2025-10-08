import TertiaryButton from '@/components/buttons/TertiaryButton';
import { useState } from 'react';
import { SxProps, Theme } from '@mui/material';
import { DraftPurchaseDialog } from '@/feature/purchase/components/DraftPurchaseDialog';

type Props = {
  sx?: SxProps<Theme>;
};

// 保留会計一覧ボタン
export const DraftPurchasesButton = ({ sx }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TertiaryButton onClick={() => setIsOpen(true)} sx={sx}>
        保留一覧
      </TertiaryButton>
      <DraftPurchaseDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
