import React from 'react';
import { Tooltip, Typography, IconButton } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface TooltipWithMessageProps {
  message: string;
}

export const CaptionToolTip: React.FC<TooltipWithMessageProps> = ({
  message,
}) => {
  return (
    <Tooltip
      title={
        <Typography variant="caption" sx={{ color: 'black', p: 1 }}>
          {message}
        </Typography>
      }
      arrow
      placement="top"
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: 'white',
            color: 'black',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
            border: '1px solid #ccc',
          },
        },
        arrow: {
          sx: {
            color: 'white',
          },
        },
      }}
    >
      <IconButton sx={{ p: 0, ml: 1 }}>
        <ErrorOutlineIcon sx={{ fontSize: 16, color: 'gray' }} />
      </IconButton>
    </Tooltip>
  );
};
