// Start of Selection
import TertiaryButton from '@/components/buttons/TertiaryButton';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';
import { AccountGroupDetail } from '@/feature/settings/authority/components/AccountGroup/Detail';
import { DetailCard } from '@/components/cards/DetailCard';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { OpenModalButton } from '@/feature/settings/authority/components/OpenModalButton';
import { ModalType } from '@/feature/settings/authority/components/Modal';
import { AccountGroupType } from '@/feature/account/hooks/useAccountGroup';

interface Props {
  accountGroups: AccountGroupType[];
  setCanRefetch: Dispatch<SetStateAction<boolean>>;
}

export const AccountGroupList = ({ accountGroups, setCanRefetch }: Props) => {
  const [selectedAccountGroup, setSelectedAccountGroup] = useState<
    AccountGroupType | undefined
  >(accountGroups[0] ?? undefined);

  const [accountsCount, setAccountsCount] = useState<number>(0);

  const handleClick = (id: number, accountsCount: number) => {
    const accountGroup = accountGroups.find((element) => element.id === id);
    setSelectedAccountGroup(accountGroup);
    setAccountsCount(accountsCount);
  };

  const columns: ColumnDef<AccountGroupType>[] = [
    {
      key: 'name',
      header: '権限名',
      render: (params) => <Typography>{params.display_name}</Typography>,
    },
    {
      key: 'number',
      header: '割当人数',
      render: (params) => <Typography>{params.accountsCount}</Typography>,
    },
    {
      key: 'detail',
      header: '',
      render: (params) => (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ height: '100%' }}
        >
          <TertiaryButton
            onClick={() => handleClick(params.id, params.accountsCount)}
            sx={{ border: 'none' }}
          >
            ＞
          </TertiaryButton>
        </Stack>
      ),
    },
  ];

  return (
    <Grid container spacing={1} sx={{ height: '100%', overflowY: 'scroll' }}>
      <Grid item xs={7} sx={{ height: '100%' }}>
        <Box sx={{ height: '100%' }}>
          <CustomTable<AccountGroupType>
            rows={accountGroups}
            columns={columns}
            rowKey={(accountGroup) => accountGroup.id}
            hasRedLine={true}
            selectedRow={selectedAccountGroup}
            onRowClick={(accountGroup) =>
              handleClick(accountGroup.id, accountGroup.accountsCount)
            }
          />
        </Box>
      </Grid>
      <Grid
        item
        xs={5}
        sx={{
          flexGrow: 1,
          width: '50%',
          height: '100%',
          overflowY: 'scroll',
        }}
      >
        <DetailCard
          title={
            selectedAccountGroup?.display_name
              ? `権限詳細 :  ${selectedAccountGroup?.display_name}`
              : '権限詳細'
          }
          content={<AccountGroupDetail accountGroup={selectedAccountGroup} />}
          bottomContent={
            selectedAccountGroup && (
              <OpenModalButton
                modalType={ModalType.Edit}
                existingAccountGroups={accountGroups}
                accountGroup={selectedAccountGroup}
                setCanRefetch={setCanRefetch}
                accountsCount={accountsCount}
              />
            )
          }
          bottomContentSx={{
            justifyContent: 'flex-end',
            width: '100%',
          }}
        />
      </Grid>
    </Grid>
  );
};
