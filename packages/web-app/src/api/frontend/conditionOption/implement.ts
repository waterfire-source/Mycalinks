import { createOrUpdateConditionOptionDef } from '@/app/api/store/[store_id]/item/def';
import { customFetch, METHOD } from '@/api/implement';
import { ConditionOptionAPI } from '@/api/frontend/conditionOption/api';

export const conditionOptionImplement = () => {
  return {
    createConditionOption: async (
      request: ConditionOptionAPI['createConditionOption']['request'],
    ): Promise<ConditionOptionAPI['createConditionOption']['response']> => {
      const body: (typeof createOrUpdateConditionOptionDef)['request']['body'] =
        {
          id: undefined,
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
        };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/item/category/${request.itemCategoryId}/condition-option`,
        body,
      })();
    },
    updateConditionOption: async (
      request: ConditionOptionAPI['updateConditionOption']['request'],
    ): Promise<ConditionOptionAPI['updateConditionOption']['response']> => {
      const body: (typeof createOrUpdateConditionOptionDef)['request']['body'] =
        {
          id: request.id,
          display_name: request.displayName,
          handle: request.handle,
          order_number: request.orderNumber,
          description: request.description,
          rate_variants: request.rateVariants?.map((variant) => ({
            group_id: variant.groupId,
            genre_id: variant.genreId,
            auto_sell_price_adjustment: variant.autoSellPriceAdjustment,
            auto_buy_price_adjustment: variant.autoBuyPriceAdjustment,
          })),
        };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/item/category/${request.itemCategoryId}/condition-option`,
        body,
      })();
    },
    deleteConditionOption: async (
      request: ConditionOptionAPI['deleteConditionOption']['request'],
    ): Promise<ConditionOptionAPI['deleteConditionOption']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeId}/item/category/${request.itemCategoryId}/condition-option/${request.id}`,
      })();
    },
  };
};
