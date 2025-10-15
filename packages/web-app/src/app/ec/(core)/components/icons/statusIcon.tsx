import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

interface Props {
  current: number;
  total: number;
}

export const StatusIcon: React.FC<Props> = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={100}
        size={40}
        thickness={4.5}
        sx={{
          color: '#C0C0C0',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <CircularProgress
        variant="determinate"
        value={progress}
        size={40}
        thickness={4.8}
        sx={{
          color: '#D32F2F',
          position: 'absolute',
          left: 0,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              color: '#D32F2F',
              fontWeight: 'bold',
            }}
            variant="body2"
          >
            {current}
          </Typography>
          <Typography
            sx={{
              color: '#505050',
            }}
            variant="caption"
          >
            /{total}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
