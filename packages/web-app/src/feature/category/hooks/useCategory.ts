import { CategoryAPIRes } from '@/api/frontend/category/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import {
  Condition_Option_Rate,
  Item_Category,
  Item_Category_Condition_Option,
  Item_Group,
} from 'backend-core';
import { useCallback, useMemo, useState } from 'react';

export type Categories = {
  itemCategories: Array<
    Item_Category & {
      condition_options: Array<
        Item_Category_Condition_Option & {
          _count: {
            products: number;
          };
          rate_variants: Array<Condition_Option_Rate>;
        }
      >;
      groups: Array<Item_Group>;
    }
  >;
};

export const useCategory = (
  isShowHidden: boolean = false,
  ecAvailable: boolean = false,
) => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const { store } = useStore();
  const [category, setCategory] = useState<CategoryAPIRes['getCategoryAll']>();
  const [isFetching, setIsFetching] = useState(false);

  //カテゴリの取得
  const fetchCategoryList = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await clientAPI.category.getCategoryAll({
        storeID: store.id,
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      let visibleCategories = res;
      if (!isShowHidden) {
        visibleCategories = {
          ...res,
          itemCategories: res.itemCategories.filter(
            (category) => !category.hidden,
          ),
        };
      }

      if (ecAvailable) {
        visibleCategories.itemCategories =
          visibleCategories.itemCategories.filter(
            (category) => category.ec_enabled,
          );
      }

      setCategory(visibleCategories);

      return visibleCategories;
    } catch (error) {
      setAlertState({
        message: 'カテゴリの取得に失敗しました',
        severity: 'error',
      });
    } finally {
      setIsFetching(false);
    }
  }, [clientAPI.category, setAlertState, store.id]);

  const cardConditionOptions = useMemo(() => {
    if (!category) return;
    return category.itemCategories.find(
      (category) => category.handle === 'CARD',
    )?.condition_options;
  }, [category]);

  // 状態の種類
  const conditionOptionsWithCategory = useMemo(() => {
    if (!category) return [];
    const displayNames =
      category.itemCategories?.flatMap(
        (item) =>
          item.condition_options?.map((condition) => condition.display_name) ??
          [],
      ) ?? [];

    return [...new Set(displayNames)];
  }, [category]);

  // カテゴリを作成する
  const createCategory = useCallback(
    async ({
      displayName,
      hidden,
    }: {
      id?: number;
      displayName: string;
      hidden?: boolean;
    }) => {
      if (!store?.id) return null;

      try {
        const res = await clientAPI.category.createCategory({
          storeID: store.id,
          displayName,
          hidden,
        });

        if (res instanceof CustomError) {
          setAlertState({
            message: `${res.status}: ${
              res.message || 'カテゴリの作成に失敗しました'
            }`,
            severity: 'error',
          });
          return null;
        }
        return res;
      } catch (error) {
        setAlertState({
          message:
            error instanceof Error
              ? error.message
              : 'カテゴリの作成に失敗しました',
          severity: 'error',
        });
        return null;
      }
    },
    [clientAPI.category, setAlertState, store?.id],
  );

  // カテゴリを更新する
  const updateCategory = useCallback(
    async ({
      id,
      displayName,
      hidden,
      orderNumber,
    }: {
      id: number;
      displayName?: string;
      hidden?: boolean;
      orderNumber?: number;
    }) => {
      if (!store?.id) return null;

      try {
        const res = await clientAPI.category.updateCategory({
          storeID: store.id,
          id: id,
          displayName,
          hidden,
          orderNumber,
        });

        if (res instanceof CustomError) {
          setAlertState({
            message: `${res.status}: ${
              res.message || 'カテゴリの更新に失敗しました'
            }`,
            severity: 'error',
          });
          return null;
        }
        return res;
      } catch (error) {
        setAlertState({
          message:
            error instanceof Error
              ? error.message
              : 'カテゴリの更新に失敗しました',
          severity: 'error',
        });
        return null;
      }
    },
    [clientAPI.category, setAlertState, store?.id],
  );

  // カテゴリを削除する
  const deleteCategory = useCallback(
    async (categoryId: number) => {
      if (!store?.id) return null;

      try {
        const res = await clientAPI.category.deleteCategory({
          storeID: store.id,
          categoryID: categoryId,
        });

        if (res instanceof CustomError) {
          setAlertState({
            message: `${res.status}: ${
              res.message || 'カテゴリの削除に失敗しました'
            }`,
            severity: 'error',
          });
          return null;
        }
        return res;
      } catch (error) {
        setAlertState({
          message:
            error instanceof Error
              ? error.message
              : 'カテゴリの削除に失敗しました',
          severity: 'error',
        });
        return null;
      }
    },
    [clientAPI.category, setAlertState, store?.id],
  );

  return {
    category,
    isFetching,
    setCategory,
    cardConditionOptions,
    conditionOptionsWithCategory,
    fetchCategoryList,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
