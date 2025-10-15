import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { SxProps, Theme } from '@mui/material';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface Props extends ButtonProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  loading?: boolean;
  icon?: React.ReactNode;
  iconSize?: number; // アイコンのサイズ
  iconColor?: string; // アイコンの色
}

// 黒文字、黒ボーダー
export const SimpleButtonWithIcon: React.FC<Props> = ({
  children,
  sx,
  loading = false,
  icon,
  iconSize = 12, // デフォルトサイズ
  iconColor = 'inherit', // デフォルト色
  ...props
}) => (
  <Button
    variant="contained"
    sx={{
      backgroundColor: 'white',
      color: 'black',
      border: '1px solid rgba(0, 0, 0, 0.23)',
      boxShadow: 'none', // 影を消す
      paddingX: '12px',
      paddingY: '4px',
      height: 'auto',
      minWidth: '100px',
      display: 'flex',
      alignItems: 'center', // 垂直方向で中央揃え
      justifyContent: 'center', // 水平方向で中央揃え
      ...sx,
      '&:disabled': {
        backgroundColor: 'grey.500',
        color: 'text.secondary',
        boxShadow: 'none', // 無効状態でも影を消す
      },
      '&:hover': {
        backgroundColor: 'grey.200',
        boxShadow: 'none', // ホバー時にも影を消す
      },
    }}
    {...props}
    disabled={loading || props.disabled}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        position: 'relative',
      }}
    >
      {/* 通常のコンテンツ - 常に表示して幅を確保 */}
      {icon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${iconSize}px`,
            height: `${iconSize}px`,
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            sx: { fontSize: `${iconSize}px`, color: iconColor },
          })}
        </Box>
      )}
      <Typography variant="body2" sx={{ opacity: loading ? 0 : 1 }}>
        {children}
      </Typography>

      {/* ローディング時のオーバーレイ */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
        >
          <CircularProgress size={16} />
        </Box>
      )}
    </Box>
  </Button>
);
