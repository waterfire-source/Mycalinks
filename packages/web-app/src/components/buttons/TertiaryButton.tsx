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
const TertiaryButton: React.FC<Props> = ({
  children,
  sx,
  loading = false,
  ...props
}) => (
  <Button
    variant="outlined"
    sx={{
      backgroundColor: 'common.white',
      color: 'grey.700',
      border: '1px solid',
      borderColor: 'grey.700',
      '&:hover': {
        backgroundColor: 'grey.200',
        color: 'grey.800',
        borderColor: 'grey.200',
      },
      '&:disabled': {
        backgroundColor: 'grey.100',
        color: 'grey.700',
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

export default TertiaryButton;
