import React, { useState } from 'react';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';
import Image from 'next/image';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { useStore } from '@/contexts/StoreContext';

/**
 * 一枚だけアップロードしたい場合は imageUrl を string、
 * 複数枚なら string[] にして使う。
 */

type ImageType = string | string[] | undefined;

interface Props<T extends ImageType> {
  imageUrl: T;
  onImageUploaded: React.Dispatch<React.SetStateAction<T>>;
  kind?: string;
  width?: number;
  height?: number;
}

export const AdvertisementImageUpload = <T extends ImageType>({
  imageUrl,
  onImageUploaded,
  kind = 'advertisement',
  width = 150,
  height = 150,
}: Props<T>) => {
  const { store } = useStore();
  const toArray = (val: ImageType): string[] => {
    if (typeof val === 'undefined') return [];
    if (typeof val === 'string') return [val];
    return val.filter((v): v is string => typeof v === 'string');
  };

  /**
   * サーバーへ画像を POST して URL を受け取る
   */
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);

    const res = await fetch(`/api/store/${store.id}/functions/upload-image/`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Upload failed');
    }

    const json = (await res.json()) as { imageUrl?: string };

    if (!json.imageUrl) throw new Error('No imageUrl returned');
    return json.imageUrl;
  };

  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    setLoading(true);
    try {
      const uploadedUrls = await Promise.all(
        Array.from(files).map(uploadImage),
      );

      onImageUploaded((prev) => {
        if (Array.isArray(prev)) {
          return [...prev, ...uploadedUrls] as T;
        }
        return uploadedUrls[0] as T;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = (url: string) => {
    onImageUploaded((prev) => {
      const current = toArray(prev).filter((u) => u !== url);
      return (Array.isArray(prev) ? current : current[0] ?? undefined) as T;
    });
  };

  const imageList = toArray(imageUrl);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}
      >
        {/* アップロードボックス */}
        <Box
          component="label"
          sx={{
            width,
            height,
            borderWidth: '0.5px',
            borderStyle: 'solid',
            borderColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: 'white',
            borderRadius: '8px',
            position: 'relative',
          }}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          {loading ? (
            <CircularProgress size={32} />
          ) : (
            <Stack direction="column" alignItems="center" spacing={1}>
              <ImageOutlinedIcon color="action" fontSize="large" />
              <Typography>ファイルをアップロード</Typography>
            </Stack>
          )}
        </Box>

        {/* 画像プレビュー */}
        {imageList.map((url, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'relative',
              width,
              height,
              borderWidth: '0.5px',
              borderStyle: 'solid',
              borderColor: 'rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              backgroundColor: 'white',
              borderRadius: '8px',
            }}
          >
            <Image
              src={url}
              alt="selected"
              fill
              style={{ objectFit: 'contain' }}
            />
            <Box
              component="button"
              onClick={() => handleRemoveImage(url)}
              sx={{
                position: 'absolute',
                top: 5,
                right: 5,
                background: '#ff4d4f',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 20,
                height: 20,
                lineHeight: '20px',
                cursor: 'pointer',
              }}
            >
              ×
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
