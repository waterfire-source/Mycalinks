import { customFetch, METHOD } from '@/api/implement';
import { CategoryAPI } from '@/api/frontend/category/api';
import { createOrUpdateItemCategoryDef } from '@/app/api/store/[store_id]/item/def';

export const categoryImplement = () => {
  return {
    getCategoryAll: async (
      request: CategoryAPI['getCategoryAll']['request'],
    ): Promise<CategoryAPI['getCategoryAll']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/item/category`,
      })();
    },
    createCategory: async (
      request: CategoryAPI['createCategory']['request'],
    ): Promise<CategoryAPI['createCategory']['response']> => {
      const body: (typeof createOrUpdateItemCategoryDef.request)['body'] = {
        id: undefined,
        display_name: request.displayName,
        hidden: false,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/category`,
        body,
      })();
    },
    updateCategory: async (
      request: CategoryAPI['updateCategory']['request'],
    ): Promise<CategoryAPI['updateCategory']['response']> => {
      const body: typeof createOrUpdateItemCategoryDef.request.body = {
        id: request.id,
        display_name: request.displayName,
        hidden: request.hidden,
        order_number: request.orderNumber,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/category`,
        body,
      })();
    },
    deleteCategory: async (
      request: CategoryAPI['deleteCategory']['request'],
    ): Promise<CategoryAPI['deleteCategory']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeID}/item/category/${request.categoryID}`,
      })();
    },
  };
};
