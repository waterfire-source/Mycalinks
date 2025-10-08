import { SxProps, Theme, useMediaQuery, useTheme } from '@mui/material';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useState } from 'react';
import DraftPurchaseList from '@/feature/purchase/components/DraftPurchaseList';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';

type Props = {
  sx?: SxProps<Theme>;
};

// 保留会計一覧
export const OpenPurchaseDraftListButton = ({ sx }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const theme = useTheme();
  const isIpadSize = useMediaQuery(theme.breakpoints.down('lg'));
  return (
    <>
      <SecondaryButtonWithIcon onClick={() => setIsOpen(true)} sx={sx}>
        保留一覧
      </SecondaryButtonWithIcon>
      <CustomModalWithIcon
        title={'買取保留'}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width="90%"
        height="85%"
        hideButtons={true}
      >
        <DraftPurchaseList setIsOpen={setIsOpen} isIpadSize={isIpadSize} />
      </CustomModalWithIcon>
    </>
  );
};
