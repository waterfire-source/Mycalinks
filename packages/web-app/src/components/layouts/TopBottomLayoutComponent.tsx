import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';

interface Props {
  title: string;
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
  hideButtons?: boolean;
  cancelButtonText?: string;
  actionButtonText?: string;
  onCancelClick?: () => void;
  onActionButtonClick?: (e?: React.FormEvent) => void;
  isAble?: boolean;
  loading?: boolean;
}

export const TopBottomLayoutComponent: React.FC<Props> = ({
  title,
  topContent,
  bottomContent,
  hideButtons = false,
  cancelButtonText = 'キャンセル',
  actionButtonText,
  onCancelClick,
  onActionButtonClick,
  isAble = true,
  loading = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      {/* ヘッダー部分 */}
      <Box sx={{ padding: 2, borderBottom: '1px solid #ddd' }}>
        <Typography variant="h1">{title}</Typography>
      </Box>

      {/* コンテンツ部分 */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          backgroundColor: 'white',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '55%',
            overflowY: 'auto',
            padding: 0,
          }}
        >
          {topContent}
        </Box>
        <Box sx={{ width: '100%', height: '45%', overflowY: 'auto' }}>
          {bottomContent}
        </Box>
      </Box>

      {/* フッター部分 */}
      {!hideButtons && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: 2,
            borderTop: '1px solid #ddd',
            borderBottom: '1px solid #ddd',
          }}
        >
          <Button onClick={onCancelClick} sx={{ marginRight: 2 }}>
            {cancelButtonText}
          </Button>
          <PrimaryButton
            variant="contained"
            color="primary"
            onClick={onActionButtonClick}
            disabled={!isAble || loading}
            loading={loading}
          >
            {actionButtonText}
          </PrimaryButton>
        </Box>
      )}
    </Box>
  );
};
