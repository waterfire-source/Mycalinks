'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useEcItem } from '@/app/ec/(core)/hooks/useEcItem';
import { EcItem } from '@/app/ec/(core)/hooks/useEcItem';
import { PATH } from '@/app/ec/(core)/constants/paths';

import { EcAPI } from '@/api/backendApi';

interface CardListSectionProps {
  title: string;
  getEcItemParams: EcAPI['getEcItem']['request'];
}

interface MiniItemCardProps {
  item: EcItem;
}

/**
 * ミニカード用スケルトンコンポーネント
 */
const MiniItemCardSkeleton = () => {
  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        height: '100%',
        mb: 2,
      }}
    >
      {/* 画像スケルトン */}
      <CardMedia
        sx={{
          height: '130px',
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Skeleton variant="rectangular" width={114} height={114} />
      </CardMedia>

      {/* 商品情報スケルトン */}
      <CardContent
        sx={{
          p: 1.5,
          height: '80px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 商品名スケルトン */}
        <Skeleton variant="text" sx={{ fontSize: '0.85rem', mb: 1 }} />

        {/* 型番・レア度スケルトン */}
        <Box sx={{ mb: 1 }}>
          <Skeleton variant="text" sx={{ fontSize: '0.7rem', width: '60%' }} />
          <Skeleton variant="text" sx={{ fontSize: '0.7rem', width: '40%' }} />
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * カード表示セクション用のミニカードコンポーネント
 */
const MiniItemCard = ({ item }: MiniItemCardProps) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/images/ec/noimage.png';
  };

  return (
    <Link
      href={PATH.ITEMS.detail(Number(item.id))}
      style={{ textDecoration: 'none' }}
    >
      <Card
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          borderRadius: 2,
          overflow: 'hidden',
          height: '100%',
          mb: 2,
        }}
      >
        {/* 商品画像 */}
        <CardMedia
          sx={{
            position: 'relative',
            height: '130px',
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src={item.fullImageUrl || '/images/ec/noimage.png'}
            alt={item.cardName}
            width={114}
            height={114}
            sizes="114px"
            priority={false}
            loading="lazy"
            style={{
              objectFit: 'contain',
              maxWidth: '100%',
              maxHeight: '114px',
            }}
            onError={handleImageError}
          />
        </CardMedia>

        {/* 商品情報 */}
        <CardContent
          sx={{
            p: 1.5,
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 商品名 */}
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.85rem',
            }}
          >
            {item.cardName}
          </Typography>

          {/* 型番・レア度 */}
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              color="grey.600"
              sx={{ fontSize: '0.7rem' }}
            >
              {item.expansion} {item.cardNumber}
            </Typography>
            <br />
            <Typography
              variant="caption"
              color="grey.600"
              sx={{ fontSize: '0.7rem' }}
            >
              {item.rarity}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};

export const CardListSection = ({
  title,
  getEcItemParams,
}: CardListSectionProps) => {
  const { getEcItem } = useEcItem();
  const [cardItems, setCardItems] = useState<EcItem[]>([]);
  const [isLoadingCardItems, setIsLoadingCardItems] = useState(true);

  // カード商品データを取得
  useEffect(() => {
    let isMounted = true;

    const fetchCardItems = async () => {
      try {
        setIsLoadingCardItems(true);
        console.log(
          'Fetching card items with params:',
          getEcItemParams,
          'for title:',
          title,
        );
        const items = await getEcItem(getEcItemParams);
        console.log('Fetched items:', items, 'for title:', title);

        if (items && isMounted) {
          setCardItems(items);
        }
      } catch (error) {
        if (isMounted) {
          console.error(
            'Failed to fetch card items:',
            error,
            'for title:',
            title,
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingCardItems(false);
        }
      }
    };

    console.log('CardListSection useEffect triggered for:', title);
    fetchCardItems();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box
      sx={{
        mb: 4,
        maxWidth: 'xl',
        px: 1,
        mx: 'auto',
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 2, textAlign: 'left' }}
      >
        {title}
      </Typography>

      {/* 横スクロール */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            overflowY: 'hidden',
            pb: 2,
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 4,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1)',
          }}
        >
          {isLoadingCardItems
            ? // スケルトン表示
              Array.from({ length: 7 }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: '200px',
                    flexShrink: 0,
                  }}
                >
                  <MiniItemCardSkeleton />
                </Box>
              ))
            : // 実際の商品カード表示
              cardItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    width: '200px',
                    flexShrink: 0,
                    transformOrigin: 'top right',
                  }}
                >
                  <MiniItemCard item={item} />
                </Box>
              ))}
        </Box>
      </Box>
    </Box>
  );
};
