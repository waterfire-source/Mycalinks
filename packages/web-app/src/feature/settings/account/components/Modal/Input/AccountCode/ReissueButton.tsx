import SecondaryButton from '@/components/buttons/SecondaryButton';
import { AccountType } from '@/feature/account/hooks/useAccounts';
import { CodeReissueModal } from '@/feature/settings/account/components/Modal/Input/AccountCode/CodeReissueModal';
import { useState } from 'react';
interface Props {
  account: AccountType;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ReissueButton = ({ account, setCanRefetch }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <SecondaryButton
        sx={{
          width: '100px',
        }}
        onClick={() => setIsOpen(true)}
      >
        再発行
      </SecondaryButton>

      <CodeReissueModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        account={account}
        setCanRefetch={setCanRefetch}
      />
    </>
  );
};
