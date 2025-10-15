import { CategoryAPIRes } from '@/api/frontend/category/api';
import { useAlert } from '@/contexts/AlertContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ItemCategoryHandle } from '@prisma/client';
import { useCallback, useState } from 'react';

export const useGetCardCategory = () => {
  const { setAlertState } = useAlert();
  const { category: categories, fetchCategoryList } = useCategory();
  const [cardCategory, setCardCategory] =
    useState<CategoryAPIRes['getCategoryAll']['itemCategories'][0]>();

  const fetchCardCategory = useCallback(async () => {
    await fetchCategoryList();
    if (!categories) return;
    const cardCategoryRes = categories?.itemCategories.find(
      (category) => category.handle === ItemCategoryHandle.CARD,
    );
    if (!cardCategoryRes) {
      setAlertState({
        message: 'カードカテゴリーが見つかりませんでした',
        severity: 'error',
      });
      return;
    }
    setCardCategory(cardCategoryRes);
  }, [fetchCategoryList, setAlertState]);

  return {
    cardCategory,
    fetchCardCategory,
  };
};
