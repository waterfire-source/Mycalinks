import { FormTextField } from '@/components/inputFields/FormTextField';
import { AccountType } from '@/feature/account/hooks/useAccounts';
import { CodeInput } from '@/feature/settings/account/components/Modal/Input/AccountCode/CodeInput';
import { AccountGroupInput } from '@/feature/settings/account/components/Modal/Input/AccountGroup/AccountGroupInput';
import { PasswordInput } from '@/feature/settings/account/components/Modal/Input/Password/Input';
import { StoreInput } from '@/feature/settings/account/components/Modal/Input/StoreInput';
import { Divider, Stack } from '@mui/material';
import { Account_Group } from '@prisma/client';

interface Props {
  account: AccountType | undefined;
  accountGroups: Account_Group[];
  previousAccountGroup: Account_Group | undefined;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}
export const AccountFormContents = ({
  account,
  accountGroups,
  previousAccountGroup,
  setCanRefetch,
}: Props) => {
  const titleWidth = '100px';
  return (
    <Stack direction="row" width="100%">
      <Stack width="50%" sx={{ p: 2, gap: 2 }}>
        <FormTextField name="displayName" titleWidth={titleWidth} />
        <FormTextField name="nickName" titleWidth={titleWidth} />
        {account?.id && (
          <CodeInput
            account={account}
            setCanRefetch={setCanRefetch}
            titleWidth={titleWidth}
          />
        )}
        <FormTextField name="email" titleWidth={titleWidth} type="email" />
        {account?.id && (
          <PasswordInput accountId={account?.id} titleWidth={titleWidth} />
        )}
        <StoreInput titleWidth={titleWidth} account={account} />
      </Stack>
      <Divider orientation="vertical" flexItem sx={{ fontSize: '10px' }} />
      <Stack width="50%" sx={{ p: 2, height: '90%', overflow: 'auto' }}>
        <AccountGroupInput
          accountGroups={accountGroups}
          previousAccountGroup={previousAccountGroup}
        />
      </Stack>
    </Stack>
  );
};
