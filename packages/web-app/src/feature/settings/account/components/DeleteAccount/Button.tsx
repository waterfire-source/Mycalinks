import TertiaryButton from '@/components/buttons/TertiaryButton';
import { AccountDeleteDialog } from '@/feature/settings/account/components/DeleteAccount/Dialog';
import { useState } from 'react';

interface Props {
  accountId: number;
  onCloseEditModal: () => void;
}

export const AccountDeleteButton = ({ accountId, onCloseEditModal }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handleClose = () => {
    setIsOpen(false);
    onCloseEditModal();
  };

  return (
    <>
      <TertiaryButton onClick={() => setIsOpen(true)}>削除</TertiaryButton>
      <AccountDeleteDialog
        isOpen={isOpen}
        onClose={handleClose}
        accountId={accountId}
      />
    </>
  );
};
