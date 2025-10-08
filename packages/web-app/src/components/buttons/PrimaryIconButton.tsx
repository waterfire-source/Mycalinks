import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { SxProps, Theme } from '@mui/material';

interface Props extends ButtonProps {
  sx?: SxProps<Theme>;
  loading?: boolean;
  icon: React.ReactNode; // アイコンは必須
  iconSize?: number;
}

// アイコンのみのボタン
const PrimaryIconButton: React.FC<Props> = ({
  sx,
  loading = false,
  icon,
  iconSize = 24,
  ...props
}) => (
  <Button
    variant="contained"
    sx={{
      backgroundColor: 'primary.main',
      color: 'text.secondary',
      padding: '8px',
      minWidth: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...sx,
      '&:disabled': {
        backgroundColor: 'grey.500',
        color: 'text.secondary',
      },
    }}
    {...props}
    disabled={loading || props.disabled}
  >
    {loading ? (
      <CircularProgress size={24} />
    ) : (
      React.cloneElement(icon as React.ReactElement, {
        sx: { fontSize: `${iconSize}px` },
      })
    )}
  </Button>
);

export default PrimaryIconButton;
