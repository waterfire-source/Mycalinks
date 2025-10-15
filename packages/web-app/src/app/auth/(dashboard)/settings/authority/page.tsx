'use client';
import { AccountGroupList } from '@/feature/settings/authority/components/AccountGroup/List';
import { ModalType } from '@/feature/settings/authority/components/Modal';
import { OpenModalButton } from '@/feature/settings/authority/components/OpenModalButton';
import { useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useAccountGroup } from '@/feature/account/hooks/useAccountGroup';

export default function AuthorityPage() {
  const [canRefetch, setCanRefetch] = useState(false);

  const { accountGroups, fetchAccountGroups, loading } = useAccountGroup();

  const fetchData = async () => {
    await fetchAccountGroups();
  };

  useEffect(() => {
    fetchData();
    setCanRefetch(false);
  }, [canRefetch]);

  return (
    <ContainerLayout
      title="権限設定"
      helpArchivesNumber={936}
      actions={
        <OpenModalButton
          modalType={ModalType.Create}
          accountGroup={null}
          existingAccountGroups={accountGroups}
          accountsCount={0}
          setCanRefetch={setCanRefetch}
        />
      }
    >
      <Stack direction="column" sx={{ height: '100%', overflowY: 'scroll' }}>
        {!loading && (
          <AccountGroupList
            accountGroups={accountGroups}
            setCanRefetch={setCanRefetch}
          />
        )}
      </Stack>
    </ContainerLayout>
  );
}
