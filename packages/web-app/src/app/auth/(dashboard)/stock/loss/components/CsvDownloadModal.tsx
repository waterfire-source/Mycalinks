'use client';

import React, { useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import CustomDialog from '@/components/dialogs/CustomDialog';
import { StyleUtil } from '@/utils/style';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';

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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>ジャンル</InputLabel>
          <Select
            value={selectedGenreId !== null ? String(selectedGenreId) : 'all'}
            onChange={handleGenreChange}
          >
            <MenuItem value="all">すべて</MenuItem>
            {genre?.itemGenres.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.display_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* カテゴリ選択 */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>カテゴリ</InputLabel>
          <Select
            value={
              selectedCategoryId !== null ? String(selectedCategoryId) : 'all'
            }
            onChange={handleCategoryChange}
          >
            <MenuItem value="all">すべて</MenuItem>
            {category?.itemCategories.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.display_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
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
      </Box>
    </CustomDialog>
  );
};
