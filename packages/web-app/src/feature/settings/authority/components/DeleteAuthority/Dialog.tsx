import { createClientAPI, CustomError } from '@/api/implement';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useAlert } from '@/contexts/AlertContext';

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  accountGroupId: number;
  accountsCount: number;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

const clientAPI = createClientAPI();

export const AuthorityDeleteDialog = ({
  isOpen,
  handleClose,
  accountGroupId,
  accountsCount,
  setCanRefetch,
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

  // 該当の権限に割り当てられているアカウントが一つもない時のみ削除可能
  const isDeletable = accountsCount === 0;

  return (
    <ConfirmationDialog
      open={isOpen}
      onClose={handleClose}
      title="権限を削除"
      message={
        isDeletable
          ? '本当に削除しますか？'
          : 'すでに従業員に割り振られている権限のため削除できません。'
      }
      confirmButtonText={isDeletable ? '削除する' : '戻る'}
      cancelButtonText="削除しない"
      onConfirm={() => {
        if (isDeletable) {
          handleDelete();
        }
        setCanRefetch(true);
        handleClose();
      }}
    />
  );
};
