'use client';

import { Box, Grid, Typography, Link } from '@mui/material';
import { GenreCard } from '@/app/ec/(core)/components/GenreCard';
import { BottomBanner } from '@/app/ec/(core)/components/banner/BottomBanner';
import { CarouselBanner } from '@/app/ec/(core)/components/banner/CarouselBanner';
import { CarouselItem } from '@/app/ec/(core)/constants/mallData';
import { MycaAppGenre } from 'backend-core';
import { Banner } from '@/feature/ec/hooks/type';
import { useRouter } from 'next/navigation';
import { PATH, EC_EXTERNAL_PATH } from '@/app/ec/(core)/constants/paths';
import { openExternalUrl } from '@/app/ec/(core)/utils/browserUtils';

interface MobileTopContentProps {
  genreCards: MycaAppGenre[];
  carouselItems: CarouselItem[];
  banners: Banner[];
}

export const MobileTopContent = ({
  genreCards,
  carouselItems,
  banners,
}: MobileTopContentProps) => {
  const router = useRouter();

  return (
    <>
      <CarouselBanner items={carouselItems} />
      <Box
        sx={{
          bgcolor: '#d32f2f',
          color: 'white',
          py: 1.5,
          textAlign: 'center',
          mb: 1.5,
          mx: 1.5,
        }}
      >
        <Typography variant="h3" fontWeight="bold">
          Mycalinks Mall
        </Typography>
      </Box>

      <Grid container spacing={1.5} sx={{ px: 1.5 }}>
        {genreCards.map((card) => (
          <Grid item xs={6} key={card.id}>
            <GenreCard
              title={card.display_name}
              image={card.single_genre_image}
              onClick={() =>
                router.push(
                  `${PATH.ITEMS.genre(
                    card.id.toString(),
                  )}?hasStock=true&orderBy=-actual_ec_sell_price`,
                )
              }
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2 }}>
        {banners.map((banner, index) => (
          <BottomBanner
            key={index}
            image={banner.image_url}
            onClick={() => console.log(`Banner clicked: ${banner.url}`)}
          />
        ))}
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
    </>
  );
};
