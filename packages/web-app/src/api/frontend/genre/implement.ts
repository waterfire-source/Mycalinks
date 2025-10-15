import { customFetch, METHOD } from '@/api/implement';
import { GenreAPI } from '@/api/frontend/genre/api';
import {
  createItemGenreDef,
  getItemGenreDef,
  updateItemGenreDef,
} from '@/app/api/store/[store_id]/item/def';

export const genreImplement = () => {
  return {
    getGenreAll: async (
      request: GenreAPI['getGenreAll']['request'],
    ): Promise<GenreAPI['getGenreAll']['response']> => {
      const params: typeof getItemGenreDef.request.query = {
        fromTablet: request.fromTablet === true ? true : undefined,
      };
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/item/genre`,
        params,
      })();
    },

    createGenre: async (
      request: GenreAPI['createGenre']['request'],
    ): Promise<GenreAPI['createGenre']['response']> => {
      const body: typeof createItemGenreDef.request.body = {
        display_name: request.displayName,
        myca_genre_id: undefined,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/genre`,
        body,
      })();
    },

    createMycaGenre: async (
      request: GenreAPI['createMycaGenre']['request'],
    ): Promise<GenreAPI['createMycaGenre']['response']> => {
      const body: typeof createItemGenreDef.request.body = {
        myca_genre_id: request.mycaGenreID,
        display_name: undefined,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/genre`,
        body,
      })();
    },

    getAppGenreAll: async (
      request: GenreAPI['getAppGenreAll']['request'],
    ): Promise<GenreAPI['getAppGenreAll']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/myca-item/genre`,
      })();
    },

    updateGenre: async (
      request: GenreAPI['updateGenre']['request'],
    ): Promise<GenreAPI['updateGenre']['response']> => {
      const body: typeof updateItemGenreDef.request.body = {
        display_name: request.displayName,
        hidden: request.hidden,
        deleted: request.deleted,
        auto_update: request.autoUpdate,
        order_number: request.order_number,
      };
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeID}/item/genre/${request.itemGenreID}`,
        body,
      })();
    },
  };
};
