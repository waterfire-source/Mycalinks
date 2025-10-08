import { useState } from 'react';
import {
  AuthorityModal,
  ModalType,
} from '@/feature/settings/authority/components/Modal';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { AccountGroupType } from '@/feature/account/hooks/useAccountGroup';
interface Props {
  modalType: ModalType;
  accountGroup: AccountGroupType | null;
  existingAccountGroups: AccountGroupType[];
  accountsCount: number;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

export const OpenModalButton = ({
  modalType,
  accountGroup,
  existingAccountGroups,
  accountsCount,
  setCanRefetch,
}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <PrimaryButton onClick={() => setIsOpen(true)}>
        {modalType === ModalType.Create ? '新規権限作成' : '権限を編集'}
      </PrimaryButton>
      <AuthorityModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        modalType={modalType}
        existingAccountGroups={existingAccountGroups}
        accountGroup={accountGroup}
        accountsCount={accountsCount}
        setCanRefetch={setCanRefetch}
      />
    </>
  );
};
