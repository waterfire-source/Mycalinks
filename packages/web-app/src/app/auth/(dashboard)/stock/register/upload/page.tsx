'use client';

import { Typography, Box, Stack } from '@mui/material';
import FileUploadCard from '@/components/cards/FileUploadCard';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { posCommonConstants } from 'common';
import { useState } from 'react';
import { CsvUploadHistoryModal } from '@/app/auth/(dashboard)/stock/components/CsvUploadHistoryModal';
import SecondaryButton from '@/components/buttons/SecondaryButton';
const { csvTemplateKinds } = posCommonConstants;

export default function StockUploadPage() {
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState<boolean>(false);
  const handleOpenModal = () => setIsOpenHistoryModal(true);
  const handleCloseModal = () => setIsOpenHistoryModal(false);

  return (
    <ContainerLayout
      title="CSVファイル アップロード"
      actions={
        <Stack direction="row" gap={2}>
          <SecondaryButton onClick={handleOpenModal}>進捗確認</SecondaryButton>
        </Stack>
      }
    >
      <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
        {Object.entries(csvTemplateKinds).map(([kind, value]) => (
          <>
            <Typography variant="h4">{value.label}関連</Typography>
            <FileUploadCard
              key={kind}
              kind={kind as keyof typeof csvTemplateKinds}
            />
          </>
        ))}
      </Box>

      {isOpenHistoryModal && (
        <CsvUploadHistoryModal
          isOpen={isOpenHistoryModal}
          onClose={handleCloseModal}
        />
      )}
    </ContainerLayout>
  );
}
