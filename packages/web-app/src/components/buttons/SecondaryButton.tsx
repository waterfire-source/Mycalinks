import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { SxProps, Theme } from '@mui/material';
import { palette } from '@/theme/palette';

interface Props extends ButtonProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  loading?: boolean;
  selected?: boolean;
}
// 濃いグレー 薄いグレー文字ボタン
const SecondaryButton: React.FC<Props> = ({
  children,
  sx,
  loading = false,
  selected = false, // selectedのデフォルトはfalse
  ...props
}) => (
  <Button
    variant="contained"
    sx={{
      backgroundColor: selected ? 'grey.700' : 'grey.300',
      color: selected ? 'text.secondary' : 'grey.700',
      '&:hover': {
        backgroundColor: 'grey.500',
        color: 'grey.800',
      },
      '@media (max-width:1400px)': {
        fontSize: '12px', // 1400px以下でフォントサイズを12pxに
      },
      '&:disabled': {
        backgroundColor: 'grey.500',
        color: palette.common.white,
        opacity: 0.5,
      },

      ...sx,
    }}
    {...props}
    disabled={loading || props.disabled}
  >
    {loading ? <CircularProgress size={24} /> : children}
  </Button>
);

export default SecondaryButton;
