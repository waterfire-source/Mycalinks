import { prefectures } from '@/constants/prefectures';

/**
 * 都道府県IDから都道府県名を取得する
 * @param id 都道府県ID
 * @returns 都道府県名（見つからない場合はundefined）
 */
export const getPrefectureName = (
  id: number | undefined,
): string | undefined => {
  if (!id) return undefined;
  return prefectures.find((prefecture) => prefecture.id === id)?.name;
};
