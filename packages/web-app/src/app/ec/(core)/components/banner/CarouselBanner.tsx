'use client';

import { Paper } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Carousel from 'react-material-ui-carousel';
import { CarouselItem } from '@/app/ec/(core)/constants/mallData';
import { openExternalUrl } from '@/app/ec/(core)/utils/browserUtils';

interface CarouselBannerProps {
  items: CarouselItem[];
}

export const CarouselBanner = ({ items }: CarouselBannerProps) => {
  const router = useRouter();

  const handleBannerClick = (item: CarouselItem) => {
    if (!item.link) return;

    switch (item.linkType) {
      case 'internal':
        // 内部リンクはNext.jsのrouterで遷移
        router.push(item.link);
        break;
      case 'external':
        // 外部リンクはbrowserUtilsを使用してアクセス
        openExternalUrl(item.link);
        break;
      default:
        // linkTypeがnullの場合は何もしない
        break;
    }
  };

  return (
    <>
      <Carousel
        animation="slide"
        indicators={true}
        navButtonsAlwaysVisible={false}
        autoPlay={true}
        interval={5000}
        stopAutoPlayOnHover={false}
        navButtonsProps={{
          style: {
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            color: '#000',
          },
        }}
      >
        {items.map((item) => (
          <Paper
            key={item.id}
            elevation={0}
            sx={{
              position: 'relative',
              aspectRatio: '12/5',
              width: '100%',
              maxHeight: '250px',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${item.image || '/sample.png'})`,
                backgroundSize: 'contain',
                filter: 'blur(15px)',
                opacity: 0.7,
                zIndex: 0,
              },
            }}
            onClick={() => handleBannerClick(item)}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="100vw"
              style={{
                objectFit: 'contain',
                cursor: item.link ? 'pointer' : 'default',
              }}
              priority={true}
            />
          </Paper>
        ))}
      </Carousel>
    </>
  );
};
