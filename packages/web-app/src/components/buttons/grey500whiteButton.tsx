import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { SxProps, Theme } from '@mui/material';

interface Props extends ButtonProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  loading?: boolean;
}

//白背景灰色枠線ボタン
const Grey500whiteButton: React.FC<Props> = ({
  children,
  sx,
  loading = false,
  ...props
}) => (
  <Button
    variant="outlined"
    sx={{
      backgroundColor: 'grey.500',
      color: 'white',
      border: '1px solid',
      borderColor: 'grey.500',
      '&:hover': {
        backgroundColor: 'grey.700',
        color: 'white',
        borderColor: 'grey.200',
      },
      '&:disabled': {
        backgroundColor: 'grey.100',
        color: 'white',
        borderColor: 'grey.500',
      },
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

export default Grey500whiteButton;
