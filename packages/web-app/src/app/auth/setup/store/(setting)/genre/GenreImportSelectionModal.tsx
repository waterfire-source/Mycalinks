import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { ItemCategoryHandle } from '@prisma/client';
import { SelectionOption } from '@/app/auth/setup/store/(setting)/genre/page';

// 選択オプションの型定義

interface Props {
  open: boolean;
  onClose: () => void;
  onOptionSelect: (option: SelectionOption) => void;
  genreName?: string;
}

export const GenreImportSelectionModal: React.FC<Props> = ({
  open,
  onClose,
  onOptionSelect,
  genreName,
}: Props) => {
  const handleOptionSelect = (option: SelectionOption) => {
    onOptionSelect(option);
    onClose();
  };

  return (
    <CustomModalWithIcon
      open={open}
      width="40%"
      height="40%"
      onClose={onClose}
      title="商品インポート設定"
      cancelButtonText="キャンセル"
      hideButtons
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
        }}
      >
        <Typography textAlign="center" sx={{ mb: 2 }}>
          {genreName ? `「${genreName}」の` : ''}どの商品をインポートしますか？
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={() => handleOptionSelect('all')}
          sx={{ mb: 1 }}
        >
          すべての商品
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => handleOptionSelect(ItemCategoryHandle.CARD)}
          sx={{ mb: 1 }}
        >
          すべてのカード
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => handleOptionSelect(ItemCategoryHandle.BOX)}
        >
          すべてのBOX
        </Button>
      </Box>
    </CustomModalWithIcon>
  );
};

// 選択オプションをItemCategoryHandleに変換するユーティリティ関数
export const getTargetCategoryHandles = (
  option: SelectionOption,
): ItemCategoryHandle[] | undefined => {
  switch (option) {
    case ItemCategoryHandle.BOX:
      return [ItemCategoryHandle.BOX];
    case ItemCategoryHandle.CARD:
      return [ItemCategoryHandle.CARD];
    case 'all':
    default:
      return undefined; // 全商品の場合は指定なし
  }
};

// オプション名を表示用に変換するユーティリティ関数
export const getOptionDisplayName = (option: SelectionOption): string => {
  switch (option) {
    case 'all':
      return 'すべての商品';
    case ItemCategoryHandle.BOX:
      return 'すべてのBOX';
    case ItemCategoryHandle.CARD:
      return 'すべてのカード';
    default:
      return '';
  }
};

// オプション名を短縮表示用に変換するユーティリティ関数
export const getOptionShortDisplayName = (option: SelectionOption): string => {
  switch (option) {
    case 'all':
      return '全商品';
    case ItemCategoryHandle.BOX:
      return 'BOX';
    case ItemCategoryHandle.CARD:
      return 'カード';
    default:
      return '';
  }
};
