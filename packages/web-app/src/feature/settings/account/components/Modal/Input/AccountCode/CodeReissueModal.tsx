import { Stack, TextField, Typography } from '@mui/material';
import { StyledAlertConfirmationModal } from '@/components/modals/StyledAlertConfirmationModal';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { AccountType } from '@/feature/account/hooks/useAccounts';
import { useState } from 'react';
interface Props {
  isOpen: boolean;
  onClose: () => void;
  account: AccountType;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CodeReissueModal = ({
  isOpen,
  onClose,
  account,
  setCanRefetch,
}: Props) => {
  const clientAPI = createClientAPI();
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  const onConfirm = async (staffAccount: AccountType) => {
    try {
      setIsLoading(true);
      const res = await clientAPI.account.updateStaffCode({
        accountId: staffAccount.id.toString(),
        currentPassword: password,
        regenerateCode: true,
      });
      if (res instanceof CustomError) {
        setAlertState({
          message: res.message,
          severity: 'error',
        });
        return;
      }
      setAlertState({
        message: '従業員番号の再発行に成功しました',
        severity: 'success',
      });
      setCanRefetch(true);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const message = (
    <Typography variant="h1" sx={{ mb: 1 }}>
      今までの番号は使えなくなります
    </Typography>
  );
  const [password, setPassword] = useState('');

  return (
    <>
      <StyledAlertConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={() => onConfirm(account)}
        message={message}
        confirmButtonText="再発行"
        cancelButtonText="戻る"
        title="従業員番号再発行"
        isLoading={isLoading}
      >
        <Stack gap={1}>
          <Typography variant="body2">パスワード</Typography>
          <TextField
            type="password"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Stack>
      </StyledAlertConfirmationModal>
    </>
  );
};
