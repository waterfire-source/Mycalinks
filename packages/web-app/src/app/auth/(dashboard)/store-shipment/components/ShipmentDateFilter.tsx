'use client';
import { useParamsAsState } from '@/hooks/useParamsAsState';
import { Box, TextField, Typography } from '@mui/material';

export const ShipmentDateFilter = () => {
  const [startDate, setStartDate] = useParamsAsState('shipment_date_gte');
  const [endDate, setEndDate] = useParamsAsState('shipment_date_lt');

  return (
    <Box display="flex" sx={{ mb: 1, mt: 1 }} gap={2} alignItems="center">
      {/* 開始日 */}
      <TextField
        size="small"
        type="date"
        label="出荷日"
        InputLabelProps={{
          shrink: true,
        }}
        value={startDate ?? ''}
        onChange={(e) => setStartDate(e.target.value || '')}
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
        ~
      </Typography>
      {/* 終了日 */}
      <TextField
        size="small"
        type="date"
        InputLabelProps={{
          shrink: true,
        }}
        value={endDate ?? ''}
        onChange={(e) => setEndDate(e.target.value || '')}
        sx={{
          '& .MuiInputLabel-root': {
            color: 'black',
          },
          '& .MuiInputBase-input': {
            color: 'black',
          },
        }}
      />
    </Box>
  );
};