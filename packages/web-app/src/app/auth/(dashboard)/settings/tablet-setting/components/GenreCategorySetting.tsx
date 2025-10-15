import { CustomError } from '@/api/implement';
import { CategoryGenreSelect } from '@/app/auth/(dashboard)/settings/tablet-setting/components/CategoryGenreSelect';
import {
  CategoryGenreList,
  useAllowedGenreCategories,
} from '@/app/auth/(dashboard)/settings/tablet-setting/hooks/useAllowedGenreCategories';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useAlert } from '@/contexts/AlertContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { palette } from '@/theme/palette';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

export const GenreCategorySetting = () => {
  const { genre: genreList, fetchGenreList } = useGenre();
  useEffect(() => {
    fetchGenreList();
  }, [fetchGenreList]);
  const { category: categoryList, fetchCategoryList } = useCategory();
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);
  const [allowedGenreCategories, setAllowedGenreCategories] = useState<
    CategoryGenreList[]
  >([
    {
      genreId: null,
      categoryId: null,
      conditionOptionId: null,
      specialtyId: null,
      noSpecialty: false,
      limitCount: null,
    },
  ]);
  const { setAlertState } = useAlert();
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const { fetchAllowedGenreCategories, updateAllowedGenreCategories } =
    useAllowedGenreCategories();
  const fetch = useCallback(async () => {
    try {
      setIsFetchLoading(true);
      const res = await fetchAllowedGenreCategories();
      if (res instanceof CustomError) {
        throw res;
      }

      setAllowedGenreCategories(
        res?.tabletAllowedGenresCategories.map((categoryGenre) => ({
          categoryId: categoryGenre.item_category_id,
          genreId: categoryGenre.item_genre_id,
          conditionOptionId: categoryGenre.condition_option_id,
          specialtyId: categoryGenre.specialty_id,
          noSpecialty: categoryGenre.no_specialty,
          limitCount: categoryGenre.limit_count,
        })) ?? [
          {
            genreId: null,
            categoryId: null,
            conditionOptionId: null,
            specialtyId: null,
            noSpecialty: false,
            limitCount: null,
          },
        ],
      );
    } catch (error) {
      console.error(error);
      setAlertState({
        message: '表示設定の取得に失敗しました',
        severity: 'error',
      });
    } finally {
      setIsFetchLoading(false);
    }
  }, [fetchAllowedGenreCategories, setAlertState]);
  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleUpdate = async () => {
    if (
      allowedGenreCategories.some(
        (categoryGenre) =>
          categoryGenre.categoryId === null || categoryGenre.genreId === null,
      )
    ) {
      setAlertState({
        message: 'カテゴリとジャンルが選択されていません',
        severity: 'error',
      });
      return;
    }
    try {
      setIsUpdateLoading(true);
      const res = await updateAllowedGenreCategories({
        allowedGenreCategories,
      });
      if (!res.ok)
        return setAlertState({
          message: '表示設定の更新に失敗しました',
          severity: 'error',
        });

      setAlertState({
        message: '表示設定を更新しました',
        severity: 'success',
      });
    } finally {
      setIsUpdateLoading(false);
    }
  };

  return (
    <Stack gap={2}>
      <Typography variant="h4">表示ジャンル・カテゴリ設定</Typography>
      <Stack
        sx={{
          backgroundColor: palette.common.white,
          width: '100%',
          p: 4,
          gap: 2,
        }}
      >
        <Stack direction="row" gap={2} sx={{ alignItems: 'center' }}>
          <Typography variant="body1">
            {allowedGenreCategories.length}項目表示中
          </Typography>
          <SecondaryButton
            sx={{ width: '120px' }}
            onClick={() =>
              setAllowedGenreCategories((prev) => [
                ...prev,
                {
                  genreId: null,
                  categoryId: null,
                  conditionOptionId: null,
                  specialtyId: null,
                  noSpecialty: false,
                  limitCount: null,
                },
              ])
            }
          >
            項目を追加
          </SecondaryButton>
          <PrimaryButton
            sx={{ width: '120px' }}
            onClick={handleUpdate}
            loading={isUpdateLoading}
          >
            更新
          </PrimaryButton>
        </Stack>
        <Stack sx={{ gap: 3, width: 'fit-content' }}>
          <Stack gap={2}>
            {isFetchLoading ? (
              <CircularProgress />
            ) : (
              allowedGenreCategories.map((categoryGenre, index) => (
                <CategoryGenreSelect
                  key={index}
                  index={index}
                  categoryList={categoryList?.itemCategories ?? []}
                  genreList={genreList?.itemGenres ?? []}
                  categoryGenre={categoryGenre}
                  setAllowedGenreCategories={setAllowedGenreCategories}
                />
              ))
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
