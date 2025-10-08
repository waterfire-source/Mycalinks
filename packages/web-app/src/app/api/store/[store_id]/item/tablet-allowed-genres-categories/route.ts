import { BackendAPI } from '@/api/backendApi/main';
import { getTabletAllowedGenresCategoriesDef } from '@/app/api/store/[store_id]/item/def';
import { setTabletAllowedGenresCategoriesApi } from 'api-generator';

//在庫検索タブレット
export const POST = BackendAPI.create(
  setTabletAllowedGenresCategoriesApi,
  async (API, { params, body }) => {
    const { tabletAllowedGenresCategories } = body;

    //一回全て消して作り直す
    const txRes = await API.transaction(async (tx) => {
      await tx.tablet_Allowed_Genre_Category.deleteMany({
        where: {
          store_id: params.store_id,
        },
      });

      //作り直す
      await tx.tablet_Allowed_Genre_Category.createMany({
        data: tabletAllowedGenresCategories.map((e) => ({
          store_id: params.store_id,
          item_genre_id: e.genre_id,
          item_category_id: e.category_id,
          condition_option_id: e.condition_option_id,
          specialty_id: e.specialty_id,
          // specialty_idがある場合はno_specialtyをfalseにして矛盾を防ぐ
          no_specialty: e.specialty_id ? false : e.no_specialty,
          limit_count: e.limit_count,
        })),
      });

      //最後に取得する
      const findRes = await tx.tablet_Allowed_Genre_Category.findMany({
        where: {
          store_id: params.store_id,
        },
      });

      return findRes;
    });

    return {
      tabletAllowedGenresCategories: txRes,
    };
  },
);

//在庫検索タブレット取得
export const GET = BackendAPI.defineApi(
  getTabletAllowedGenresCategoriesDef,
  async (API, { params }) => {
    const { store_id } = params;

    const findRes = await API.db.tablet_Allowed_Genre_Category.findMany({
      where: {
        store_id,
      },
    });

    return {
      tabletAllowedGenresCategories: findRes,
    };
  },
);
