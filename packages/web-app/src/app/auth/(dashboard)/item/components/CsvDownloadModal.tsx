'use client';

import React, { useEffect } from 'react';
import { Box, Stack, SelectChangeEvent } from '@mui/material';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { StyleUtil } from '@/utils/style';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
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

  const { genre, fetchGenreList } = useGenre();
  const { category, fetchCategoryList } = useCategory();

  useEffect(() => {
    fetchGenreList();
    fetchCategoryList();
  }, []);
  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title="CSVダウンロード"
      width={400}
      dataTestId="csv-download-modal"
    >
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
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <SecondaryButton onClick={onClose} variant="outlined">
            キャンセル
          </SecondaryButton>
          <PrimaryButton
            onClick={onDownload}
            loading={isDownloading}
            sx={{ minWidth: 120 }}
          >
            ダウンロード
          </PrimaryButton>
        </Stack>
      </Box>
    </CustomModalWithHeader>
  );
};
