import { CircularProgress, Box } from '@mui/material';
import type { SxProps } from '@mui/system';

const Loader = ({ sx }: { sx?: SxProps }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        // bgcolor: 'transparent', // 背景色を透明に変更
        ...(sx || {}),
      }}
    >
      <CircularProgress sx={{ color: 'rgba(184, 42, 42, 1)' }} />
    </Box>
  );
};

export default Loader;
