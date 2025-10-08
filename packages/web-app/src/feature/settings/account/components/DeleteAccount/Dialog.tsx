import { useAccounts } from '@/feature/account/hooks/useAccounts';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
  accountId: number;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AccountDeleteDialog = ({
  isOpen,
  setIsOpen,
  onClose,
  accountId,
  setCanRefetch,
}: Props) => {
  const { deleteAccount } = useAccounts();
  const handleDelete = async () => {
    await deleteAccount(accountId);
    setCanRefetch(true);
    onClose();
  };

  return (
    <ConfirmationDialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={handleDelete}
      title="アカウントを削除"
      message="本当に削除しますか？"
      confirmButtonText="削除する"
      cancelButtonText="削除しない"
    />
  );
};
