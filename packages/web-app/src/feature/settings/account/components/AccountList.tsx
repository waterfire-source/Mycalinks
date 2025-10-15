// Start of Selection
import { Checkbox, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import {
  AccountModal,
  ModalType,
} from '@/feature/settings/account/components/Modal/Modal';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ExportAccountCodeButton } from '@/feature/settings/account/components/ExportAccountCode/Button';
import { palette } from '@/theme/palette';
import { AccountType } from '@/feature/account/hooks/useAccounts';
import { AccountGroupType } from '@/feature/account/hooks/useAccountGroup';

interface Props {
  accounts: AccountType[] | undefined;
  accountGroups: AccountGroupType[];
  fetchData: () => Promise<void>;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AccountList = ({
  accounts,
  accountGroups,
  fetchData,
  setCanRefetch,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<
    AccountType | undefined
  >(undefined);
  const [selectedAccounts, setSelectedAccounts] = useState<AccountType[]>([]);

  const handleOpenEditModal = (id: number) => {
    setIsOpen(true);
    const account = accounts?.find((element) => element.id === id);
    if (account) {
      setSelectedAccount(account);
    }
  };

  const handleCloseEditModal = () => {
    setIsOpen(false);
    setSelectedAccount(undefined);
  };

  // 複数選択可能
  const handleClick = (id: number) => {
    if (!accounts) return;
    const account = accounts.find((element) => element.id === id);
    // Only proceed if account is found
    if (account) {
      // Check if the account is already selected
      const isSelected = selectedAccounts.some((item) => item.id === id);

      if (isSelected) {
        // If selected, remove it from the array
        setSelectedAccounts((prev) => prev.filter((item) => item.id !== id));
      } else {
        // If not selected, add it to the array
        setSelectedAccounts((prev) => [...prev, account]);
      }
    }
  };

  const columns: ColumnDef<AccountType>[] = [
    {
      key: 'checkbox',
      header: '',
      render: (params) => <Checkbox onChange={() => handleClick(params.id)} />,
    },
    {
      key: 'display_name',
      header: '名前',
      render: (params) => <Typography>{params.display_name}</Typography>,
    },
    {
      key: 'nick_name',
      header: '表示名',
      render: (params) => <Typography>{params.nick_name}</Typography>,
    },
    {
      key: 'code',
      header: '従業員番号',
      render: (params) => <Typography>{params.code}</Typography>,
    },
    {
      key: 'email',
      header: 'メールアドレス',
      render: (params) => <Typography>{params.email}</Typography>,
    },
    {
      key: 'authority',
      header: '権限',
      render: (params) => (
        <Typography>
          {
            accountGroups.find((element) => element.id === params.group_id)
              ?.display_name
          }
        </Typography>
      ),
    },
    {
      key: 'stores',
      header: '所属店舗',
      render: (params) => (
        <>
          {params.stores.map((store) => (
            <Typography key={store.store.id}>
              {store.store.display_name}
            </Typography>
          ))}
        </>
      ),
    },
    {
      key: 'edit',
      header: '',
      render: (params) => (
        <PrimaryButton onClick={() => handleOpenEditModal(params.id)}>
          編集
        </PrimaryButton>
      ),
    },
  ];

  return (
    <Stack direction="column" sx={{ height: '100%' }}>
      <CustomTable<AccountType>
        rows={accounts ?? []}
        columns={columns}
        rowKey={(account) => account.id}
        sx={{
          borderTop: `10px solid ${palette.primary.main}`,
        }}
      />
      <Stack
        sx={{
          backgroundColor: palette.common.white,
          p: 2,
          alignItems: 'end',
        }}
      >
        <ExportAccountCodeButton selectedAccounts={selectedAccounts ?? []} />
      </Stack>
      {selectedAccount && (
        <AccountModal
          isOpen={isOpen}
          modalType={ModalType.Edit}
          onClose={handleCloseEditModal}
          account={selectedAccount}
          accountGroups={accountGroups}
          fetchData={fetchData}
          setCanRefetch={setCanRefetch}
        />
      )}
    </Stack>
  );
};
