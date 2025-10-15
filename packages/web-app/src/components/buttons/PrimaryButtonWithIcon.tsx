import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { SxProps, Theme } from '@mui/material';
import Typography from '@mui/material/Typography';

interface Props extends ButtonProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  loading?: boolean;
  icon?: React.ReactNode;
  iconSize?: number;
}

// 赤背景 文字白ボタン
const PrimaryButtonWithIcon: React.FC<Props> = ({
  children,
  sx,
  loading = false,
  icon,
  iconSize = 12,
  ...props
}) => (
  <Button
    variant="contained"
    sx={{
      backgroundColor: 'primary.main',
      color: 'text.secondary',
      paddingX: '12px',
      paddingY: '4px',
      height: 'auto',
      gap: '8px',
      minWidth: '100px',
      display: 'flex',
      alignItems: 'center',
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
      <>
        {icon && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {React.cloneElement(icon as React.ReactElement, {
              sx: { fontSize: `${iconSize}px` },
            })}
          </span>
        )}
        <Typography variant="body2">{children}</Typography>
      </>
    )}
  </Button>
);

export default PrimaryButtonWithIcon;
