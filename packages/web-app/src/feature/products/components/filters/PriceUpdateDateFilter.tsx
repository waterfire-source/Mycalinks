import {
  TextField,
  Typography,
  Box,
  SxProps,
  Theme,
} from '@mui/material';
import { useState } from 'react';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';

interface Props {
  setProductSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
  formControlSx?: SxProps<Theme>;
}

export const PriceUpdateDateFilter = ({
  setProductSearchState,
  formControlSx,
}: Props) => {
  const [dateValue, setDateValue] = useState<string>('');
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...formControlSx }}>
      <TextField
        size="small"
        type="date"
        label="最終価格更新日"
        InputLabelProps={{
          shrink: true,
        }}
        value={dateValue}
        onChange={(e) => {
          const value = e.target.value;
          setDateValue(value);
          setProductSearchState((prev) => ({
            ...prev,
            priceChangeDateGte: value,
            resetPage: true,
          }));
        }}
        sx={{
          '& .MuiInputLabel-root': {
            color: 'black',
          },
          '& .MuiInputBase-input': {
            color: 'black',
          },
        }}
      />
      <Typography
        sx={{
          whiteSpace: 'nowrap',
        }}
      >
        以降
      </Typography>
    </Box>
  );
};