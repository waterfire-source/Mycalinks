import { Box, TextField, Typography } from '@mui/material';
import * as React from 'react';

interface Props {
  selectedDatetimeGte: Date | null;
  selectedDatetimeLte: Date | null;
  onGteChange: (date: Date | null) => void;
  onLteChange: (date: Date | null) => void;
}

export const DateRangeFilter: React.FC<Props> = ({
  selectedDatetimeGte,
  selectedDatetimeLte,
  onGteChange,
  onLteChange,
}: Props) => {
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleGteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value) {
      const utc = new Date(value);
      onGteChange(new Date(value + 'T00:00:00+09:00'));
    } else {
      onGteChange(null);
    }
  };

  const handleLteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value) {
      const utc = new Date(value);
      onLteChange(new Date(value + 'T00:00:00+09:00'));
    } else {
      onLteChange(null);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        width: '40%',
      }}
    >
      <Typography
        variant="body2"
        sx={{ minWidth: 'fit-content', color: 'text.primary' }}
      >
        発生日:
      </Typography>
      <TextField
        label="開始日"
        type="date"
        value={formatDateForInput(selectedDatetimeGte)}
        onChange={handleGteChange}
        size="small"
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          backgroundColor: 'common.white',
          '& .MuiInputLabel-root': {
            color: 'text.primary',
            background: 'white',
          },
        }}
      />
      <Typography variant="body2" sx={{ color: 'text.primary' }}>
        〜
      </Typography>
      <TextField
        label="終了日"
        type="date"
        value={formatDateForInput(selectedDatetimeLte)}
        onChange={handleLteChange}
        size="small"
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          backgroundColor: 'common.white',
          '& .MuiInputLabel-root': {
            color: 'text.primary',
            background: 'white',
          },
        }}
      />
    </Box>
  );
};
