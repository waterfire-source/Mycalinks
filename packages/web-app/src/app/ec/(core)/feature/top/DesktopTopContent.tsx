'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Link,
  Skeleton,
} from '@mui/material';
import Image from 'next/image';
import { CarouselBanner } from '@/app/ec/(core)/components/banner/CarouselBanner';
import { BottomBanner } from '@/app/ec/(core)/components/banner/BottomBanner';
import { MycaAppGenre } from 'backend-core';
import { CarouselItem } from '@/app/ec/(core)/constants/mallData';
import { Banner } from '@/feature/ec/hooks/type';
import { PATH, EC_EXTERNAL_PATH } from '@/app/ec/(core)/constants/paths';
import { openExternalUrl } from '@/app/ec/(core)/utils/browserUtils';
import { CardListSection } from '@/app/ec/(core)/components/list/CardListSection';

interface DesktopTopContentProps {
  genreCards: MycaAppGenre[];
  carouselItems: CarouselItem[];
  banners: Banner[];
}

interface DesktopGenreCardProps {
  title: string;
  image?: string;
  onClick: () => void;
}

/**
 * ジャンルカード用スケルトンコンポーネント
 */
const DesktopGenreCardSkeleton = () => {
  return (
    <Card
      elevation={0}
      sx={{
        height: 160,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
      }}
    >
      <CardMedia
        sx={{
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fafafa',
        }}
      >
        <Skeleton variant="rectangular" width={80} height={80} />
      </CardMedia>
      <CardContent sx={{ p: 2, height: 60 }}>
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '60%' }} />
      </CardContent>
    </Card>
  );
};

const DesktopGenreCard = ({ title, image, onClick }: DesktopGenreCardProps) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/images/ec/noimage.png';
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: 160,
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0px 4px 20px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
        },
        border: '1px solid #e0e0e0',
        borderRadius: 2,
      }}
      onClick={onClick}
    >
      <CardMedia
        sx={{
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fafafa',
        }}
      >
        <Image
          src={image || '/images/ec/noimage.png'}
          alt={title}
          width={80}
          height={80}
          style={{ objectFit: 'contain' }}
          onError={handleImageError}
        />
      </CardMedia>
      <CardContent sx={{ p: 2, height: 60 }}>
        <Typography
          variant="body2"
          component="div"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export const DesktopTopContent = ({
  genreCards,
  carouselItems,
  banners,
}: DesktopTopContentProps) => {
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);

  // ジャンルデータの初期ローディング状態を管理
  useEffect(() => {
    if (genreCards.length > 0) {
      setIsLoadingGenres(false);
    }
  }, [genreCards]);

  return (
    <Box>
      {/* カルーセルバナー */}
      <Box sx={{ mb: 4 }}>
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <CarouselBanner items={carouselItems} />
        </Paper>
      </Box>

      {/* カード表示セクション */}
      <CardListSection
        title="ポケモン ソード&シールド"
        getEcItemParams={{
          hasStock: true,
          itemCategory: ['CARD'],
          storeIds: '1,3,21,22,33,35,37,38,74',
          conditionOption: [
            'O2_A',
            'O4_B',
            'O5_C',
            'O6_D',
            'O3_FOR_PLAY',
            'O1_BRAND_NEW',
            'O2_LIKE_NEW',
            'O3_USED',
          ],
          cardSeries: '%スカーレット%',
          itemGenre: 'ポケモン',
          orderBy: '-actual_ec_sell_price',
          take: 12,
          skip: 0,
        }}
      />

      {/* 固定バナー - 2つ横並び */}
      <Box sx={{ mb: 4, maxWidth: 'xl', mx: 'auto', px: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={1}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
              onClick={() => console.log('MEGA banner clicked')}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: '200px', md: '250px' },
                }}
              >
                <Image
                  src="/images/ec/mega_banner.jpg"
                  alt="MEGA キャンペーン"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={1}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
              onClick={() => console.log('EC test release banner clicked')}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: '200px', md: '250px' },
                }}
              >
                <Image
                  src="/images/ec/ec_test_release.jpg"
                  alt="ECテストリリース"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* バナー */}
      {banners.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ mb: 2, textAlign: 'left' }}
          >
            お知らせ・キャンペーン
          </Typography>
          <Grid container spacing={2}>
            {banners.map((banner, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper
                  elevation={1}
                  sx={{ borderRadius: 2, overflow: 'hidden' }}
                >
                  <BottomBanner
                    image={banner.image_url}
                    onClick={() => console.log(`Banner clicked: ${banner.url}`)}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* カード表示セクション */}
      <CardListSection
        title="ポケモン BOX"
        getEcItemParams={{
          hasStock: true,
          itemCategory: ['BOX'],
          storeIds: '1,3,21,22,33,35,37,38,74',
          conditionOption: ['O1_BRAND_NEW', 'O2_LIKE_NEW', 'O3_USED'],
          itemGenre: 'ポケモン',
          orderBy: '-actual_ec_sell_price',
          take: 12,
          skip: 0,
        }}
      />

      {/* ジャンル一覧 - 横スクロール表示 */}
      <Box sx={{ mb: 4, maxWidth: 'xl', mx: 'auto', px: 1 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ mb: 2, textAlign: 'left' }}
        >
          カテゴリから探す
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            overflowY: 'hidden',
            pb: 1, // スクロールバー用の余白
            // スクロールバーのスタイリング
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
            // Firefox用のスクロールバー
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1)',
          }}
        >
          {isLoadingGenres
            ? // スケルトン表示
              Array.from({ length: 7 }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    minWidth: '200px',
                    flexShrink: 0,
                  }}
                >
                  <DesktopGenreCardSkeleton />
                </Box>
              ))
            : // 実際のジャンルカード表示
              genreCards.map((card) => (
                <Box
                  key={card.id}
                  sx={{
                    minWidth: '200px', // カードの最小幅を設定
                    flexShrink: 0, // カードが縮まないようにする
                  }}
                >
                  <Link
                    href={`${PATH.ITEMS.genre(
                      card.id.toString(),
                    )}?hasStock=true`}
                    style={{ textDecoration: 'none' }}
                  >
                    <DesktopGenreCard
                      title={card.display_name}
                      image={card.single_genre_image}
                      onClick={() => {}}
                    />
                  </Link>
                </Box>
              ))}
        </Box>
      </Box>

      {/* 外部リンクセクション */}
      <Box
        sx={{
          mt: 3,
          mb: 2,
          textAlign: 'center',
          px: 1.5,
        }}
      >
        <Link
          onClick={() => openExternalUrl(EC_EXTERNAL_PATH.specialCommercialLaw)}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            cursor: 'pointer',
            color: 'primary.main',
            textDecoration: 'underline',
            '&:hover': {
              opacity: 0.7,
            },
          }}
        >
          特定商取引法に基づく表示
        </Link>
      </Box>
    </Box>
  );
};
