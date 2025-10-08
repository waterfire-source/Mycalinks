import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import * as React from 'react';

interface Props {
  selectedSortOption: string | null;
  onChange: (sortOption: string | null) => void;
}

export const SortFilter: React.FC<Props> = ({
  selectedSortOption,
  onChange,
}: Props) => {
  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    onChange(value === '' ? null : value);
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        backgroundColor: 'common.white',
        '& .MuiInputLabel-root': {
          color: 'text.primary',
          background: 'white',
        },
      }}
    >
      <InputLabel sx={{ color: 'text.primary' }}>並びかえ</InputLabel>
      <Select value={selectedSortOption ?? ''} onChange={handleChange}>
        <MenuItem value="">
          <Typography>指定なし</Typography>
        </MenuItem>
        <MenuItem value="datetime">発生日時 昇順</MenuItem>
        <MenuItem value="-datetime">発生日時 降順</MenuItem>
        <MenuItem value="productDisplayName">商品名 昇順</MenuItem>
        <MenuItem value="-productDisplayName">商品名 降順</MenuItem>
        <MenuItem value="lossGenreDisplayName">ロス区分 昇順</MenuItem>
        <MenuItem value="-lossGenreDisplayName">ロス区分 降順</MenuItem>
      </Select>
    </FormControl>
  );
};
