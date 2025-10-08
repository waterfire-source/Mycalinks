'use client';

import { Box, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

interface Props {
  title: string | string[];
  amount: number;
  unit: string;
}

export function DetailWithTooltipContent({ title, amount, unit }: Props) {
  const renderTitle = Array.isArray(title) ? (
    <Box>
      {title.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </Box>
  ) : (
    title
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 0.5,
      }}
    >
      <span>
        {amount.toLocaleString()}
        {unit}
      </span>
      <Tooltip title={renderTitle}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 15,
            height: 15,
            borderRadius: '50%',
            backgroundColor: (theme) => theme.palette.grey[400],
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          <InfoOutlined fontSize="small" />
        </Box>
      </Tooltip>
    </Box>
  );
}
