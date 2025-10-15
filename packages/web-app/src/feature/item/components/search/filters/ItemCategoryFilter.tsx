import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  SxProps,
  Theme,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { useCategory } from '@/feature/category/hooks/useCategory';

interface Props {
  setItemSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  formControlSx?: SxProps<Theme>;
}

export const ItemCategoryFilter = ({
  setItemSearchState,
  formControlSx,
}: Props) => {
  const [selectValue, setSelectValue] = useState<string>('all');
  const { category, fetchCategoryList } = useCategory();

  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectValue(value);
    
    setItemSearchState((prev) => ({
      ...prev,
      selectedCategoryId: value === 'all' ? null : Number(value),
    }));
  };

  return (
    <FormControl size="small" sx={{ minWidth: 100, ...formControlSx }}>
      <InputLabel sx={{ color: 'black' }} shrink>
        カテゴリ
      </InputLabel>
      <Select
        value={selectValue}
        onChange={handleCategoryChange}
        label="カテゴリ"
      >
        <MenuItem value="all">すべて</MenuItem>
        {category?.itemCategories?.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            {item.display_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};