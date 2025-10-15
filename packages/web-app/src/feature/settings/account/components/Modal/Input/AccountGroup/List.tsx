import { Typography } from '@mui/material';

import { palette } from '@/theme/palette';
import { Stack } from '@mui/material';
import { authorityItems } from '@/feature/settings/authority/utils/useForm';
import { Account_Group } from '@prisma/client';

interface Props {
  previousAccountGroup: Account_Group | undefined;
  selectedAccountGroup: Account_Group | undefined;
}
export const AuthorityList = ({
  previousAccountGroup,
  selectedAccountGroup,
}: Props) => {
  const isEnable = (item_id: string, accountGroup: Account_Group) => {
    return Boolean(accountGroup[item_id as keyof typeof accountGroup]);
  };
  return (
    <Stack sx={{ border: '1px solid black', height: '100%', overflow: 'auto' }}>
      <Stack
        direction="row"
        py="7px"
        sx={{
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          pl: 3,
          borderTop: `10px solid ${palette.primary.main}`,
          borderBottom: '1px solid grey',
        }}
      >
        <Typography color="grey" sx={{ flex: 2 }}>
          画面
        </Typography>
        <Typography color="grey" sx={{ flex: 5 }}>
          操作内容
        </Typography>
        <Typography color="grey" sx={{ flex: 2 }}>
          可否
        </Typography>
      </Stack>

      <Stack>
        {selectedAccountGroup && (
          <>
            {authorityItems.map((item) => {
              // 前の権限と後の権限で変わらない時は表示しない
              if (
                previousAccountGroup &&
                isEnable(item.id, previousAccountGroup) ===
                  isEnable(item.id, selectedAccountGroup)
              ) {
                return null;
              }
              return (
                <Stack
                  key={item.id}
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    borderBottom: '1px solid grey',
                    p: 2,
                    pl: 3,
                  }}
                >
                  <Typography textAlign={'start'} sx={{ flex: 2 }}>
                    {item.screen}
                  </Typography>
                  <Typography textAlign={'start'} sx={{ flex: 5 }}>
                    {item.action}
                  </Typography>
                  <Stack direction="row" alignItems="center" sx={{ flex: 2 }}>
                    {previousAccountGroup ? (
                      <Typography
                        sx={{
                          color: isEnable(item.id, previousAccountGroup)
                            ? 'red'
                            : palette.text.primary,
                        }}
                        textAlign="start"
                      >
                        {isEnable(item.id, previousAccountGroup)
                          ? '可'
                          : '不可'}{' '}
                        →{' '}
                        {isEnable(item.id, selectedAccountGroup)
                          ? '可'
                          : '不可'}
                      </Typography>
                    ) : (
                      <Typography
                        sx={{
                          color: isEnable(item.id, selectedAccountGroup)
                            ? 'red'
                            : palette.text.primary,
                        }}
                      >
                        {isEnable(item.id, selectedAccountGroup)
                          ? '可'
                          : '不可'}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              );
            })}
          </>
        )}
      </Stack>
    </Stack>
  );
};
