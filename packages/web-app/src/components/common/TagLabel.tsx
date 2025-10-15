'use client';

import React from 'react';
import { Box, BoxProps, Typography, TypographyProps } from '@mui/material';

interface TagLabelProps {
  children: React.ReactNode;
  fontSize?: string;
  backgroundColor?: string;
  borderRadius?: string;
  color?: string;
  width?: string;
  height?: string;
  typographyVariant?: TypographyProps['variant'];
  sx?: BoxProps['sx'];
}

const TagLabel: React.FC<TagLabelProps> = ({
  children,
  fontSize = '0.875rem',
  backgroundColor = 'primary.main',
  borderRadius = '8px',
  color = 'white',
  width = '100px',
  height = '40px',
  typographyVariant = 'body1',
  sx,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height,
        width,
        margin: 'auto',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          backgroundColor,
          color,
          borderRadius,
          fontSize,
          fontWeight: 'bold',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          p: 1,
        }}
      >
        <Typography variant={typographyVariant}>{children}</Typography>
      </Box>
    </Box>
  );
};

export default TagLabel;
