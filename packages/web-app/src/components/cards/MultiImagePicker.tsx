'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  IconButton,
  Paper,
  Typography,
  Card,
  CardMedia,
  CardContent,
  TextField,
  SxProps,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useStore } from '@/contexts/StoreContext';
import { ProductImageData } from '@/feature/products/hooks/useUpdateProductImages';
import { useAlert } from '@/contexts/AlertContext';

interface Props {
  images: ProductImageData[];
  onImagesChange: (images: ProductImageData[]) => void;
  maxImages?: number;
  label?: string;
  sx?: SxProps;
}

export const MultiImagePicker: React.FC<Props> = ({
  images,
  onImagesChange,
  maxImages = 10,
  label = '追加画像',
  sx,
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

      const remainingSlots = maxImages - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      setUploadingCount(filesToProcess.length);

      try {
        const newImages: ProductImageData[] = [];

        for (const file of filesToProcess) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('kind', 'product');

          const response = await fetch(
            `/api/store/${store?.id}/functions/upload-image/`,
            {
              method: 'POST',
              body: formData,
            },
          );

          const result = await response.json();
          if (result.imageUrl) {
            newImages.push({
              image_url: result.imageUrl,
              description: '',
              order_number: images.length + newImages.length,
            });
          }
        }

        if (newImages.length > 0) {
          onImagesChange([...images, ...newImages]);
        }
      } catch (error) {
        setAlertState({
          message: '画像のアップロードに失敗しました。もう一度お試しください。',
          severity: 'error',
        });
      } finally {
        setUploadingCount(0);
        // Reset input value to allow selecting the same file again
        event.target.value = '';
      }
    },
    [store?.id, images, maxImages, onImagesChange],
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      const reorderedImages = newImages.map((img, i) => ({
        ...img,
        order_number: i,
      }));
      onImagesChange(reorderedImages);
    },
    [images, onImagesChange],
  );

  const handleDescriptionChange = useCallback(
    (index: number, description: string) => {
      const newImages = [...images];
      newImages[index] = { ...newImages[index], description };
      onImagesChange(newImages);
    },
    [images, onImagesChange],
  );

  const handleMoveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= images.length) return;

      const newImages = [...images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);

      const reorderedImages = newImages.map((img, i) => ({
        ...img,
        order_number: i,
      }));

      onImagesChange(reorderedImages);
    },
    [images, onImagesChange],
  );

  const canAddMore = images.length < maxImages;

  return (
    <Box sx={sx}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {label}
        <Chip
          label={`${images.length}/${maxImages}`}
          size="small"
          sx={{ ml: 1, color: 'white', backgroundColor: 'primary.main' }}
        />
      </Typography>
      <Typography variant="body2" fontSize="14px" sx={{ mb: 1 }}>
        下の「画像を追加」ボタンから画像をアップロードしてください
      </Typography>

      <Grid container spacing={2}>
        {images.map((image, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height={200}
                image={image.image_url}
                alt={`追加画像 ${index + 1}`}
                sx={{ objectFit: 'contain' }}
              />
              <CardContent sx={{ p: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="caption" color="text.primary">
                    画像 {index + 1}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveImage(index, index - 1)}
                      disabled={index === 0}
                    >
                      ↑
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveImage(index, index + 1)}
                      disabled={index === images.length - 1}
                    >
                      ↓
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Box>
                  <TextField
                    size="small"
                    label="説明（任意）"
                    InputLabelProps={{ shrink: true, color: 'primary' }}
                    value={image.description || ''}
                    onChange={(e) =>
                      handleDescriptionChange(index, e.target.value)
                    }
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* 画像追加button */}
        {canAddMore && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                height: 280,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'grey.400',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'grey.50',
                },
                position: 'relative',
              }}
              component="label"
            >
              <AddIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography color="text.primary">
                {uploadingCount > 0
                  ? `アップロード中... (${uploadingCount})`
                  : '画像を追加'}
              </Typography>
              <Typography
                variant="caption"
                color="text.primary"
                sx={{ mt: 0.5 }}
              >
                残り {maxImages - images.length} 枚
              </Typography>
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingCount > 0}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
