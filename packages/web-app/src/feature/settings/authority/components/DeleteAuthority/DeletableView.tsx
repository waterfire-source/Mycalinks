import { createClientAPI, CustomError } from '@/api/implement';
import { CancelButton } from '@/components/buttons/CancelButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useAlert } from '@/contexts/AlertContext';
import { Typography } from '@mui/material';
import { Stack } from '@mui/material';

const clientAPI = createClientAPI();

interface Props {
  accountGroupId: number;
  accountsCount: number;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose: () => void;
}

export const DeletableAuthorityView = ({
  accountGroupId,
  accountsCount,
  setCanRefetch,
  handleClose,
}: Props) => {
  const { setAlertState } = useAlert();

  const handleDelete = async () => {
    if (accountsCount > 0) {
      setAlertState({
        message: `従業員に割り振られている権限のため削除できません。`,
        severity: 'error',
      });
      return;
    }

    const res = await clientAPI.accountGroup.deleteAccountGroup({
      accountGroupId: accountGroupId,
    });

    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      return;
    }
    setAlertState({
      message: `削除に成功しました。`,
      severity: 'success',
    });
    setCanRefetch(true);
    handleClose();
  };
  return (
    <Stack flex={1}>
      <Typography variant="h6" textAlign="center">
        本当に削除しますか？
      </Typography>
      <Stack gap="12px" direction="row">
        <CancelButton
          onClick={handleClose}
          sx={{ alignSelf: 'center', width: '120px' }}
        >
          削除しない
        </CancelButton>
        <PrimaryButton
          onClick={handleDelete}
          sx={{ alignSelf: 'center', width: '120px' }}
        >
          削除する
        </PrimaryButton>
      </Stack>
    </Stack>
  );
};
