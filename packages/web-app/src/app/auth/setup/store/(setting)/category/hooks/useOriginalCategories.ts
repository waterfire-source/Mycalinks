import { useState } from 'react';

export interface OriginalCategory {
  index: number;
  name: string;
  hasCondition: boolean;
  conditions?: OriginalCategoryCondition[];
}

export interface OriginalCategoryCondition {
  index: number;
  name: string;
  sellPercent: number;
  buyPercent: number;
}

export const useOriginalCategories = () => {
  const [originalCategories, setOriginalCategories] = useState<
    OriginalCategory[]
  >([]);
  // カテゴリを追加
  const addOriginalCategory = () => {
    setOriginalCategories([
      ...originalCategories,
      {
        index: originalCategories.length,
        name: '',
        hasCondition: false,
        conditions: [],
      },
    ]);
  };
  // カテゴリを削除
  const deleteOriginalCategory = (index: number) => {
    setOriginalCategories(originalCategories.filter((_, i) => i !== index));
  };
  // カテゴリの表示名を変更
  const updateOriginalCategoryName = (index: number, name: string) => {
    setOriginalCategories(
      originalCategories.map((c, i) => (i === index ? { ...c, name } : c)),
    );
  };
  // カテゴリの状態を持つかを変更
  const toggleOriginalCategoryCondition = (index: number) => {
    setOriginalCategories(
      originalCategories.map((c, i) =>
        i === index ? { ...c, hasCondition: !c.hasCondition } : c,
      ),
    );
  };
  // カテゴリの状態を追加
  const addOriginalCategoryCondition = (index: number) => {
    setOriginalCategories(
      originalCategories.map((c, i) =>
        i === index
          ? {
              ...c,
              conditions: [
                ...(c.conditions || []),
                {
                  index: c.conditions?.length || 0,
                  name: '',
                  sellPercent: 0,
                  buyPercent: 0,
                },
              ],
            }
          : c,
      ),
    );
  };
  // カテゴリの状態を削除
  const deleteOriginalCategoryCondition = (
    index: number,
    conditionIndex: number,
  ) => {
    setOriginalCategories(
      originalCategories.map((c, i) =>
        i === index
          ? {
              ...c,
              conditions: c.conditions?.filter((_, i) => i !== conditionIndex),
            }
          : c,
      ),
    );
  };
  // カテゴリの状態を更新
  const updateOriginalCategoryCondition = (
    index: number,
    conditionIndex: number,
    content: 'name' | 'sellPercent' | 'buyPercent',
    value: string | number,
  ) => {
    setOriginalCategories(
      originalCategories.map((c, i) =>
        i === index
          ? {
              ...c,
              conditions: c.conditions?.map((c, i) =>
                i === conditionIndex ? { ...c, [content]: value } : c,
              ),
            }
          : c,
      ),
    );
  };
  return {
    originalCategories,
    setOriginalCategories,
  };
};
