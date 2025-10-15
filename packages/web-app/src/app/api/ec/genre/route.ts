import { BackendAPI } from '@/api/backendApi/main';
import { Item_Genre } from '@prisma/client';
import { getEcGenreDef } from '@/app/api/ec/def';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';

//ECジャンル取得
export const GET = BackendAPI.defineApi(getEcGenreDef, async (API) => {
  //キャッシュで返す

  //まずアプリから全ジャンルを取得
  const mycaAppService = new BackendApiMycaAppService(API);
  const allAppGenres = await mycaAppService.core.item.getGenres();

  //POS上からこのジャンルでEC出品されているものをフィルタリング
  const posGenres = await API.readDb.$queryRaw<
    Array<{ handle: Item_Genre['handle'] }>
  >`
    SELECT Item_Genre.handle FROM Item_Genre
    INNER JOIN Item ON Item_Genre.id = Item.genre_id
    INNER JOIN Store ON Item.store_id = Store.id
    INNER JOIN Product ON Item.id = Product.item_id
    WHERE
    Product.mycalinks_ec_enabled = 1 AND
    Store.mycalinks_ec_enabled = 1 AND
    Item_Genre.ec_enabled = 1
    GROUP BY Item_Genre.handle
    `;

  //フィルタリング

  return {
    genres: allAppGenres.filter((e) =>
      posGenres.find((pG) => pG.handle == e.name),
    ),
  };
});
