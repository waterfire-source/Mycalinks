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

interface Props {
  setProductSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
  formControlSx?: SxProps<Theme>;
}

export const ConsignmentProductFilter = ({
  setProductSearchState,
  formControlSx,
}: Props) => {
  const [selectValue, setSelectValue] = useState<string>('all');

  const handleChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setSelectValue(value);

    // 委託商品フィルタリング状態を更新
    setProductSearchState((prevState) => ({
      ...prevState,
      isConsignmentProduct: 
        value === 'consignment' ? true : 
        value === 'non-consignment' ? false : 
        undefined,
      resetPage: true, // ページをリセット
    }));
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        minWidth: 100,
        backgroundColor: 'common.white',
        '& .MuiInputLabel-root': {
          color: 'text.primary',
        },
        ...formControlSx,
      }}
    >
      <InputLabel sx={{ color: 'black' }} shrink>
        委託商品
      </InputLabel>
      <Select
        value={selectValue}
        onChange={handleChange}
        label="委託商品"
      >
        <MenuItem value="all">すべて</MenuItem>
        <MenuItem value="consignment">委託商品のみ</MenuItem>
        <MenuItem value="non-consignment">委託商品以外</MenuItem>
      </Select>
    </FormControl>
  );
};