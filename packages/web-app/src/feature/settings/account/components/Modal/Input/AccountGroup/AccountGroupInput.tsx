import { useFieldNameMap } from '@/contexts/FormErrorContext';
import { AuthorityList } from '@/feature/settings/account/components/Modal/Input/AccountGroup/List';
import { MenuItem, Select, Stack, Typography } from '@mui/material';
import { Account_Group } from '@prisma/client';
import { useFormContext } from 'react-hook-form';

interface Props {
  previousAccountGroup: Account_Group | undefined;
  accountGroups: Account_Group[];
}

export const AccountGroupInput = ({
  previousAccountGroup,
  accountGroups,
}: Props) => {
  const { setValue, watch } = useFormContext();
  const name = 'groupId';
  const selectedAccountGroup = accountGroups?.find(
    (accountGroup) => accountGroup.id === watch(name),
  );

  const fieldNameMap = useFieldNameMap();
  const fieldDisplayName = fieldNameMap[name] || name;

  return (
    <Stack gap={2} height="100%">
      <Stack direction="row" alignItems="center" gap="10px">
        <Typography>{fieldDisplayName}</Typography>
        {previousAccountGroup && (
          <Typography>{previousAccountGroup.display_name} →</Typography>
        )}
        <Select
          size="small"
          sx={{ minWidth: '100px' }}
          onChange={(e) => setValue(name, e.target.value)}
        >
          <MenuItem value={0}>選択してください</MenuItem>
          {accountGroups?.map((accountGroup) => (
            <MenuItem key={accountGroup.id} value={accountGroup.id}>
              {accountGroup.display_name}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <AuthorityList
        previousAccountGroup={previousAccountGroup}
        selectedAccountGroup={selectedAccountGroup}
      />
    </Stack>
  );
};
