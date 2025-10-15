'use client';

import { MycaAppGenre } from 'backend-core';
import { CarouselItem } from '@/app/ec/(core)/constants/mallData';
import { Banner } from '@/feature/ec/hooks/type';
import { useDevice } from '@/app/ec/(core)/contexts/DeviceContext';
import { DesktopTopContent } from '@/app/ec/(core)/feature/top/DesktopTopContent';
import { MobileTopContent } from '@/app/ec/(core)/feature/top/MobileTopContent';

interface TopContentProps {
  genreCards: MycaAppGenre[];
  carouselItems: CarouselItem[];
  banners: Banner[];
}

export const TopContent = ({
  genreCards,
  carouselItems,
  banners,
}: TopContentProps) => {
  const { isDesktop } = useDevice();

  // デスクトップ版を表示
  if (isDesktop) {
    return (
      <DesktopTopContent
        genreCards={genreCards}
        carouselItems={carouselItems}
        banners={banners}
      />
    );
  }

  // モバイル版を表示
  return (
    <MobileTopContent
      genreCards={genreCards}
      carouselItems={carouselItems}
      banners={banners}
    />
  );
};
