import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { SxProps, Theme } from '@mui/material';

interface Props extends ButtonProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  loading?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
}

// 赤背景 文字白ボタン
const PrimaryButton: React.FC<Props> = ({
  children,
  sx,
  loading = false,
  variant = 'contained',
  ...props
}) => (
  <Button
    variant={variant}
    sx={{
      ...(variant === 'contained' && {
        backgroundColor: 'primary.main',
        color: 'text.secondary',
        '&:disabled': {
          backgroundColor: 'grey.500',
          color: 'text.secondary',
        },
      }),
      fontSize: '16px', // デフォルトのフォントサイズ
      '@media (max-width:1400px)': {
        fontSize: '12px', // 1400px以下でフォントサイズを12pxに
      },
      ...sx,
    }}
    {...props}
    disabled={loading || props.disabled}
  >
    {loading ? <CircularProgress size={24} /> : children}
  </Button>
);

export default PrimaryButton;
