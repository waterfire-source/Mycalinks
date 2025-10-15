'use client';

import React, { useState, useCallback } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
} from '@mui/icons-material';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';

interface ShopImageUploaderProps {
  imageUrls: string[];
  onImageUrlsChange: (urls: string[]) => void;
  disabled?: boolean;
}

export const ShopImageUploader: React.FC<ShopImageUploaderProps> = ({
  imageUrls,
  onImageUrlsChange,
  disabled = false,
}) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      if (!store?.id) {
        setAlertState({
          message: 'ストア情報が取得できません',
          severity: 'error',
        });
        return;
      }

      const remainingSlots = 5 - imageUrls.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      setUploadingCount(filesToProcess.length);

      try {
        const newImageUrls: string[] = [];

        for (const file of filesToProcess) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('kind', 'store');

          const response = await fetch(
            `/api/store/${store?.id}/functions/upload-image/`,
            {
              method: 'POST',
              body: formData,
            },
          );

          const result = await response.json();
          if (result.imageUrl) {
            newImageUrls.push(result.imageUrl);
          }
        }

        if (newImageUrls.length > 0) {
          onImageUrlsChange([...imageUrls, ...newImageUrls]);
        }
      } catch (error) {
        setAlertState({
          message: '画像のアップロードに失敗しました。',
          severity: 'error',
        });
      } finally {
        setUploadingCount(0);
        event.target.value = '';
      }
    },
    [store?.id, imageUrls, onImageUrlsChange, setAlertState],
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const newImageUrls = imageUrls.filter((_, i) => i !== index);
      onImageUrlsChange(newImageUrls);
    },
    [imageUrls, onImageUrlsChange],
  );

  const handleMoveImage = useCallback(
    (fromIndex: number, direction: 'up' | 'down') => {
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= imageUrls.length) return;

      const newImageUrls = [...imageUrls];
      [newImageUrls[fromIndex], newImageUrls[toIndex]] = [
        newImageUrls[toIndex],
        newImageUrls[fromIndex],
      ];
      onImageUrlsChange(newImageUrls);
    },
    [imageUrls, onImageUrlsChange],
  );

  // 5つのスロットを作成（空のスロットも含む）
  const imageSlots = Array.from(
    { length: 5 },
    (_, index) => imageUrls[index] || '',
  );

  return (
    <Grid container spacing={2}>
      {imageSlots.map((url, index) => (
        <Grid item xs={12} sm={4} md={2.4} key={index}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              border: '1px solid #e0e0e0',
              height: 240,
              position: 'relative',
            }}
          >
            {url ? (
              // 画像が設定されている場合
              <>
                <CardMedia
                  component="img"
                  height={190}
                  image={url}
                  alt={`ショップ画像 ${index + 1}`}
                  sx={{ objectFit: 'contain', backgroundColor: '#f5f5f7' }}
                />
                <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      onClick={() => handleMoveImage(index, 'up')}
                      size="small"
                      disabled={disabled || index === 0}
                      sx={{ p: 0.5 }}
                    >
                      <UpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleMoveImage(index, 'down')}
                      size="small"
                      disabled={disabled || index === imageUrls.length - 1}
                      sx={{ p: 0.5 }}
                    >
                      <DownIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <IconButton
                    onClick={() => handleRemoveImage(index)}
                    size="small"
                    color="error"
                    disabled={disabled}
                    sx={{ p: 0.5 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </>
            ) : (
              // 空のスロットの場合
              <Box
                component={disabled ? 'div' : 'label'}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: disabled ? 'default' : 'pointer',
                  border: '2px dashed #e0e0e0',
                  borderRadius: 2,
                  color: disabled ? 'grey.400' : 'grey.600',
                  opacity: disabled ? 0.5 : 1,
                  '&:hover': {
                    borderColor: disabled ? '#e0e0e0' : 'primary.main',
                    backgroundColor: disabled ? 'transparent' : 'grey.50',
                  },
                }}
              >
                {uploadingCount > 0
                  ? `アップロード中...`
                  : `PR画像を追加 ${index + 1}`}
                <AddIcon sx={{ fontSize: 48, color: 'grey.600', mb: 1 }} />
                {!disabled && (
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingCount > 0}
                  />
                )}
              </Box>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
