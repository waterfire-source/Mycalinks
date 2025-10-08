'use client';

import React from 'react';
import { Box, SelectChangeEvent } from '@mui/material';
import CustomDialog from '@/components/dialogs/CustomDialog';
import { StyleUtil } from '@/utils/style';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { CategorySelect } from '@/feature/item/components/select/CategorySelect';
import { GenreSelect } from '@/feature/item/components/select/GenreSelect';

interface CsvDownloadModalProps {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  selectedGenreId: number | null;
  setSelectedGenreId: (genreId: number | null) => void;
  selectedCategoryId: number | null;
  setSelectedCategoryId: (categoryId: number | null) => void;
}

export const CsvDownloadModal: React.FC<CsvDownloadModalProps> = ({
  open,
  onClose,
  onDownload,
  isDownloading,
  selectedGenreId,
  selectedCategoryId,
  setSelectedGenreId,
  setSelectedCategoryId,
}) => {
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategoryId(
      event.target.value === 'all' ? null : Number(event.target.value),
    );
  };

  const handleGenreChange = (event: SelectChangeEvent<string>) => {
    setSelectedGenreId(
      event.target.value === 'all' ? null : Number(event.target.value),
    );
  };

  return (
    <CustomDialog isOpen={open} onClose={onClose} title="CSVダウンロード">
      <Box
        sx={{
          ...StyleUtil.flex.row,
          ...StyleUtil.flex.allCenter,
          gap: 2,
          m: 3,
        }}
      >
        {/* ジャンル選択 */}
        <GenreSelect
          inputLabel="ジャンル"
          selectedGenreId={selectedGenreId}
          onSelect={handleGenreChange}
          sx={{ width: '50%' }}
        />

        {/* カテゴリ選択 */}
        <CategorySelect
          inputLabel="カテゴリ"
          selectedCategoryId={selectedCategoryId}
          onSelect={handleCategoryChange}
          sx={{ width: '50%' }}
        />
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <SecondaryButton onClick={onClose}>キャンセル</SecondaryButton>
          <PrimaryButton
            onClick={onDownload}
            loading={isDownloading}
            sx={{ minWidth: 120 }}
          >
            ダウンロード
          </PrimaryButton>
        </Box>
      </Box>
    </CustomDialog>
  );
};
