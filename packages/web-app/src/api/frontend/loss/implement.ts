import { LossAPI } from '@/api/frontend/loss/api';
import { customFetch, METHOD } from '@/api/implement';
import { BackendLossAPI } from '@/app/api/store/[store_id]/loss/api';

export const lossImplement = () => {
  return {
    //loss登録
    createLoss: async (
      request: LossAPI['createLoss']['request'],
    ): Promise<LossAPI['createLoss']['response']> => {
      const products: BackendLossAPI[0]['request']['body']['products'] =
        request.products.map((product) => {
          const productPayload: BackendLossAPI[0]['request']['body']['products'][0] =
            {
              product_id: product.productId,
              item_count: product.itemCount,
              specificWholesalePrice: product.specificWholesalePrice,
            };
          return productPayload;
        });
      const body: BackendLossAPI[0]['request']['body'] = {
        reason: request.reason,
        datetime: request.datetime,
        loss_genre_id: request.lossGenreId,
        products,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/loss`,
        body: body,
      })();
    },

    //loss区分登録
    createLossGenre: async (
      request: LossAPI['createLossGenre']['request'],
    ): Promise<LossAPI['createLossGenre']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/loss/genre`,
        body: {
          display_name: request.display_name,
        },
      })();
    },

    updateLossGenre: async (
      request: LossAPI['updateLossGenre']['request'],
    ): Promise<LossAPI['updateLossGenre']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/loss/genre`,
        body: {
          id: request.id,
          display_name: request.display_name,
        },
      })();
    },

    //loss一覧取得
    getItems: async (
      request: LossAPI['getItems']['request'],
    ): Promise<LossAPI['getItems']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/loss`,
      })();
    },

    //loss一覧取得(絞り込み, 並び替え対応)
    getLossProducts: async (
      request: LossAPI['getLossProducts']['request'],
    ): Promise<LossAPI['getLossProducts']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/product/loss`,
        params: {
          loss_genre_id: request.loss_genre_id,
          staff_account_id: request.staff_account_id,
          orderBy: request.orderBy ? request.orderBy.join(',') : undefined, // `orderBy` をカンマ区切り文字列に変換
        },
      })();
    },

    //loss区分一覧取得
    getLossGenres: async (
      request: LossAPI['getLossGenres']['request'],
    ): Promise<LossAPI['getLossGenres']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/loss/genre`,
      })();
    },

    //loss区分削除
    deleteLossGenre: async (
      request: LossAPI['deleteLossGenre']['request'],
    ): Promise<LossAPI['deleteLossGenre']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.store_id}/loss/genre/${request.id}`,
      })();
    },
  };
};
