'use client';

import { Box, Paper, Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

type CenteredCardProps = {
  title: string;
  titleColor?: string;
  titleVariant?: TypographyProps['variant'];
  children?: ReactNode;
};

export function CenteredCard({
  title,
  titleColor = 'text.primary',
  titleVariant = 'h5',
  children,
}: CenteredCardProps) {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'grey.100',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          minWidth: 400,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography
          variant={titleVariant}
          gutterBottom
          sx={{ color: titleColor, fontWeight: 'bold', mb: 3 }}
        >
          {title}
        </Typography>
        {children}
      </Paper>
    </Box>
  );
}
