import { BackendAPI, ResponseMsgKind } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { updateAllStoreItemDef } from '@/app/api/store/all/item/def';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { ItemTask, TaskManager } from 'backend-core';
import { Item, ItemStatus, Prisma, TaskSourceKind } from '@prisma/client';
import { customDayjs } from 'common';
import { ApiResponse, getAllStoreItemApi } from 'api-generator';
import { BackendApiAccountService } from '@/api/backendApi/services/account/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//@ts-expect-error for bigint
BigInt.prototype.toJSON = function () {
  return Number(this);
};

//全てのストア用の商品マスタを登録するためのAPI
//基本的にMycaアプリ上で新しいアイテムが登録された時にBOTが実行する
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: ['bot'],
        policies: [],
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const {
      mycaItemIds, //Mycaアプリ上でのIDの配列
    } = API.body;

    //先にMycaのItem情報を取得しておく

    // const mycaAppClient = new BackendApiMycaAppService(API);

    // const mycaAppItems = await mycaAppClient.core.item.getAllDetail(
    //   {
    //     id: mycaItemIds,
    //   },
    //   {
    //     detail: 1,
    //   },
    // );

    // //自動更新をオンにしているストアを全て取得
    // const targetStores = await API.db.store.findMany({
    //   where: {
    //     item_genres: {
    //       some: {
    //         auto_update: true,
    //       },
    //     },
    //   },
    //   include: {
    //     item_genres: true,
    //     ec_setting: true,
    //     accounts: true,
    //   },
    // });

    // //各ストアを確認していく（ここはPromise.all）
    // for (const store of targetStores) {
    //   API.resources.store = store;

    //   //このストアの自動更新部門を抽出
    //   const targetGenres = store.item_genres.filter(
    //     (e) => e.handle && e.auto_update && !e.deleted,
    //   );

    //   //今回のアイテムの中に対象の部門が含まれているか確認
    //   const targetMycaAppItems = mycaAppItems.filter((e) =>
    //     targetGenres.find((genre) => e.cardgenre == genre.handle),
    //   );

    //   //アイテムがあったら登録処理を行う

    //   if (targetMycaAppItems.length > 0) {
    //     //ストアのステータスをいじくる
    //     const thisStore = new BackendApiStoreService(API, store.id);
    //     await thisStore.core.setStatusMessage(
    //       thisStore.core.rule.statusMessageDict.autoUpdatedFromApp.doing,
    //     );

    //     const itemModel = new BackendApiItemService(API);
    //     itemModel.setIds({ storeId: store.id });

    //     try {
    //       await API.transaction(async (tx) => {
    //         const res = await itemModel.core.createQueryFromMycaApp({
    //           props: {
    //             id: targetMycaAppItems.map((e) => e.id),
    //           },
    //           specificMycaAppItems: targetMycaAppItems,
    //         });

    //         const dataQueries = res.itemQueries;

    //         for (const eachItem of dataQueries) {
    //           const insertResult = await tx.item.create({
    //             data: eachItem,
    //           });

    //           //商品マスタを追加
    //           const thisItem = new BackendApiItemService(API, insertResult.id);
    //           await thisItem.core.createProducts({});

    //           console.log(
    //             `自動更新処理でストア:${store.id} にMycaアイテム:${eachItem.myca_item_id}を追加しました`,
    //           );
    //         }
    //       });

    //       await thisStore.core.setStatusMessage(
    //         thisStore.core.rule.statusMessageDict.autoUpdatedFromApp.finished,
    //       );
    //     } catch (error) {
    //       await thisStore.core.setStatusMessage(
    //         thisStore.core.rule.statusMessageDict.autoUpdatedFromApp.error,
    //       );
    //       console.log(error);
    //     }
    //   }
    // }

    return API.status(201).response({ msgContent: ResponseMsgKind.created });
  },
);

//商品マスタ情報更新
export const PUT = BackendAPI.defineApi(
  updateAllStoreItemDef,
  async (API, { body }) => {
    const { updatedItems } = body;

    //全てのアイテム情報を取得していく
    const mycaAppService = new BackendApiMycaAppService(API);

    const [allMycaAppItems, allStoreItems] = await Promise.all([
      mycaAppService.core.item.getAllDetail(
        {
          id: updatedItems.map((e) => e.id),
        },
        {
          detail: 1,
        },
      ),
      API.db.item.findManyExists({
        where: {
          myca_item_id: {
            in: updatedItems.map((e) => e.id),
          },
        },
        select: {
          id: true,
          myca_item_id: true,
          store_id: true,
        },
      }),
    ]);

    //仕入れ先ごとにグルーピングする
    const grouped = Object.values(
      allStoreItems.reduce(
        (acc, item) => {
          const key = item.store_id;
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        },
        {} as Record<number, typeof allStoreItems>,
      ),
    );

    for (const store of grouped) {
      //このストアを取得
      const store_id = store[0].store_id;

      API.ids.storeId = store_id;

      const updateTasks: ItemTask.UpdateItemData[] = [];

      store.forEach((item) => {
        const mycaAppItem = allMycaAppItems.find(
          (e) => e.id == item.myca_item_id,
        );

        if (mycaAppItem) {
          let releaseDate: Date | undefined = undefined;

          if (mycaAppItem.release_date) {
            //ポケモンだったら朝7時に変換する
            if (mycaAppItem.cardgenre == 'ポケモン') {
              releaseDate = customDayjs
                .tz(mycaAppItem.release_date)
                .set('hour', 7)
                .toDate();
            } else {
              releaseDate = customDayjs.tz(mycaAppItem.release_date).toDate();
            }
          }

          updateTasks.push({
            id: item.id,
            display_name: mycaAppItem.cardname,
            expansion: mycaAppItem.expansion,
            rarity: mycaAppItem.rarity,
            card_type: mycaAppItem.type,
            cardnumber: mycaAppItem.cardnumber,
            image_url: mycaAppItem.full_image_url,
            pack_name: mycaAppItem.pack,
            keyword: mycaAppItem.keyword,
            cardseries: mycaAppItem.cardseries,
            option1: mycaAppItem.option1,
            option2: mycaAppItem.option2,
            option3: mycaAppItem.option3,
            option4: mycaAppItem.option4,
            option5: mycaAppItem.option5,
            option6: mycaAppItem.option6,
            displaytype1: mycaAppItem.displaytype1,
            displaytype2: mycaAppItem.displaytype2,
            release_date: mycaAppItem.release_date,
            release_at: releaseDate,
            weight: mycaAppItem.weight,
            myca_pack_id: mycaAppItem.item_pack_id,
            box_pack_count: mycaAppItem.box_pack_count,
            myca_primary_pack_id: mycaAppItem.cardpackid,
          });
        }
      });

      if (updateTasks.length > 0) {
        const taskManager = new TaskManager({
          targetWorker: 'item',
          kind: 'updateItem',
        });

        await taskManager.publish({
          body: updateTasks,
          service: API,
          source: TaskSourceKind.SYSTEM,
          processDescription: `Mycaの商品マスタ情報更新`,
          hiddenTask: true,
          suffix: String(store_id),
        });
      }
    }
  },
);

// 全店舗商品マスタ取得

export const GET = BackendAPI.create(
  getAllStoreItemApi,
  async (API, { query }) => {
    let whereQuery: Prisma.Sql = Prisma.sql``;

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'genre_display_name': {
          whereQuery = Prisma.sql`${whereQuery} AND Item_Genre.display_name = ${value}`;
          break;
        }

        case 'category_display_name': {
          whereQuery = Prisma.sql`${whereQuery} AND Item_Category.display_name = ${value}`;
          break;
        }

        case 'name': {
          whereQuery = Prisma.sql`${whereQuery} AND Item.display_name LIKE ${`%${value}%`}`;
          break;
        }
      }
    }

    const accountService = new BackendApiAccountService(API);
    const managableStores = await accountService.getManagableStores();

    //対象の商品マスタ情報を取得する
    const rawItems = await API.readDb.$queryRaw<Item[]>`
    SELECT * FROM Item
    INNER JOIN Item_Genre ON Item.genre_id = Item_Genre.id
    INNER JOIN Item_Category ON Item.category_id = Item_Category.id
    WHERE
    Item.store_id IN (${Prisma.join(managableStores)})
    AND Item.status = ${ItemStatus.PUBLISH}
    AND Item_Genre.deleted = 0
    AND Item_Genre.hidden = 0
    AND Item_Category.deleted = 0
    AND Item_Category.hidden = 0
    ${whereQuery}
    ORDER BY COALESCE(Item.myca_item_id, Item.id)
    ${API.limitQueryRaw}
    `;

    //それぞれの商品マスタorMycaアイテムに関連したすべての在庫を取得してくる
    const items = await Promise.all(
      rawItems.map(async (item) => {
        let whereInput: Prisma.ProductWhereInput = {};

        if (item.myca_item_id) {
          whereInput = {
            store_id: {
              in: managableStores,
            },
            item: {
              myca_item_id: item.myca_item_id,
            },
          };
        } else {
          whereInput = {
            store_id: item.store_id,
            item_id: item.id,
          };
        }

        const allProducts: ApiResponse<
          typeof getAllStoreItemApi
        >['items'][number]['products'] = await API.db.product.findManyExists({
          where: whereInput,
          include: {
            condition_option: true,
            specialty: true,
            consignment_client: true,
            item: {
              select: {
                rarity: true,
                expansion: true,
                cardnumber: true,
                infinite_stock: true,
                myca_item_id: true,
                category: true,
                genre: true,
              },
            },
          },
        });

        //在庫にメタ情報をつける
        allProducts.forEach((product) => {
          const productService = new BackendApiProductService(API, product.id);

          const displayNameWithMeta =
            productService.core.getProductNameWithMeta(product);
          product.displayNameWithMeta = displayNameWithMeta;
        });

        return {
          ...item,
          products: allProducts,
        };
      }),
    );

    return {
      items,
    };
  },
);
