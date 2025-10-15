import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useCallback, useMemo } from 'react';

export interface CategoryGenreList {
  genreId: number | null;
  categoryId: number | null;
  conditionOptionId: number | null;
  specialtyId: number | null;
  noSpecialty: boolean | null;
  limitCount: number | null;
}
export const useAllowedGenreCategories = () => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);

  const fetchAllowedGenreCategories = useCallback(async () => {
    try {
      const res = await clientAPI.store.getTabletAllowedGenresCategories({
        storeID: store.id,
      });

      console.log(res);

      return res;
    } catch (e) {
      handleError(e);
      return;
    }
  }, [clientAPI.store, store.id]);

  const updateAllowedGenreCategories = useCallback(
    async ({
      allowedGenreCategories,
    }: {
      allowedGenreCategories: CategoryGenreList[];
    }): Promise<{ ok: boolean }> => {
      try {
        const res = await clientAPI.store.setTabletAllowedGenresCategories({
          storeID: store.id,
          allowedGenresCategories: allowedGenreCategories.map(
            (categoryGenre) => ({
              categoryId: categoryGenre.categoryId ?? 0,
              genreId: categoryGenre.genreId ?? 0,
              conditionOptionId: categoryGenre.conditionOptionId ?? null,
              specialtyId: categoryGenre.specialtyId ?? null,
              noSpecialty: categoryGenre.noSpecialty ?? false,
              limitCount: categoryGenre.limitCount ?? 0,
            }),
          ),
        });

        if (res instanceof CustomError) {
          throw res;
        }
        return { ok: true };
      } catch (e) {
        handleError(e);
        return { ok: false };
      }
    },
    [clientAPI.store, store.id],
  );

  return {
    fetchAllowedGenreCategories,
    updateAllowedGenreCategories,
  };
};
