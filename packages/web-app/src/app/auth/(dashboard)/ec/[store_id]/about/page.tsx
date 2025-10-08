'use client';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Paper,
  Button,
} from '@mui/material';
import { useState, useEffect } from 'react';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useForm } from 'react-hook-form';
import { ShopImageUploader } from '@/feature/ec/about/components/ShopImageUploader';
import { useShopInfo } from '@/feature/ec/about/hooks/useShopInfo';
import { PATH } from '@/app/ec/(core)/constants/paths';

interface AboutPageProps {
  params: {
    store_id: string;
  };
}

interface ShopInfoForm {
  shop_pr: string;
  images: string[];
  about_shipping: string;
  about_shipping_fee: string;
  cancel_policy: string;
  return_policy: string;
}

export default function AboutPage({ params }: AboutPageProps) {
  const { store_id } = params;
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  const { register, handleSubmit, setValue, reset } = useForm<ShopInfoForm>({
    defaultValues: {
      shop_pr: '',
      images: [],
      about_shipping: '',
      about_shipping_fee: '',
      cancel_policy: '',
      return_policy: '',
    },
  });

  const { isSaving, fetchShopInfo, onSubmit } = useShopInfo(
    store_id,
    reset,
    setImageUrls,
    setIsEditing,
  );

  // Base64エンコード関数
  const encodeStoreId = (storeId: string): string => {
    try {
      return btoa(storeId);
    } catch (error) {
      console.error('Failed to encode store ID:', error);
      return '';
    }
  };

  // プレビューリンクを開く
  const handlePreviewClick = () => {
    const encodedStoreId = encodeStoreId(store_id);
    const previewUrl = PATH.STORE.about(encodedStoreId);
    window.open(previewUrl, '_blank');
  };

  useEffect(() => {
    fetchShopInfo();
  }, []);

  // 画像URLをフォームにセット
  useEffect(() => {
    setValue('images', imageUrls);
  }, [imageUrls, setValue]);

  return (
    <ContainerLayout
      title="ショップ情報（MycalinksMALL）"
      helpArchivesNumber={4547}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handlePreviewClick}
            sx={{
              borderColor: 'grey.400',
              color: 'grey.700',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50',
              },
            }}
          >
            プレビューを表示
          </Button>
          {isEditing ? (
            <PrimaryButtonWithIcon
              onClick={handleSubmit(onSubmit(imageUrls))}
              loading={isSaving}
            >
              編集内容を確定
            </PrimaryButtonWithIcon>
          ) : (
            <SecondaryButtonWithIcon onClick={() => setIsEditing(true)}>
              情報を編集
            </SecondaryButtonWithIcon>
          )}
        </Box>
      }
    >
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {/* ショップPR */}
          <Box>
            <Typography variant="subtitle1">ショップPR</Typography>
            <Paper sx={{ p: 2, mt: 1 }}>
              <TextField
                {...register('shop_pr')}
                multiline
                minRows={10}
                maxRows={30}
                fullWidth
                placeholder="ショップの紹介文を入力してください"
                variant="outlined"
                disabled={!isEditing}
                sx={{ mb: 2 }}
              />
              <ShopImageUploader
                imageUrls={imageUrls}
                onImageUrlsChange={setImageUrls}
                disabled={!isEditing}
              />
            </Paper>
          </Box>

          {/* 商品の発送について */}
          <Box>
            <Typography variant="subtitle1">商品の発送について</Typography>
            <Paper sx={{ p: 2, mt: 1 }}>
              <TextField
                {...register('about_shipping')}
                multiline
                minRows={10}
                maxRows={30}
                fullWidth
                placeholder="発送に関する情報を入力してください"
                variant="outlined"
                disabled={!isEditing}
              />
            </Paper>
          </Box>

          {/* 送料について */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">送料について</Typography>
            <Paper sx={{ p: 2, mt: 1 }}>
              <TextField
                {...register('about_shipping_fee')}
                multiline
                minRows={10}
                maxRows={30}
                fullWidth
                placeholder="送料に関する情報を入力してください"
                variant="outlined"
                disabled={!isEditing}
              />
            </Paper>
          </Box>

          {/* キャンセルポリシー */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">キャンセルポリシー</Typography>
            <Paper sx={{ p: 2, mt: 1 }}>
              <TextField
                {...register('cancel_policy')}
                multiline
                minRows={10}
                maxRows={30}
                fullWidth
                placeholder="キャンセルポリシーを入力してください"
                variant="outlined"
                disabled={!isEditing}
              />
            </Paper>
          </Box>

          {/* 返品ポリシー */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">返品ポリシー</Typography>
            <Paper sx={{ p: 2, mt: 1 }}>
              <TextField
                {...register('return_policy')}
                multiline
                minRows={10}
                maxRows={30}
                fullWidth
                placeholder="返品ポリシーを入力してください"
                variant="outlined"
                disabled={!isEditing}
              />
            </Paper>
          </Box>
        </Stack>
      </Box>
    </ContainerLayout>
  );
}
