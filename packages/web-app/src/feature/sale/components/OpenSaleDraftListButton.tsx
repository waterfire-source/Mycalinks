import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { DraftSaleList } from '@/feature/sale/components/DraftSaleList';
import { SxProps, Theme, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';

type Props = {
  sx?: SxProps<Theme>;
};

export const OpenSaleDraftButton = ({ sx }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const theme = useTheme();
  const isIpadSize = useMediaQuery(theme.breakpoints.down('lg'));
  return (
    <>
      <SecondaryButtonWithIcon onClick={() => setIsOpen(true)} sx={sx}>
        会計保留一覧
      </SecondaryButtonWithIcon>
      <CustomModalWithIcon
        title="販売保留"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width="90%"
        height="85%"
        hideButtons={true}
      >
        <DraftSaleList setIsOpen={setIsOpen} isIpadSize={isIpadSize} />
      </CustomModalWithIcon>
    </>
  );
};
