import SecondaryButton from '@/components/buttons/SecondaryButton';
import { UpdatePasswordDialog } from '@/feature/settings/account/components/Modal/Input/Password/UpdatePasswordDialog';
import { Typography } from '@mui/material';
import { Stack } from '@mui/material';
import { useState } from 'react';

interface Props {
  accountId: number | null | undefined;
  titleWidth: string;
}

export const PasswordInput = ({ accountId, titleWidth }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <Stack direction="row" alignItems="center" gap={2}>
      <Typography fontWeight="bold" sx={{ width: titleWidth }}>
        パスワード
      </Typography>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flex={1}
      >
        <Typography>●●●●●●●●●</Typography>
        {accountId && (
          <>
            <SecondaryButton onClick={handleOpen}>変更</SecondaryButton>
            <UpdatePasswordDialog
              isOpen={isOpen}
              onClose={handleClose}
              accountId={accountId}
            />
          </>
        )}
      </Stack>
    </Stack>
  );
};
