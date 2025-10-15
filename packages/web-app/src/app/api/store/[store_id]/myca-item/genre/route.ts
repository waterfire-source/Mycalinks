import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { ApiResponse, getAppGenreWithPosGenreApi } from 'api-generator';
import { Item_Genre } from '@prisma/client';

//在庫からタグを取り除くAPI
export const GET = BackendAPI.create(
  getAppGenreWithPosGenreApi,
  async (API, { params }) => {
    const appClient = new BackendApiMycaAppService(API);

    //非同期でアプリとPOSのジャンル情報を取得
    const results = await Promise.all([
      API.db.$queryRaw<
        Array<{
          id: Item_Genre['id'];
          handle: Item_Genre['handle'];
          total_item_count: number;
        }>
      >`
      SELECT
        COUNT(item_tb.id) AS total_item_count,
        Item_Genre.id,
        Item_Genre.handle
      FROM Item_Genre
      LEFT JOIN (
        SELECT Item.id, Item.genre_id FROM Item
        WHERE Item.store_id = ${params.store_id} AND Item.myca_item_id IS NOT NULL
      ) AS item_tb ON Item_Genre.id = item_tb.genre_id
      WHERE Item_Genre.handle IS NOT NULL AND Item_Genre.store_id = ${params.store_id}
      GROUP BY Item_Genre.id
      `,
      appClient.core.item.getGenres(),
      appClient.core.item.getGenreTotalItemCount(),
    ]);

    //アプリのジャンル情報に統合していく
    let appGenres: ApiResponse<typeof getAppGenreWithPosGenreApi>['appGenres'] =
      [];

    //@ts-expect-error becuase of because of
    appGenres = results[1].map((genre) => {
      //登録アイテム数を探す
      const totalItemCountInfo = results[2].find((e) => e.id == genre.id);
      const total_item_count = totalItemCountInfo
        ? totalItemCountInfo.total_item_count
        : 0;

      //POSジャンルを探す
      let posGenre: ApiResponse<
        typeof getAppGenreWithPosGenreApi
      >['appGenres'][number]['posGenre'] = null;

      const posGenreInfo = results[0].find((e) => e.handle == genre.name);

      if (posGenreInfo) {
        posGenre = {
          id: posGenreInfo.id,
          total_item_count: posGenreInfo.total_item_count,
        };
      }

      return {
        ...genre,
        total_item_count,
        posGenre,
      };
    });

    return {
      appGenres,
    };
  },
);
