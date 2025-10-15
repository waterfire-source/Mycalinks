import React, { ReactElement } from 'react';
import { Tooltip, Box, Typography, IconButton } from '@mui/material';
import { FaTimes } from 'react-icons/fa';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  content: React.ReactNode;
  width?: number | string;
  height?: number | string;
  showCloseButton?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right'; // ✅ 矢印の向きを指定
  children: ReactElement; // ✅ `Tooltip` のトリガー要素を単一要素に制限
}
//未完成
export const TooltipModal = ({
  open,
  onClose,
  title,
  content,
  width = 250,
  height = 'auto',
  showCloseButton = false,
  placement = 'bottom', // ✅ ボタンの下に表示
  children,
}: Props) => {
  return (
    <Tooltip
      open={open}
      onClose={onClose}
      title={
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            padding: 2,
            boxShadow: '0px 2px 8px rgba(128, 128, 128, 0.5)', // ✅ 影を gray.500 に変更
            borderRadius: '8px', // ✅ 角丸を統一
            minWidth: width,
            minHeight: height,
            border: '1px solid rgba(0, 0, 0, 0.15)', // ✅ うっすらと枠線をつける
          }}
        >
          {/* タイトルがある場合のみ表示 */}
          {title && <Typography variant="body2">{title}</Typography>}

          {/* コンテンツ */}
          <Box>{content}</Box>

          {/* ✅ `showCloseButton` が `true` のときのみ閉じるボタンを表示 */}
          {showCloseButton && (
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                color: 'black',
                fontSize: 12, // ✅ 小さくする
                padding: 0.5, // ✅ 余白を小さく
              }}
            >
              <FaTimes />
            </IconButton>
          )}
        </Box>
      }
      arrow
      placement={placement} // ✅ `props` で矢印の向きを指定
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: 'white', // ✅ 背景を白にする
          },
        },
        arrow: {
          sx: {
            color: 'white', // ✅ 矢印を白にする
            boxShadow: '0px 2px 6px rgba(128, 128, 128, 0.5)', // ✅ gray.500 の影
            '&::before': {
              content: '""',
              display: 'block',
              width: 8,
              height: 8,
              border: '1px solid rgba(0, 0, 0, 0.15)', // ✅ 矢印に枠線を適用
              backgroundColor: 'white',
            },
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
};
