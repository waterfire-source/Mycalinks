import { MycaAppAPI } from '@/api/frontend/mycaApp/api';
import { appCustomFetch, customFetch, METHOD } from '@/api/implement';

//MycaアプリのAPIなど
export const mycaAppImplement = () => {
  return {
    /**
     * Mycaアプリのitemsを条件をつけて取得する関数
     * @param request -
     * @returns - itemsの結果 POS上の商品マスタに結びついていたらそのIDも格納される
     */
    getItem: async (
      request: MycaAppAPI['getItem']['request'],
    ): Promise<MycaAppAPI['getItem']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.params.store_id}/myca-item`,
        params: request.query,
      })();
    },

    /**
     * Mycaアプリのジャンルを取得する関数
     * @returns - ジャンル情報
     */
    getGenres: async (): Promise<MycaAppAPI['getGenres']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `${process.env.NEXT_PUBLIC_MYCA_APP_API_URL}/item/genre`,
        params: {
          version: process.env.NEXT_PUBLIC_MYCA_APP_VERSION,
        },
      })();
    },
    /**
     * Mycaアプリのジャンルを取得する関数
     * @returns - ジャンル情報
     */
    getGenresByParentID: async (): Promise<
      MycaAppAPI['getGenres']['response']
    > => {
      return await customFetch({
        method: METHOD.GET,
        url: `${process.env.NEXT_PUBLIC_MYCA_APP_API_URL}/item/genre/`,
        params: {
          version: process.env.NEXT_PUBLIC_MYCA_APP_VERSION,
        },
      })();
    },
    uploadImage: async (
      request: MycaAppAPI['uploadImage']['request'],
    ): Promise<MycaAppAPI['uploadImage']['response']> => {
      return await appCustomFetch(
        {
          method: METHOD.POST,
          url: `/user/image/`,
          body: request.body.file,
        },
        'MYCA_APP_API',
        undefined,
        true,
      );
    },
  };
};
