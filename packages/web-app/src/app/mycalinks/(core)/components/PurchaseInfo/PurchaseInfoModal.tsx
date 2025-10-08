'use client';

import { AppModal } from '@/components/modals/mycalinks/AppModal';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  availableGenres: string[];
  availableStores: { id: number; name: string }[];
  handleFilterChange: (
    genre: string | null,
    storeIds: number[],
  ) => Promise<void>;
  selectedStoreId: number | null; // 選択店舗で選択されている店舗のid
}

export const PurchaseInfoModal = ({
  open,
  onClose,
  availableGenres,
  availableStores,
  handleFilterChange,
  selectedStoreId,
}: Props) => {
  // 選択状態管理
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);

  // selectedStoreIdがある場合の初期値設定
  useEffect(() => {
    if (selectedStoreId) {
      setSelectedStoreIds([selectedStoreId]);
    } else {
      setSelectedStoreIds([]);
    }
  }, [selectedStoreId]);

  // 店舗チェックボックス変更時の処理
  const handleStoreChange = (storeId: number, checked: boolean) => {
    if (!storeId || storeId === 0) return;
    const newSelectedStoreIds = checked
      ? [...selectedStoreIds, storeId]
      : selectedStoreIds.filter((id) => id !== storeId);

    setSelectedStoreIds(newSelectedStoreIds);
  };

  // 全選択ボタン
  const handleSelectAll = () => {
    setSelectedStoreIds(
      availableStores
        ?.filter((store) => store?.id && store.id !== 0)
        .map((store) => store!.id) || [],
    );
  };

  const handleConfirm = async () => {
    try {
      await handleFilterChange(selectedGenre, selectedStoreIds);
      onClose(); // 成功時のみ閉じる
    } catch (error) {
      // エラー時はモーダルを開いたまま
      console.error('絞り込みに失敗しました:', error);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="絞り込み"
      actionButtonText="適用"
      onActionButtonClick={handleConfirm}
    >
      <>
        {/* ジャンル選択セクション */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 4,
                height: 20,
                backgroundColor: 'primary.main',
                mr: 1,
              }}
            />
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              ジャンル
            </Typography>
          </Box>
          <FormControl fullWidth>
            <Select
              size="small"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              displayEmpty
              sx={{ backgroundColor: 'grey.100' }}
            >
              <MenuItem value="">
                <Typography sx={{ color: 'grey.500' }}>
                  ジャンルを選択してください
                </Typography>
              </MenuItem>
              {availableGenres.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 店舗選択セクション（複数選択可） */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 4,
                height: 20,
                backgroundColor: 'primary.main',
                mr: 1,
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              店舗（複数選択可）
            </Typography>
          </Box>

          <Box
            sx={{
              border: 1,
              borderColor: 'grey.300',
              borderRadius: 1,
              p: 2,
              backgroundColor: 'grey.50',
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            {/* 全選択チェックボックス */}
            <Button
              variant="contained"
              color="inherit"
              size="small"
              onClick={handleSelectAll}
              sx={{
                bgcolor: '#aaaaaa',
                color: 'white',
                fontSize: '0.75rem', // フォントサイズを小さく
                minHeight: 28, // 高さを小さく
                px: 1, // 横パディングを小さく
                py: 0.5,
                '&:hover': {
                  bgcolor: '#999999',
                },
              }}
            >
              全選択
            </Button>

            {/* 各店舗のチェックボックス */}
            {availableStores?.length !== 0 &&
              availableStores?.map((store) => (
                <FormControlLabel
                  key={store?.id}
                  control={
                    <Checkbox
                      checked={
                        store?.id ? selectedStoreIds.includes(store.id) : false
                      }
                      onChange={(e) =>
                        store?.id &&
                        handleStoreChange(store.id, e.target.checked)
                      }
                    />
                  }
                  label={store?.name || ''}
                  sx={{ display: 'block', ml: 2 }}
                />
              ))}
          </Box>
        </Box>
      </>
    </AppModal>
  );
};
