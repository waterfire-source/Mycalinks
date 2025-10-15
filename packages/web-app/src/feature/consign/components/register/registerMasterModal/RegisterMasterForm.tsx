'use client';

import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Grid,
  Stack,
} from '@mui/material';
import { useStore } from '@/contexts/StoreContext';
import { ImagePicker } from '@/components/cards/ImagePicker';
import { RegisterItemFormData } from '@/app/auth/(dashboard)/item/components/ItemRegisterModal';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';
import Image from 'next/image';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';

interface RegisterMasterFormProps {
  formData: RegisterItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegisterItemFormData>>;
  onClose: () => void;
}

export const RegisterMasterForm: React.FC<RegisterMasterFormProps> = ({
  formData,
  setFormData,
  onClose,
}) => {
  const { store } = useStore();
  const { genre, fetchGenreList } = useGenre();
  const { category, fetchCategoryList } = useCategory();

  //初回読み込み
  useEffect(() => {
    if (!store.id) return;

    fetchGenreList();
    fetchCategoryList();
  }, []);

  return (
    <Grid container spacing={4}>
      <Grid item xs={3} my={4}>
        {/* 画像部分 */}
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            mb: 4,
          }}
        >
          {formData.image_url ? (
            <Image
              src={formData.image_url}
              alt="Selected"
              width={150}
              height={200}
            />
          ) : (
            <Box
              sx={{
                width: '150px',
                height: '200px',
                border: '1px dashed gray',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'gray',
              }}
            >
              画像を選択
            </Box>
          )}
          <ImagePicker
            kind="item"
            onImageUploaded={(url: string | null) => {
              setFormData((prev: RegisterItemFormData) => ({
                ...prev,
                image_url: url,
              }));
            }}
          />
        </Box>
      </Grid>

      <Grid item xs={6} my={4}>
        {[
          { label: '商品名', name: 'display_name', required: true },
          { label: '商品名カナ', name: 'display_name_ruby', required: false },
          {
            label: 'レアリティ',
            name: 'rarity',
            required: false,
          },
          { label: '封入パック', name: 'pack_name', required: false },
          {
            label: '表示順',
            name: 'order_number',
            required: false,
            type: 'number',
          },
          {
            label: 'エキスパンション',
            name: 'expansion',
            required: false,
          },
          {
            label: 'カード番号',
            name: 'cardnumber',
            required: false,
            type: 'half',
          },
          { label: 'キーワード', name: 'keyword', required: false },
          {
            label: 'JANコード',
            name: 'readonly_product_code',
            required: false,
            type: 'half',
          }, // JANコード（カンマ区切りで複数登録）
        ].map((field) => (
          <Box
            key={field.name}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'left',
              }}
            >
              <Typography>
                {field.label}
                {field.required && (
                  <Typography
                    sx={{
                      backgroundColor: 'grey.500',
                      color: 'white',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      ml: 1,
                    }}
                    variant="caption"
                  >
                    必須
                  </Typography>
                )}
              </Typography>
            </Box>

            <Box sx={{ width: 'calc(100% - 100px)' }}>
              <TextField
                fullWidth
                name={field.name}
                value={formData[field.name as keyof RegisterItemFormData] ?? ''}
                onChange={(e) => {
                  const value =
                    field.type === 'half' || field.type === 'number'
                      ? toHalfWidthOnly(e.target.value)
                      : e.target.value;

                  const name = e.target.name;

                  setFormData((prevData) => ({
                    ...prevData,
                    [name]: value,
                  }));
                }}
                required={field.required}
                sx={{
                  '& input': {
                    textAlign: 'left',
                    padding: '8px',
                    backgroundColor: 'white',
                  },
                }}
              />
            </Box>
          </Box>
        ))}

        {/* ジャンル */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ width: 150 }}>
            <Typography>
              ジャンル
              <Typography
                sx={{
                  backgroundColor: 'grey.500',
                  color: 'white',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  ml: 1,
                }}
                variant="caption"
              >
                必須
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ width: 'calc(100% - 100px)' }}>
            <FormControl fullWidth size="small">
              <Select
                labelId="genre-select-label"
                name="genre_id"
                value={formData.genre_id?.toString() ?? ''} // number を string に変換
                onChange={(e: SelectChangeEvent<string>) => {
                  setFormData((prev) => ({
                    ...prev,
                    genre_id: e.target.value
                      ? Number(e.target.value)
                      : undefined, // 型を合わせる
                  }));
                }}
                sx={{
                  backgroundColor: 'white',
                }}
              >
                {genre?.itemGenres.map((genre) => (
                  <MenuItem key={genre.id} value={genre.id.toString()}>
                    {genre.display_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* カテゴリ */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ width: 150 }}>
            <Typography>
              カテゴリ
              <Typography
                sx={{
                  backgroundColor: 'grey.500',
                  color: 'white',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  ml: 1,
                }}
                variant="caption"
              >
                必須
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ width: 'calc(100% - 100px)' }}>
            <FormControl fullWidth size="small">
              <Select
                labelId="category-select-label"
                name="category_id"
                value={formData.category_id?.toString() ?? ''} // number を string に変換
                onChange={(e: SelectChangeEvent<string>) => {
                  setFormData((prev) => ({
                    ...prev,
                    category_id: e.target.value
                      ? Number(e.target.value)
                      : undefined, // 型を合わせる
                  }));
                }}
                sx={{
                  backgroundColor: 'white',
                }}
              >
                {category?.itemCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.display_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={3}>
        <Stack gap={2} width="fit-content" ml="auto">
          <SecondaryButtonWithIcon
            onClick={onClose}
            sx={{ textTransform: 'none' }}
          >
            Mycalinksから商品を選ぶ
          </SecondaryButtonWithIcon>
        </Stack>
      </Grid>
    </Grid>
  );
};
