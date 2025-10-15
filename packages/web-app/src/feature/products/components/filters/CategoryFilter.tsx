import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  SxProps,
  Theme,
} from '@mui/material';
import { useState } from 'react';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { CategoryAPIRes } from '@/api/frontend/category/api';

interface Props {
  setProductSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
  category?: CategoryAPIRes['getCategoryAll'];
  formControlSx?: SxProps<Theme>;
}

export const CategoryFilter = ({
  setProductSearchState,
  category,
  formControlSx,
}: Props) => {
  const [selectValue, setSelectValue] = useState<string>('all');
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectValue(value);
    
    setProductSearchState((prev) => ({
      ...prev,
      itemCategoryId: value === 'all' ? null : Number(value),
      resetPage: true,
    }));
  };

  return (
    <FormControl size="small" sx={{ minWidth: 100, ...formControlSx }}>
      <InputLabel sx={{ color: 'black' }} shrink>
        商品カテゴリ
      </InputLabel>
      <Select
        value={selectValue}
        onChange={handleCategoryChange}
        label="商品カテゴリ"
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