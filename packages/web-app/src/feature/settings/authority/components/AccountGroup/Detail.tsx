import { Box, Stack, Typography, useTheme } from '@mui/material';
import { Account_Group } from '@prisma/client';
import {
  AuthorityItem,
  authorityItems,
} from '@/feature/settings/authority/utils/useForm';
import { AccountGroupType } from '@/feature/account/hooks/useAccountGroup';
interface Props {
  accountGroup: AccountGroupType | undefined;
}

export const AccountGroupDetail = ({ accountGroup }: Props) => {
  const { palette } = useTheme();
  const groupedAuthorities = authorityItems.reduce(
    (acc, item) => {
      if (!acc[item.screen]) {
        acc[item.screen] = [];
      }
      acc[item.screen].push(item);
      return acc;
    },
    {} as Record<string, AuthorityItem[]>,
  );

  const isEnable = (action: AuthorityItem) => {
    return accountGroup && accountGroup[action.id as keyof Account_Group];
  };

  if (accountGroup === undefined) {
    return <Typography>リストを選択して詳細を表示</Typography>;
  }
  return (
    <Stack gap={1}>
      {accountGroup ? (
        <>
          {Object.entries(groupedAuthorities).map(([screen, actions]) => (
            <Stack key={screen} direction="row">
              <Box
                sx={{
                  border: `1px solid ${palette.grey[300]}`,
                  flex: 1,
                  py: 'auto',
                  alignItems: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2">{screen}</Typography>
              </Box>

              <Stack flex={3}>
                {actions.map((action) => (
                  <Stack key={action.id} direction="row">
                    <Typography
                      key={action.id}
                      flex={3}
                      border={`1px solid ${palette.grey[300]}`}
                      sx={{
                        p: 1,
                      }}
                    >
                      {action.action}：
                    </Typography>
                    <Typography
                      border={`1px solid ${palette.grey[300]}`}
                      flex={1}
                      sx={{
                        p: 1,
                        color: isEnable(action)
                          ? palette.primary.main
                          : palette.text.primary,
                      }}
                    >
                      {isEnable(action) ? '可' : '不可'}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          ))}
        </>
      ) : (
        <Typography>リストを選択して詳細を表示</Typography>
      )}
    </Stack>
  );
};
