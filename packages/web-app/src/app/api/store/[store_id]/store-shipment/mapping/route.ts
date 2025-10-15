// 店舗間在庫移動のマッピング定義API

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { ItemCategoryHandle } from '@prisma/client';
import { setStoreShipmentMappingApi } from 'api-generator';

export const POST = BackendAPI.create(
  setStoreShipmentMappingApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    const { to_store_id, mappings } = body;

    const { category, genre, specialty, condition_option, consignment_client } =
      mappings;

    //まずこのストアが同じ法人内にあるか確認
    const toStoreInfo = await API.db.store.findUnique({
      where: {
        id: to_store_id,
        accounts: {
          every: {
            account: {
              linked_corporation_id: API.resources.corporation!.id,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!toStoreInfo) {
      throw new ApiError({
        status: 404,
        messageText: '指定された店舗が見つかりません',
      });
    }

    //マッピングするべき要素を全て取得していく
    //同時に、先方の情報も取得する
    const [
      targetCategories,
      targetGenres,
      targetSpecialties,
      targetConditionOptions,
      targetConsignmentClients,
      toStoreCategories,
      toStoreGenres,
      toStoreSpecialties,
      toStoreConditionOptions,
      toStoreConsignmentClients,
    ] = await Promise.all([
      API.db.item_Category.findMany({
        where: {
          store_id,
          deleted: false,
          handle: null, //独自カテゴリ
          id: {
            in: category.map((e) => e.from_category_id),
          },
        },
      }),
      API.db.item_Genre.findMany({
        where: {
          store_id,
          deleted: false,
          handle: null, //独自ジャンル
          id: {
            in: genre.map((e) => e.from_genre_id),
          },
        },
      }),
      API.db.specialty.findMany({
        where: {
          store_id,
          deleted: false,
          id: {
            in: specialty.map((e) => e.from_specialty_id),
          },
        },
      }),
      API.db.item_Category_Condition_Option.findMany({
        where: {
          item_category: {
            store_id,
            deleted: false,
            handle: ItemCategoryHandle.CARD, //カードカテゴリ
          },
          deleted: false,
          id: {
            in: condition_option.map((e) => e.from_option_id),
          },
        },
        include: {
          item_category: true,
        },
      }),
      API.db.consignment_Client.findMany({
        where: {
          store_id,
          deleted: false,
          id: {
            in: consignment_client.map((e) => e.from_client_id),
          },
        },
      }),
      API.db.item_Category.findMany({
        where: {
          store_id: to_store_id,
          deleted: false,
          id: {
            in: category.map((e) => e.to_category_id),
          },
        },
      }),
      API.db.item_Genre.findMany({
        where: {
          store_id: to_store_id,
          deleted: false,
          id: {
            in: genre.map((e) => e.to_genre_id),
          },
        },
      }),
      API.db.specialty.findMany({
        where: {
          store_id: to_store_id,
          deleted: false,
          id: {
            in: specialty.map((e) => e.to_specialty_id),
          },
        },
      }),
      API.db.item_Category_Condition_Option.findMany({
        where: {
          item_category: {
            store_id: to_store_id,
            deleted: false,
            handle: ItemCategoryHandle.CARD, //カードカテゴリ
          },
          deleted: false,
          id: {
            in: condition_option.map((e) => e.to_option_id),
          },
        },
        include: {
          item_category: true,
        },
      }),
      API.db.consignment_Client.findMany({
        where: {
          store_id: to_store_id,
          deleted: false,
          id: {
            in: consignment_client.map((e) => e.to_client_id),
          },
        },
      }),
    ]);

    //指定するべきものが全て指定できているか確認
    //このロジックは必要ないらしい
    // const isPerfect = (a: Array<number>, b: Array<number>) => {
    //   const aSet = new Set(a);
    //   const bSet = new Set(b);

    //   return aSet.size === bSet.size && a.every((e) => bSet.has(e));
    // };

    //適切かどうかを判断していく
    //カテゴリ
    // if (
    //   !isPerfect(
    //     category.map((e) => e.from_category_id),
    //     targetCategories.map((e) => e.id),
    //   )
    // ) {
    //   throw new ApiError({
    //     status: 400,
    //     messageText: 'カテゴリのマッピングが不完全です',
    //   });
    // }
    category.forEach((e) => {
      const fromCategory = targetCategories.find(
        (c) => c.id === e.from_category_id,
      );
      const toCategory = toStoreCategories.find(
        (c) => c.id === e.to_category_id,
      );

      if (!fromCategory || !toCategory) {
        throw new ApiError({
          status: 404,
          messageText: '指定されたカテゴリが見つかりません',
        });
      }
    });

    //ジャンル
    // if (
    //   !isPerfect(
    //     genre.map((e) => e.from_genre_id),
    //     targetGenres.map((e) => e.id),
    //   )
    // ) {
    //   throw new ApiError({
    //     status: 400,
    //     messageText: 'ジャンルのマッピングが不完全です',
    //   });
    // }
    genre.forEach((e) => {
      const fromGenre = targetGenres.find((g) => g.id === e.from_genre_id);
      const toGenre = toStoreGenres.find((g) => g.id === e.to_genre_id);

      if (!fromGenre || !toGenre) {
        throw new ApiError({
          status: 404,
          messageText: '指定されたジャンルが見つかりません',
        });
      }
    });

    //スペシャリティ
    // if (
    //   !isPerfect(
    //     specialty.map((e) => e.from_specialty_id),
    //     targetSpecialties.map((e) => e.id),
    //   )
    // ) {
    //   throw new ApiError({
    //     status: 400,
    //     messageText: 'スペシャリティのマッピングが不完全です',
    //   });
    // }
    specialty.forEach((e) => {
      const fromSpecialty = targetSpecialties.find(
        (s) => s.id === e.from_specialty_id,
      );
      const toSpecialty = toStoreSpecialties.find(
        (s) => s.id === e.to_specialty_id,
      );

      if (!fromSpecialty || !toSpecialty) {
        throw new ApiError({
          status: 404,
          messageText: '指定されたスペシャリティが見つかりません',
        });
      }
    });

    //カードカテゴリの条件オプション
    // if (
    //   !isPerfect(
    //     condition_option.map((e) => e.from_option_id),
    //     targetConditionOptions.map((e) => e.id),
    //   )
    // ) {
    //   throw new ApiError({
    //     status: 400,
    //     messageText: 'カードカテゴリの条件オプションのマッピングが不完全です',
    //   });
    // }
    condition_option.forEach((e) => {
      const fromConditionOption = targetConditionOptions.find(
        (c) => c.id === e.from_option_id,
      );
      const toConditionOption = toStoreConditionOptions.find(
        (c) => c.id === e.to_option_id,
      );

      if (!fromConditionOption || !toConditionOption) {
        throw new ApiError({
          status: 404,
          messageText: '指定された条件オプションが見つかりません',
        });
      }
    });

    //ここまできたらDBに登録してOK
    const txRes = await API.transaction(async (tx) => {
      const upsertRes = await API.db.store_Relation.upsert({
        where: {
          from_store_id_to_store_id: {
            from_store_id: store_id,
            to_store_id,
          },
        },
        update: {
          mapping_defined: true,
          category_mappings: {
            deleteMany: {},
            createMany: {
              data: category,
            },
          },
          condition_option_mappings: {
            deleteMany: {},
            createMany: {
              data: condition_option,
            },
          },
          genre_mappings: {
            deleteMany: {},
            createMany: {
              data: genre,
            },
          },
          specialty_mappings: {
            deleteMany: {},
            createMany: {
              data: specialty,
            },
          },
          consignment_client_mappings: {
            deleteMany: {},
            createMany: {
              data: consignment_client,
            },
          },
        },
        create: {
          from_store_id: store_id,
          to_store_id,
          mapping_defined: true,
          category_mappings: {
            createMany: {
              data: category,
            },
          },
          condition_option_mappings: {
            createMany: {
              data: condition_option,
            },
          },
          genre_mappings: {
            createMany: {
              data: genre,
            },
          },
          specialty_mappings: {
            createMany: {
              data: specialty,
            },
          },
          consignment_client_mappings: {
            createMany: {
              data: consignment_client,
            },
          },
        },
        include: {
          category_mappings: true,
          condition_option_mappings: true,
          genre_mappings: true,
          specialty_mappings: true,
          consignment_client_mappings: true,
        },
      });

      return upsertRes;
    });

    return txRes;
  },
);
