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

export const ConditionFilter = ({
  setProductSearchState,
  category,
  formControlSx,
}: Props) => {
  const [selectValue, setSelectValue] = useState<string>('all');
  const handleStateChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectValue(value);
    
    setProductSearchState((prev) => ({
      ...prev,
      conditionOptionDisplayName: value === 'all' ? undefined : value,
      resetPage: true,
    }));
  };

  return (
    <FormControl size="small" sx={{ minWidth: 100, ...formControlSx }}>
      <InputLabel sx={{ color: 'black' }} shrink>
        状態
      </InputLabel>
      <Select
        value={selectValue}
        onChange={handleStateChange}
        label="状態"
      >
        <MenuItem value="all">すべて</MenuItem>
        {[
          ...new Set(
            category?.itemCategories?.flatMap(
              (item) =>
                item.condition_options?.map(
                  (condition) => condition.display_name,
                ) ?? [],
            ) ?? [],
          ),
        ].map((displayName) => (
          <MenuItem key={displayName} value={displayName}>
            {displayName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};