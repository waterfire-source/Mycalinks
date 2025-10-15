import { AccountType } from '@/feature/account/hooks/useAccounts';
import { ReissueButton } from '@/feature/settings/account/components/Modal/Input/AccountCode/ReissueButton';
import { Typography } from '@mui/material';
import { Stack } from '@mui/material';

interface Props {
  titleWidth: string;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  account: AccountType | undefined;
}

export const CodeInput = ({ account, titleWidth, setCanRefetch }: Props) => {
  const accountCode = account ? account.code?.toString() : '●●●●●●●●●';
  return (
    <>
      <Stack direction="row" alignItems="center">
        <Typography fontWeight="bold" sx={{ width: titleWidth }}>
          従業員番号
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flex={1}
        >
          <Typography fontWeight="bold" sx={{ width: titleWidth }}>
            {accountCode}
          </Typography>
          {account && (
            <ReissueButton account={account} setCanRefetch={setCanRefetch} />
          )}
        </Stack>
      </Stack>
    </>
  );
};
