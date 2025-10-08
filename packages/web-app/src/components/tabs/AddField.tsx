import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const AddField = ({ children }: Props) => {
  return (
    <Box
      sx={{
        py: '5px',
        backgroundColor: 'common.white',
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '50px',
          display: 'flex',
          py: '6px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
