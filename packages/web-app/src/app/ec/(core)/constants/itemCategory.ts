import { ItemCategoryHandle } from '@prisma/client';

// カテゴリ
export const itemCategory = [
  {
    label: 'カード',
    value: ItemCategoryHandle.CARD,
  },
  {
    label: 'ボックス',
    value: ItemCategoryHandle.BOX,
  },
];
