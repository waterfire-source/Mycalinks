import TertiaryButton from '@/components/buttons/TertiaryButton';
import { AuthorityDeleteDialog } from '@/feature/settings/authority/components/DeleteAuthority/Dialog';
import { useState } from 'react';

interface Props {
  accountGroupId: number;
  accountsCount: number;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  onCloseEditForm: () => void;
}

export const AuthorityDeleteButton = ({
  accountGroupId,
  accountsCount,
  setCanRefetch,
  onCloseEditForm,
}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
    onCloseEditForm();
  };

  return (
    <>
      <TertiaryButton onClick={handleOpen}>削除</TertiaryButton>
      <AuthorityDeleteDialog
        isOpen={isOpen}
        handleClose={handleClose}
        accountGroupId={accountGroupId}
        accountsCount={accountsCount}
        setCanRefetch={setCanRefetch}
      />
    </>
  );
};
