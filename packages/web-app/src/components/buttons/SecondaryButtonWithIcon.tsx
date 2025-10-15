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
  selected?: boolean;
  iconPosition?: 'left' | 'right';
}

// 濃いグレー 薄いグレー文字ボタン
const SecondaryButtonWithIcon: React.FC<Props> = ({
  children,
  sx,
  loading = false,
  icon,
  selected = false,
  iconPosition = 'left',
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
      '&:disabled': {
        backgroundColor: 'grey.500',
        color: 'grey.800',
      },
      paddingX: '12px',
      paddingY: '4px',
      height: 'auto',
      gap: '8px',
      minWidth: '100px',
      display: 'flex',
      alignItems: 'center',
      ...sx,
    }}
    {...props}
    disabled={loading || props.disabled}
  >
    {loading ? (
      <CircularProgress size={24} />
    ) : iconPosition === 'left' ? (
      <>
        {icon && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {React.cloneElement(icon as React.ReactElement, {
              sx: { fontSize: '12px' },
            })}
          </span>
        )}
        <Typography variant="body2">{children}</Typography>
      </>
    ) : (
      <>
        <Typography variant="body2">{children}</Typography>
        {icon && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {React.cloneElement(icon as React.ReactElement, {
              sx: { fontSize: '12px' },
            })}
          </span>
        )}
      </>
    )}
  </Button>
);
export default SecondaryButtonWithIcon;
