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

// 在庫状況
const StackStatus = {
  All: {
    label: 'すべて',
    value: 'all',
    isActive: undefined,
    stockNumberGte: undefined,
  },
  HasStockInactive: {
    label: '在庫あり',
    value: 'hasStock_inactive',
    isActive: true,
    stockNumberGte: 1,
  },
  HasStockActive: {
    label: '在庫なし(ACT)',
    value: 'hasStock_active',
    isActive: true,
    stockNumberGte: 0,
  },
  NoStock: {
    label: '在庫なし',
    value: 'noStock',
    isActive: false,
    stockNumberGte: 0,
  },
} as const;

type StackStatus = (typeof StackStatus)[keyof typeof StackStatus];

const stockStatuses = Object.values(StackStatus);
const statusMap: Record<string, StackStatus> = stockStatuses.reduce(
  (acc, s) => {
    acc[s.value] = s;
    return acc;
  },
  {} as Record<string, StackStatus>,
);

export const StockStatusFilter = ({
  setProductSearchState,
  formControlSx,
}: Props) => {
  const [selectValue, setSelectValue] = useState<string>('all');
  
  const handleStockChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectValue(value);
    
    const status = statusMap[value];
    if (!status) return;
    
    setProductSearchState((prev) => ({
      ...prev,
      isActive: status.isActive,
      stockNumberGte: status.stockNumberGte,
      resetPage: true,
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
        在庫状況
      </InputLabel>
      <Select
        value={selectValue}
        onChange={handleStockChange}
        label="在庫状況"
      >
        {stockStatuses.map((s) => (
          <MenuItem key={s.value} value={s.value}>
            {s.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};