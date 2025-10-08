'use client';

import {
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardMedia,
  CircularProgress,
} from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useEcStoreContext } from '@/app/ec/(core)/contexts/EcStoreContext';
import { createClientAPI, CustomError } from '@/api/implement';

interface StoreAboutPageProps {
  params: {
    encode_store_id: string;
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

export default function StoreAboutPage({ params }: StoreAboutPageProps) {
  const { encode_store_id } = params;
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('');
  const { stores } = useEcStoreContext();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);

  // Base64デコードして店舗IDを取得
  const decodeStoreId = (encodedId: string): string => {
    try {
      // URLデコードしてからBase64デコード
      const urlDecoded = decodeURIComponent(encodedId);
      const base64Decoded = atob(urlDecoded);
      return base64Decoded;
    } catch (error) {
      // デコードに失敗した場合、そのまま使用してみる
      return encodedId;
    }
  };

  const storeId = decodeStoreId(encode_store_id);

  const form = useForm<ShopInfoForm>({
    defaultValues: {
      shop_pr: '',
      images: [],
      about_shipping: '',
      about_shipping_fee: '',
      cancel_policy: '',
      return_policy: '',
    },
  });

  const { reset, watch } = form;
  const clientAPI = createClientAPI();

  // 店舗情報取得
  const loadShopInfo = async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      const response = await clientAPI.ec.getEcStoreAboutUs({
        ecStoreId: Number(storeId),
      });

      if (response instanceof CustomError) {
        setHasError(true);
        setLoading(false);
        return;
      }

      // フォームにデータをセット
      const data = {
        shop_pr: response.shop_pr || '',
        images: response.images || [],
        about_shipping: response.about_shipping || '',
        about_shipping_fee: response.about_shipping_fee || '',
        cancel_policy: response.cancel_policy || '',
        return_policy: response.return_policy || '',
      };

      reset(data);
      setImageUrls(data.images);

      // stores配列から該当する店舗名を取得
      if (stores && stores.length > 0) {
        const targetStore = stores.find(
          (store) => store.id.toString() === storeId,
        );
        if (targetStore) {
          setStoreName(targetStore.display_name || '');
        } else {
          setStoreName('');
        }
      } else {
        setStoreName('');
      }
    } catch (error) {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShopInfo();
  }, [encode_store_id, storeId, stores]);

  // react-hook-formの値を使用してshopInfo作成
  const watchedValues = watch();
  const shopInfo = {
    shop_pr: watchedValues.shop_pr || '',
    images: imageUrls,
    about_shipping: watchedValues.about_shipping || '',
    about_shipping_fee: watchedValues.about_shipping_fee || '',
    cancel_policy: watchedValues.cancel_policy || '',
    return_policy: watchedValues.return_policy || '',
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!storeId || hasError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            textAlign: 'center',
          }}
        >
          <ErrorOutline
            sx={{
              fontSize: 60,
              color: 'grey.600',
              mb: 2,
            }}
          />
          <Typography variant="body2">
            指定された店舗の詳細情報が見つかりませんでした
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Paper
        sx={{
          p: 1,
          mb: 3,
          backgroundColor: 'primary.main',
          color: 'white',
          textAlign: 'center',
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          {storeName}
        </Typography>
      </Paper>

      {/* ショップPR */}
      {shopInfo.shop_pr && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {shopInfo.shop_pr}
          </Typography>
        </Box>
      )}

      {/* ショップ画像 */}
      {shopInfo.images && shopInfo.images.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              // Firefox用
              scrollbarWidth: 'none',
              // IE/Edge用
              msOverflowStyle: 'none',
            }}
          >
            {shopInfo.images.map((imageUrl, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: 200,
                  width: 200,
                  height: 150,
                }}
              >
                <Card sx={{ width: '100%', height: '100%' }}>
                  <CardMedia
                    component="img"
                    height={150}
                    image={imageUrl}
                    alt={`ショップ画像 ${index + 1}`}
                    sx={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* 商品の発送について */}
      {shopInfo.about_shipping && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ width: '100%' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: 1,
              }}
            >
              ■ 商品の発送について
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 3,
                backgroundColor: 'primary.main',
                mb: 2,
                borderRadius: 1,
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {shopInfo.about_shipping}
          </Typography>
        </Box>
      )}

      {/* 送料について */}
      {shopInfo.about_shipping_fee && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ width: '100%' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: 1,
              }}
            >
              ■ 送料について
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 3,
                backgroundColor: 'primary.main',
                mb: 2,
                borderRadius: 1,
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {shopInfo.about_shipping_fee}
          </Typography>
        </Box>
      )}

      {/* キャンセルポリシー */}
      {shopInfo.cancel_policy && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ width: '100%' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: 1,
              }}
            >
              ■ キャンセルポリシー
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 3,
                backgroundColor: 'primary.main',
                mb: 2,
                borderRadius: 1,
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {shopInfo.cancel_policy}
          </Typography>
        </Box>
      )}

      {/* 返品ポリシー */}
      {shopInfo.return_policy && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ width: '100%' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: 1,
              }}
            >
              ■ 返品ポリシー
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 3,
                backgroundColor: 'primary.main',
                mb: 2,
                borderRadius: 1,
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {shopInfo.return_policy}
          </Typography>
        </Box>
      )}
    </Container>
  );
}
