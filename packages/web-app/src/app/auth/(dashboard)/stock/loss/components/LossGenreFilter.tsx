import { BackendLossAPI } from '@/app/api/store/[store_id]/loss/api';
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
  selectedLossGenre: number | null;
  lossGenres: BackendLossAPI[3]['response']['200'] | undefined;
  onChange: (lossGenreId: number | null) => void;
}

export const LossGenreFilter: React.FC<Props> = ({
  selectedLossGenre,
  lossGenres,
  onChange,
}: Props) => {
  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    const parsedValue = value !== '' ? Number(value) : null;
    onChange(parsedValue);
  };
  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        minWidth: '110px',
        backgroundColor: 'common.white',
        '& .MuiInputLabel-root': {
          color: 'text.primary',
          background: 'white',
        },
      }}
    >
      <InputLabel sx={{ color: 'text.primary' }}>ロス区分</InputLabel>
      <Select
        value={selectedLossGenre?.toString() || ''}
        onChange={handleChange}
      >
        <MenuItem value="">
          <Typography>指定なし</Typography>
        </MenuItem>
        {lossGenres?.map((genre) => (
          <MenuItem key={genre.id} value={genre.id.toString()}>
            {genre.display_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
