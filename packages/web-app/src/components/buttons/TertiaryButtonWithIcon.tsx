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
}

// 無色無色背景、赤文字
const TertiaryButtonWithIcon: React.FC<Props> = ({
  children,
  sx,
  loading = false,
  icon,
  ...props
}) => (
  <Button
    variant="contained"
    sx={{
      backgroundColor: 'transparent', // 背景色を透明に設定
      color: 'primary.main', // テキストカラーを指定
      border: 'none',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: 'transparent', // ホバー時も背景を透明に設定
        color: 'primary.dark', // ホバー時のテキストカラー
      },
      '&:disabled': {
        backgroundColor: 'transparent', // 無効状態でも背景を透明に設定
        color: 'grey.500', // 無効状態のテキストカラー
      },
      fontSize: '16px',
      '@media (max-width:1400px)': {
        fontSize: '12px',
      },
      ...sx,
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
              sx: { fontSize: '12px' },
            })}
          </span>
        )}
        <Typography variant="body2">{children}</Typography>
      </>
    )}
  </Button>
);

export default TertiaryButtonWithIcon;
