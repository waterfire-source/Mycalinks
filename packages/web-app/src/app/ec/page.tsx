'use client';

import { useEffect, useState } from 'react';
import { TopContent } from '@/app/ec/(core)/feature/top/TopContent';
import { carouselItems } from '@/app/ec/(core)/constants/mallData';
import { ErrorHandler } from '@/app/ec/(core)/components/ErrorHandler';
import { createClientAPI } from '@/api/implement';
import { MycaAppGenre } from 'backend-core';
import { Banner } from '@/feature/ec/hooks/type';

type ErrorInfo = {
  message: string;
  severity: 'error' | 'success';
};

export default function ECPage() {
  const [genreList, setGenreList] = useState<MycaAppGenre[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const clientAPI = createClientAPI();
      const newErrors: ErrorInfo[] = [];

      try {
        const genreRes = await clientAPI.ec.getEcGenre();
        if ('genres' in genreRes) {
          setGenreList(genreRes.genres);
        } else {
          setGenreList([]);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'ジャンルの取得に失敗しました';
        newErrors.push({ message, severity: 'error' });
      }

      try {
        const bannerRes = await clientAPI.ec.getEcBanner();
        if ('banners' in bannerRes) {
          setBanners(bannerRes.banners);
        } else {
          setBanners([]);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'バナーの取得に失敗しました';
        newErrors.push({ message, severity: 'error' });
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {errors.length > 0 && <ErrorHandler errors={errors} />}
      <TopContent
        genreCards={genreList}
        carouselItems={carouselItems}
        banners={banners}
      />
    </>
  );
}
