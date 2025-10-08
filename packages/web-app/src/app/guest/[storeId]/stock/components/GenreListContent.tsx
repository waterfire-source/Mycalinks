'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useAppGenre } from '@/feature/genre/hooks/useAppGenre';

import Image from 'next/image';
import NoImg from '@/components/common/NoImg';
import { useParamsInGuest } from '@/app/guest/[storeId]/stock/hooks/useParamsInGuest';
import { createClientAPI, CustomError } from '@/api/implement';
import { GenreAPIRes } from '@/api/frontend/genre/api';
import { useAlert } from '@/contexts/AlertContext';
interface GenreListContentProps {
  onSelect: (selectedGenreId: string) => void;
}

export function GenreListContent({ onSelect }: GenreListContentProps) {
  const { storeId } = useParamsInGuest();
  const { appGenre, fetchAppGenreList } = useAppGenre();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [posGenre, setPosGenre] = useState<GenreAPIRes['getGenreAll']>();
  const [isLoading, setIsLoading] = useState(false);
  const { setAlertState } = useAlert();

  // ジャンルを取得（storeIdが変化した場合のみ取得）
  useEffect(() => {
    const fetchGenre = async () => {
      if (storeId) {
        setIsLoading(true);
        fetchAppGenreList(Number(storeId));
        const res = await clientAPI.genre.getGenreAll({
          storeID: storeId,
          fromTablet: true,
        });
        if (res instanceof CustomError) {
          setAlertState({
            message: `${res.status}:${res.message}`,
            severity: 'error',
          });
          setIsLoading(false);
          return;
        }
        setPosGenre(res);
        setIsLoading(false);
      }
    };
    fetchGenre();
  }, [clientAPI.genre, fetchAppGenreList, setAlertState, storeId]);

  // Mycaアプリで指定済み、かつ、POSで登録済みのジャンルのみが対象（posGenreの有無で判定）
  const genres = appGenre?.appGenres
    .filter((genre) => genre.posGenre !== null)
    .filter(
      (genre) =>
        posGenre?.itemGenres.some(
          (posGenre) => posGenre.id === genre.posGenre?.id,
        ),
    )
    .map((genre) => {
      return {
        id: genre?.posGenre?.id, // posのGenreIdを指定
        title: genre.display_name,
        imageUrl: genre.single_genre_image,
      };
    });

  // レスポンシブ対応
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));

  let gridSize = 2;
  if (isXs) gridSize = 12;
  else if (isSm) gridSize = 6;
  else if (isMd) gridSize = 4;
  else if (isLg) gridSize = 3;

  return (
    <ContainerLayout title="ジャンルを選択してください">
      <Grid container spacing={2}>
        {isLoading ? (
          <Grid item xs={12}>
            <Box>
              <CircularProgress />
            </Box>
          </Grid>
        ) : (
          genres?.map((genre) => (
            <Grid item xs={gridSize} key={genre.id}>
              <Box
                onClick={() => onSelect(genre.id?.toString() ?? '')}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid',
                  borderRadius: '8px',
                  p: 2,
                  boxShadow: 3,
                  height: '140px',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={5}>
                    {genre.imageUrl ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Image
                          src={genre.imageUrl}
                          alt={genre.title}
                          width={120 * 0.71}
                          height={120}
                        />
                      </Box>
                    ) : (
                      <NoImg height={300} width={300 * 0.71} />
                    )}
                  </Grid>
                  <Grid item xs={7}>
                    <Typography sx={{ whiteSpace: 'normal' }}>
                      {genre.title}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          ))
        )}
      </Grid>
    </ContainerLayout>
  );
}
