'use client';

import { Stack, Skeleton } from '@mui/material';
import { OpenModalButton } from '@/feature/settings/account/components/Modal/OpenModalButton';
import { ModalType } from '@/feature/settings/account/components/Modal/Modal';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useAccountGroup } from '@/feature/account/hooks/useAccountGroup';
import { useEffect, useCallback, useState } from 'react';
import { useAccounts } from '@/feature/account/hooks/useAccounts';
import { AccountList } from '@/feature/settings/account/components/AccountList';

export default function AccountPage() {
  const { accounts, fetchAccounts, loading: accountLoading } = useAccounts();
  const [canRefetch, setCanRefetch] = useState(false);

  const {
    accountGroups,
    fetchAccountGroups,
    loading: accountGroupsLoading,
  } = useAccountGroup();
  // 従業員番号が無い特殊アカウント(初期セットアップに時に自動で生成されるマスターアカウントは編集不可のため表示しない)
  const filteredAccounts = accounts?.filter((account) => account.code !== null);

  const fetchData = useCallback(async () => {
    await fetchAccounts();
    await fetchAccountGroups();
  }, [fetchAccounts, fetchAccountGroups]);
  useEffect(() => {
    fetchData();
  }, [fetchData, canRefetch]);

  const loadings = accountLoading || accountGroupsLoading;

  return (
    <ContainerLayout
      title="従業員アカウント"
      helpArchivesNumber={905}
      actions={
        <OpenModalButton
          modalType={ModalType.Create}
          account={undefined}
          accountGroups={accountGroups}
          fetchData={fetchData}
          setCanRefetch={setCanRefetch}
        />
      }
    >
      <Stack direction="column" sx={{ height: '100%' }}>
        {loadings ? (
          <Stack
            height="100%"
            justifyContent="center"
            alignItems="center"
            width="100%"
          >
            <Skeleton
              variant="rounded"
              sx={{ width: '100%', height: '100%' }}
            />
          </Stack>
        ) : (
          <AccountList
            accounts={filteredAccounts}
            accountGroups={accountGroups}
            fetchData={fetchData}
            setCanRefetch={setCanRefetch}
          />
        )}
      </Stack>
    </ContainerLayout>
  );
}
