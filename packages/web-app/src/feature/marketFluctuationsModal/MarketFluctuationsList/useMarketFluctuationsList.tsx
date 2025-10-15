import { useEffect, SetStateAction, Dispatch } from 'react';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { SearchParams } from '@/feature/marketFluctuationsModal/type';

interface MarketFluctuationsModalProps {
  setSearchParams: Dispatch<SetStateAction<SearchParams>>;
}

export const useMarketFluctuationsList = ({
  setSearchParams,
}: MarketFluctuationsModalProps) => {
  // ジャンル一覧取得
  const { genre, fetchGenreList } = useGenre();
  useEffect(() => {
    fetchGenreList();
  }, [fetchGenreList]);

  // ------------------------------------------
  // タブ
  // ------------------------------------------
  // タブが切り替わった際の処理
  const handleTabChange = (value: string) => {
    const newSearchGenreId: number | undefined =
      value !== 'all' ? Number(value) : undefined;
    setSearchParams((prev) => ({
      ...prev,
      genreId: newSearchGenreId,
    }));
  };

  // ------------------------------------------
  // フィルター
  // ------------------------------------------
  // const handleCategoryFilter = (categoryDisplayName: string) => {
  //   const categoryId = category?.itemCategories?.find(
  //     (category) => category.display_name === categoryDisplayName,
  //   )?.id;
  //   if (categoryId) {
  //     setSearchParams((prev) => ({ ...prev, categoryId }));
  //   } else {
  //     setSearchParams((prev) => ({ ...prev, categoryId: undefined }));
  //   }
  // };

  // ------------------------------------------
  // サーバーソート
  // ------------------------------------------
  const handleSort = (
    direction: 'asc' | 'desc' | undefined,
    sortBy: string,
  ) => {
    setSearchParams((prev) => {
      if (direction === undefined) {
        const { orderBy, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        orderBy: `${direction === 'desc' ? '-' : ''}${sortBy}`,
      };
    });
  };

  return { genre, handleTabChange, handleSort };
};
