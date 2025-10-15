import { useState } from 'react';
import { ModalType } from '@/feature/settings/authority/components/Modal';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { AccountType } from '@/feature/account/hooks/useAccounts';
import { AccountModal } from '@/feature/settings/account/components/Modal/Modal';
import { AccountGroupType } from '@/feature/account/hooks/useAccountGroup';
interface Props {
  modalType: ModalType;
  account: AccountType | undefined;
  accountGroups: AccountGroupType[];
  fetchData: () => Promise<void>;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

export const OpenModalButton = ({
  modalType,
  account,
  accountGroups,
  fetchData,
  setCanRefetch,
}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const buttonText =
    modalType === ModalType.Create ? '新規従業員追加' : '従業員編集';

  return (
    <>
      <PrimaryButton onClick={() => setIsOpen(true)}>
        {buttonText}
      </PrimaryButton>
      <AccountModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        modalType={modalType}
        account={account}
        accountGroups={accountGroups}
        fetchData={fetchData}
        setCanRefetch={setCanRefetch}
      />
    </>
  );
};
