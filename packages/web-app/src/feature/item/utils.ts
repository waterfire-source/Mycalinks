import { ItemCategoryHandle } from '@prisma/client';

// 発注や買取などで選択肢として選ばない必ず自身の店舗で作成するはずの商品のカテゴリーの種類(販売ではこれらが選択される)
export const isOriginalProductCategory = (
  categoryHandle: ItemCategoryHandle | null,
) => {
  return (
    categoryHandle === ItemCategoryHandle.LUCKY_BAG ||
    categoryHandle === ItemCategoryHandle.ORIGINAL_PACK ||
    categoryHandle === ItemCategoryHandle.DECK ||
    categoryHandle === ItemCategoryHandle.BUNDLE
  );
};
