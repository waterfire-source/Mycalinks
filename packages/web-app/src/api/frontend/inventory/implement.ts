import { InventoryAPI } from '@/api/frontend/inventory/api';
import { customFetch, METHOD } from '@/api/implement';
import { createOrUpdateInventoryDef } from '@/app/api/store/[store_id]/inventory/def';

export const inventoryImplement = () => {
  return {
    create: async (
      request: InventoryAPI['create']['request'],
    ): Promise<InventoryAPI['create']['response']> => {
      const body: typeof createOrUpdateInventoryDef.request.body = {
        id: undefined,
        item_category_ids: request.itemCategoryIds.map((id) => ({ id: id })),
        item_genre_ids: request.itemGenreIds.map((id) => ({ id: id })),
        title: request.title,
        products: request.products?.map((product) => ({
          shelf_id: product.shelfId,
          product_id: product.productId,
          staff_account_id: product.staffAccountId,
          item_count: product.itemCount,
        })), // undefinedを渡せるので型定義書の変更が必要
        additional_products: request.additionalProducts?.map((product) => ({
          shelf_id: product.shelfId,
          product_id: product.productId,
          staff_account_id: product.staffAccountId,
          item_count: product.itemCount,
        })), // undefinedを渡せるので型定義書の変更が必要
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/inventory`,
        body,
      })();
    },

    update: async (
      request: InventoryAPI['update']['request'],
    ): Promise<InventoryAPI['update']['response']> => {
      const body: typeof createOrUpdateInventoryDef.request.body = {
        id: request.id,
        products: request.products?.map((product) => ({
          shelf_id: product.shelfId,
          product_id: product.productId,
          staff_account_id: product.staffAccountId,
          item_count: product.itemCount,
        })), // undefinedを渡せるので型定義書の変更が必要
        additional_products: request.additionalProducts?.map((product) => ({
          shelf_id: product.shelfId,
          product_id: product.productId,
          staff_account_id: product.staffAccountId,
          item_count: product.itemCount,
        })), // undefinedを渡せるので型定義書の変更が必要
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/inventory`,
        body,
      })();
    },

    getInventories: async (
      request: InventoryAPI['getInventories']['request'],
    ): Promise<InventoryAPI['getInventories']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/inventory`,
        params: {
          id: request.id,
          status: request.status,
        },
      })();
    },

    deleteInventory: async (
      request: InventoryAPI['deleteInventory']['request'],
    ): Promise<InventoryAPI['deleteInventory']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeID}/inventory/${request.inventoryID}`,
      })();
    },

    applyInventory: async (
      request: InventoryAPI['applyInventory']['request'],
    ): Promise<InventoryAPI['applyInventory']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/inventory/${request.inventoryID}/apply`,
        body: {
          adjust: request.adjust,
        },
      })();
    },

    createOrUpdateShelf: async (
      request: InventoryAPI['createOrUpdateShelf']['request'],
    ): Promise<InventoryAPI['createOrUpdateShelf']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/inventory/shelf`,
        body: {
          id: request.id,
          display_name: request.display_name,
          order_number: request.order_number,
        },
      })();
    },

    getShelfs: async (
      request: InventoryAPI['getShelfs']['request'],
    ): Promise<InventoryAPI['getShelfs']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/inventory/shelf`,
        params: {
          id: request.id,
        },
      })();
    },

    deleteShelf: async (
      request: InventoryAPI['deleteShelf']['request'],
    ): Promise<InventoryAPI['deleteShelf']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeID}/inventory/shelf/${request.shelfID}`,
      })();
    },
  };
};
