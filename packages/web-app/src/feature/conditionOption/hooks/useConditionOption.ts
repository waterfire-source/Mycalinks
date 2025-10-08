import { useCallback } from 'react';

import { CustomError } from '@/api/implement';
import { ConditionOptionAPI } from '@/api/frontend/conditionOption/api';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { ItemCategoryHandle } from '@prisma/client';
import { ApiError, MycaPosApiClient } from 'api-generator/client';

export const useConditionOption = () => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const client = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const createConditionOption = useCallback(
    async (
      request: Omit<
        ConditionOptionAPI['createConditionOption']['request'],
        'storeId' | 'itemCategoryId'
      >,
    ) => {
      const category = await client.item.getItemCategory({
        storeId: store.id,
      });
      if (category instanceof CustomError) {
        setAlertState({
          message: `${category.status}:${category.message}`,
          severity: 'error',
        });
        throw category;
      }
      const cardCategoryRes = category?.itemCategories.find(
        (category) => category.handle === ItemCategoryHandle.CARD,
      );
      if (!cardCategoryRes?.id) {
        setAlertState({
          message: 'カードカテゴリが見つかりません',
          severity: 'error',
        });
        throw new Error('カードカテゴリが見つかりません');
      }
      const response = await client.item.createOrUpdateConditionOption({
        storeId: store.id,
        itemCategoryId: cardCategoryRes.id,
        requestBody: {
          display_name: request.displayName,
          handle: request.handle,
          description: request.description,
          order_number: request.orderNumber,
          rate_variants: request.rateVariants.map((variant) => ({
            group_id: variant.groupId,
            genre_id: variant.genreId,
            auto_sell_price_adjustment: variant.autoSellPriceAdjustment,
            auto_buy_price_adjustment: variant.autoBuyPriceAdjustment,
          })),
        },
      });
      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        throw response;
      }
      setAlertState({
        message:
          '状態の作成を開始しました。反映にお時間がかかる場合がございます',
        severity: 'success',
      });
    },
    [client.item, store.id, setAlertState],
  );

  // 取得してきたcategoryもったいないのでここでupdateも定義
  const updateConditionOption = useCallback(
    async (
      request: Omit<
        ConditionOptionAPI['updateConditionOption']['request'],
        'storeId' | 'itemCategoryId' | 'conditionOptionId'
      >,
    ) => {
      const category = await client.item.getItemCategory({
        storeId: store.id,
      });
      if (category instanceof CustomError) {
        setAlertState({
          message: `${category.status}:${category.message}`,
          severity: 'error',
        });
        throw category;
      }
      const cardCategoryRes = category?.itemCategories.find(
        (category) => category.handle === ItemCategoryHandle.CARD,
      );
      const response = await client.item.createOrUpdateConditionOption({
        storeId: store.id,
        itemCategoryId: cardCategoryRes?.id ?? 3,
        requestBody: {
          id: request.id,
          display_name: request.displayName,
          handle: request.handle,
          description: request.description,
          order_number: request.orderNumber,
          rate_variants: request.rateVariants?.map((variant) => ({
            group_id: variant.groupId,
            genre_id: variant.genreId,
            auto_sell_price_adjustment: variant.autoSellPriceAdjustment,
            auto_buy_price_adjustment: variant.autoBuyPriceAdjustment,
          })),
        },
      });
      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        throw response;
      }
      setAlertState({
        message: '状態設定を更新しました',
        severity: 'success',
      });
    },
    [client.item, setAlertState, store.id],
  );

  const deleteConditionOption = useCallback(
    async (
      request: Omit<
        ConditionOptionAPI['deleteConditionOption']['request'],
        'storeId' | 'itemCategoryId'
      >,
    ) => {
      try {
        const category = await client.item.getItemCategory({
          storeId: store.id,
        });
        const cardCategoryRes = category?.itemCategories.find(
          (category) => category.handle === ItemCategoryHandle.CARD,
        );
        if (!cardCategoryRes?.id) {
          throw new Error('カードカテゴリが見つかりません');
        }
        await client.item.deleteConditionOption({
          storeId: store.id,
          itemCategoryId: cardCategoryRes?.id,
          conditionOptionId: request.id,
        });
        setAlertState({
          message: '状態設定を削除しました',
          severity: 'success',
        });
      } catch (error) {
        if (error instanceof ApiError) {
          const errorMessage =
            typeof error.body === 'object' && error.body?.error
              ? error.body.error
              : `${error.status}: ${error.message}`;

          setAlertState({
            message: errorMessage,
            severity: 'error',
          });
        } else if (error instanceof Error) {
          setAlertState({
            message: error.message,
            severity: 'error',
          });
        } else {
          setAlertState({
            message: '予期せぬエラーが発生しました: ' + String(error),
            severity: 'error',
          });
        }
        throw error;
      }
    },
    [client.item, setAlertState, store.id],
  );

  return {
    createConditionOption,
    updateConditionOption,
    deleteConditionOption,
  };
};
