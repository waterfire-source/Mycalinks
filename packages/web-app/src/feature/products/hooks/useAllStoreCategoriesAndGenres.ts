import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStores } from '@/app/hooks/useStores';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export const useAllStoreCategoriesAndGenres = () => {
  const { stores, fetchStores } = useStores();
  const [allGenres, setAllGenres] = useState<FilterOption[]>([]);
  const [allCategories, setAllCategories] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(false);
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  // 全店舗のカテゴリとジャンルを取得する
  const fetchAllStoreCategoriesAndGenres = useCallback(async () => {
    if (stores.length === 0) return;

    setLoading(true);
    try {
      const genresSet = new Set<string>();
      const categoriesSet = new Set<string>();

      // 各店舗のカテゴリとジャンル情報を取得
      await Promise.all(
        stores.map(async (store) => {
          try {
            // カテゴリ情報を取得
            const categoryRes = await clientAPI.category.getCategoryAll({
              storeID: store.id,
            });

            if (!(categoryRes instanceof CustomError)) {
              // カテゴリ名を収集
              categoryRes.itemCategories.forEach((category) => {
                if (!category.hidden) {
                  categoriesSet.add(category.display_name);
                }
              });
            }

            // ジャンル情報を取得
            const genreRes = await clientAPI.genre.getGenreAll({
              storeID: store.id,
            });

            if (!(genreRes instanceof CustomError)) {
              // ジャンル名を収集
              genreRes.itemGenres.forEach((genre) => {
                if (!genre.hidden) {
                  genresSet.add(genre.display_name);
                }
              });
            }
          } catch (error) {
            console.error(`Failed to fetch categories/genres for store ${store.id}:`, error);
          }
        })
      );

      // FilterOption形式に変換
      const genres: FilterOption[] = Array.from(genresSet)
        .sort()
        .map((name) => ({
          value: name,
          label: name,
        }));

      const categories: FilterOption[] = Array.from(categoriesSet)
        .sort()
        .map((name) => ({
          value: name,
          label: name,
        }));

      setAllGenres(genres);
      setAllCategories(categories);
    } catch (error) {
      setAlertState({
        message: 'カテゴリ・ジャンル情報の取得に失敗しました',
        severity: 'error',
      });
      console.error('Failed to fetch all store categories and genres:', error);
    } finally {
      setLoading(false);
    }
  }, [stores, clientAPI.category, clientAPI.genre, setAlertState]);

  // 店舗データ取得
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // 店舗データが取得できたらカテゴリ・ジャンル情報を取得
  useEffect(() => {
    if (stores.length > 0) {
      fetchAllStoreCategoriesAndGenres();
    }
  }, [stores.length]);

  return {
    allGenres,
    allCategories,
    loading,
    refetch: fetchAllStoreCategoriesAndGenres,
  };
};