import { apiMethod, apiRole, Required } from '@/api/backendApi/main';
import { MycaAppGenre } from 'backend-core';
import { Item_Genre, Store } from '@prisma/client';

/**
 * @deprecated - この古いAPIは非推奨です。api-generatorパッケージの getAppGenreWithPosGenreApi を使用してください。
 *
 * import { getAppGenreWithPosGenreApi } from 'api-generator';
 */

//POSの情報と結びつけてmycalinksアプリのジャンル情報を取得するAPI
/**
 * @deprecated - 非推奨です。代わりに api-generator パッケージの getAppGenreWithPosGenreApi を使用してください。
 */
export const getAppGenreWithPosGenre = {
  method: apiMethod.GET,
  path: 'store/[store_id]/myca-item/genre',
  privileges: {
    role: [apiRole.pos, apiRole.everyone], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
  },
  process: `
  `,
  response: <
    {
      appGenres: Array<
        MycaAppGenre & {
          total_item_count: number; //アプリ上で登録されているアイテム数
          posGenre: {
            //POS上で結びつけられているジャンルがある場合、その情報が入る
            id: Item_Genre['id'];
            total_item_count: number; //POSに登録されている、アプリに紐づいているこのジャンルのアイテム数
          } | null;
        }
      >;
    }
  >{},
};
