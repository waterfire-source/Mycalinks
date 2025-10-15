import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { SxProps, Theme } from '@mui/material';
import { palette } from '@/theme/palette';

interface Props extends ButtonProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  loading?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
}

// 背景なし、枠なし、文字赤ボタン
export const CancelButton: React.FC<Props> = ({
  children,
  sx,
  loading = false,
  variant = 'text',
  ...props
}) => (
  <Button
    variant={variant}
    sx={{
      color: palette.primary.main,
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
