import SecondaryButton from '@/components/buttons/SecondaryButton';
import { Stack, SxProps } from '@mui/material';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
export const HeaderStaffAccount = ({ sx }: { sx?: SxProps }) => {
  const { setIsOpenStaffAccountChangeModal } = useAccountGroupContext();
  return (
    <Stack>
      <SecondaryButton
        onClick={() => setIsOpenStaffAccountChangeModal(true)}
        sx={sx}
      >
        従業員バーコード読み取り
      </SecondaryButton>
    </Stack>
  );
};
