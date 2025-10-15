import { palette } from '@/theme/palette';
import { Typography } from '@mui/material';

export const RequiredChip = () => {
  return (
    <Typography
      sx={{
        backgroundColor: palette.grey[200],
        borderRadius: 1,
        px: '8px',
        py: '4px',
      }}
      variant="caption"
    >
      必須
    </Typography>
  );
};
