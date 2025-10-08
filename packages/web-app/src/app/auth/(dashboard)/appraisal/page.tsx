'use client';

import React, { useState } from 'react';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { PsaTable } from '@/feature/appraisal/components/tables/PsaTable';
import { Button, Stack } from '@mui/material';
import { AppraisalSettingModal } from '@/feature/appraisal/components/modals/AppraisalSettingModal';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';

const PSAPage: React.FC = () => {
  const router = useRouter();

  const navigateToRegister = () => {
    router.push(PATH.APPRAISAL.register());
  };

  // モーダル関係のロジック
  const [isModalOpen, setModalOpen] = useState(false);

  // モーダルを開く/閉じるハンドラ
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <ContainerLayout
      title="鑑定リスト"
      actions={
        <>
          <Button
            variant="text"
            onClick={() => handleOpenModal()}
            sx={{ width: '100px' }}
          >
            鑑定結果設定
          </Button>
          <PrimaryButton sx={{ width: '120px' }} onClick={navigateToRegister}>
            新規鑑定
          </PrimaryButton>
        </>
      }
    >
      <Stack sx={{ height: '100%' }}>
        <PsaTable />
      </Stack>
      <AppraisalSettingModal open={isModalOpen} onClose={handleCloseModal} />
    </ContainerLayout>
  );
};

export default PSAPage;
