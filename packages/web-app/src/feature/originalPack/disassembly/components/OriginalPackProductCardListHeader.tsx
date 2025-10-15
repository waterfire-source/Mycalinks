import { useEffect, useState } from 'react';
import {
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';

interface OriginalPackProductCardListHeaderProps {
  storeId: number;
  selectedCategoryId?: number;
  setSelectedCategoryId: (value: number | undefined) => void;
  selectedConditionOptionId?: number;
  setSelectedConditionOptionId: (value: number | undefined) => void;
  rarityInput?: string;
  setRarityInput: (value: string) => void;
}

export const OriginalPackProductCardListHeader: React.FC<
  OriginalPackProductCardListHeaderProps
> = ({
  storeId,
  selectedCategoryId,
  setSelectedCategoryId,
  selectedConditionOptionId,
  setSelectedConditionOptionId,
  rarityInput,
  setRarityInput,
}: OriginalPackProductCardListHeaderProps) => {
  // カテゴリ, 状態絞り込み条件
  const { category, conditionOptionsWithCategory, fetchCategoryList } =
    useCategory();

  // さらに絞り込みのモーダルの開閉
  const [isOpenDetailNarrowDown, setIsOpenDetailNarrowDown] =
    useState<boolean>(false);

  // 絞り込みハンドラ
  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    const strValue = e.target.value;
    const newValue = strValue === '' ? undefined : parseInt(strValue, 10);
    setSelectedCategoryId(newValue);
  };
  const handleConditionChange = (e: SelectChangeEvent<string>) => {
    const strValue = e.target.value;
    const newValue = strValue === '' ? undefined : parseInt(strValue, 10);
    setSelectedConditionOptionId(newValue);
  };
  const handleRarityInputChange = (e: React.ChangeEvent<{ value: string }>) => {
    setRarityInput(toHalfWidthOnly(e.target.value));
  };

  // カテゴリ,状態リストの取得
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList, storeId]);

  return (
    // フィルタリング用のドロップダウン
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* カテゴリでの絞り込み */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id={'category-filter-label'} sx={{ color: 'text.primary' }}>
          カテゴリ
        </InputLabel>
        <Select
          labelId={'category-filter-label'}
          label={'カテゴリ'}
          value={selectedCategoryId?.toString() ?? ''}
          onChange={handleCategoryChange}
        >
          <MenuItem value="">すべて</MenuItem>
          {category?.itemCategories?.map((category) => (
            <MenuItem key={category.id} value={category.id.toString()}>
              {category.display_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* レアリティでの絞り込み */}
      <TextField
        label="レアリティ"
        variant="outlined"
        value={rarityInput ?? ''}
        onChange={handleRarityInputChange}
        size="small"
        placeholder="レアリティ"
        sx={{
          width: 130,
        }}
        InputLabelProps={{
          shrink: true,
          sx: { color: 'text.primary' },
        }}
      />
      {/* 状態での絞り込み */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel
          id={'condition-filter-label'}
          sx={{ color: 'text.primary' }}
        >
          状態
        </InputLabel>
        <Select
          labelId={'condition-filter-label'}
          label={'状態'}
          value={selectedConditionOptionId?.toString() ?? ''}
          onChange={handleConditionChange}
        >
          <MenuItem value="">すべて</MenuItem>
          {conditionOptionsWithCategory?.map((displayName) => (
            <MenuItem key={displayName} value={displayName}>
              {displayName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
