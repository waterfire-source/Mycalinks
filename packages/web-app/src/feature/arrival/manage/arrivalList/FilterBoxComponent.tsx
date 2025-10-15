import { useParamsAsState } from '@/hooks/useParamsAsState';
import { Box, TextField, Typography } from '@mui/material';

export const FilterBoxComponent = () => {
  const [startDate, setStartDate] = useParamsAsState('startDate');
  const [endDate, setEndDate] = useParamsAsState('endDate');

  return (
    <Box display="flex" sx={{ mb: 1, mt: 1 }} gap={2}>
      {/* 開始日 */}
      <TextField
        size="small"
        type="date"
        label="入荷（予定）日"
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
