import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { createItemGenreApi, getItemGenreApi } from 'api-generator';

//商品ジャンル取得
export const GET = BackendAPI.create(
  getItemGenreApi,
  async (API, { params, query }) => {
    let itemGenres = await API.db.item_Genre.findMany({
      where: {
        store_id: params.store_id,
        deleted: false,
      },
      include: {
        tablet_allowed_genres: true,
      },
      orderBy: [
        {
          order_number: 'asc',
        },
      ],
    });

    //在庫検索タブレット
    if (query?.fromTablet) {
      itemGenres = itemGenres.filter((e) => e.tablet_allowed_genres.length);
    }

    return {
      itemGenres,
    };
  },
);

//ジャンル作成
export const POST = BackendAPI.create(
  createItemGenreApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    const {
      myca_genre_id, //Myca上のジャンルID

      display_name, //表示名
    } = body;

    //Mycaからの登録かどうか
    if (myca_genre_id) {
      //指定されたmycaのジャンルの情報を取得する
      const mycaApp = new BackendApiMycaAppService(API);
      const allGenres = await mycaApp.core.item.getGenres();
      const thisMycaGenre = allGenres.find((e) => e.id == myca_genre_id);

      if (!thisMycaGenre)
        throw new ApiError(createItemGenreApi.error.invalidAppGenre);

      //このジャンルがすでに追加されていないか確認
      const currentInfo = await API.db.item_Genre.findUnique({
        where: {
          store_id_handle: {
            store_id,
            handle: thisMycaGenre.name,
          },
        },
      });

      if (currentInfo)
        throw new ApiError(createItemGenreApi.error.alreadyRegistered);

      //同じ名前で追加されているものがあったら、それを更新する形
      const already = await API.db.item_Genre.findUnique({
        where: {
          store_id_display_name: {
            store_id,
            display_name: thisMycaGenre.display_name,
          },
        },
      });

      //作る
      const createGenreRes = await API.db.item_Genre.upsert({
        where: {
          id: already?.id ?? 0,
        },
        update: {
          handle: thisMycaGenre.name,
        },
        create: {
          store_id,
          handle: thisMycaGenre.name,
          display_name: thisMycaGenre.display_name,
        },
      });

      //アイテムの自動インポート処理は別で書く

      return createGenreRes;
    } else {
      //独自ジャンル作成だったら

      if (!display_name)
        throw new ApiError({
          status: 400,
          messageText: '新規部門追加には表示名の指定が必要です',
        });

      //作る
      const createGenreRes = await API.db.item_Genre.create({
        data: {
          store_id,
          display_name,
        },
      });

      return createGenreRes;
    }
  },
);
