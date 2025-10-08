import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Item, ItemCategoryHandle, ItemStatus, Prisma } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendApiItemService } from '@/api/backendApi/services/item/main';
import {
  BackendCoreItemService,
  ItemCreateData,
  Tablet_Allowed_Genre_Category,
} from 'backend-core';
import { getItemApi } from 'api-generator';

//条件を指定して、商品マスタの情報を取得するAPI
//[TODO] さすがにそろそろロジックを分割していきたい
export const GET = BackendAPI.create(
  getItemApi,
  async (API, { query, params }) => {
    const whereQuery: Array<Prisma.ItemWhereInput> = [];
    let statusQuery: Prisma.ItemWhereInput['status'] = {
      equals: ItemStatus.PUBLISH,
    };

    const { store_id } = params;

    let tabletAllowDefs: Tablet_Allowed_Genre_Category[] = [];

    //カテゴリで絞り込まれていたら
    await Promise.all(
      Object.entries(query).map(async ([prop, value]: any) => {
        switch (prop) {
          case 'product_is_active':
            whereQuery.push({
              products: {
                some: {
                  is_active: value,
                },
              },
            });

            break;

          case 'is_buy_only':
          case 'infinite_stock':
            whereQuery.push({
              [prop]: value,
            });
            break;

          case 'hasStock':
            whereQuery.push({
              products_stock_number: {
                ...(value ? { gt: 0 } : { lte: 0 }),
              },
            });
            break;

          case 'isPack': //パックかどうか
            whereQuery.push({
              myca_pack_id: {
                ...(value ? { not: null } : { equals: null }),
              },
            });
            break;

          case 'onlyEcPublishableProducts': {
            //ECで出品できるやつだけ取得
            const storeEcPosReservedStockNumber =
              API.resources.store!.ec_setting?.reserved_stock_number ?? 0;

            whereQuery.push({
              products: {
                some: {
                  OR: [
                    {
                      specific_ec_publishable_stock_number: {
                        gt: 0,
                      },
                    },
                    {
                      specific_ec_publishable_stock_number: null,
                      ec_pos_stock_gap: {
                        gt: storeEcPosReservedStockNumber ?? 0,
                      },
                    },
                  ],
                },
              },
            });
            break;
          }

          case 'isMycalinksItem':
            if (value) {
              whereQuery.push({
                myca_item_id: {
                  not: null,
                },
              });
            } else if (value == false) {
              whereQuery.push({
                myca_item_id: null,
              });
            }
            break;

          case 'id':
            whereQuery.push({
              [prop]: {
                in: value
                  .split(',')
                  .map((e: string) => parseInt(e))
                  .filter(Boolean),
              },
            });

            statusQuery = {};
            break;

          //在庫検索タブレット
          case 'fromTablet': {
            if (value != true) break;

            //許可するジャンル、カテゴリ定義を取得する
            tabletAllowDefs =
              await API.db.tablet_Allowed_Genre_Category.findMany({
                where: {
                  store_id: Number(store_id),
                },
              });

            whereQuery.push({
              tablet_allowed: true, //商品マスタレベルでのタブレット表示非表示条件
              ...(API.resources.store!.hide_non_mycalinks_item_on_tablet
                ? { myca_item_id: { not: null } }
                : {}),
              ...(tabletAllowDefs.length > 0
                ? {
                    OR: [
                      ...tabletAllowDefs.map((def) => ({
                        genre_id: def.item_genre_id,
                        category_id: def.item_category_id,
                      })),
                    ],
                  }
                : null),
            });

            //公開日時に則る
            whereQuery.push({
              OR: [
                {
                  release_at: null,
                },
                {
                  release_at: {
                    lte: new Date(),
                  },
                },
              ],
            });

            break;
          }

          case 'genre_id':
          case 'category_id':
          case 'option4':
          case 'myca_primary_pack_id':
            whereQuery.push({
              [prop]: Number(value),
            });

            break;

          case 'cardnumber':
            if (value) {
              // const splitted = value.split('+');

              whereQuery.push({
                // OR: [
                cardnumber: {
                  contains: value,
                },
              });
            }
            break;

          case 'rarity':
          case 'expansion':
          case 'cardseries':
          case 'card_type':
          case 'option1':
          case 'option2':
          case 'option3':
          case 'option5':
          case 'option6':
          case 'release_date':
          case 'displaytype1':
          case 'displaytype2':
            if (value) {
              const splitted = value.split(',') as string[];

              const orQuery: Prisma.ItemWhereInput['OR'] = [];

              splitted.forEach((e) => {
                const isPartial = e.includes('%');
                const actualValue = e.replaceAll('%', '');

                orQuery.push({
                  [prop]: isPartial
                    ? { contains: actualValue }
                    : { equals: actualValue },
                });
              });

              whereQuery.push({
                OR: orQuery,
              });
            }
            break;

          case 'type':
            if (value) {
              whereQuery.push(
                BackendCoreItemService.itemTypeToCategoryQuery(value),
              );
            }
            break;

          case 'modelNumber':
            whereQuery.push({
              cardnumber: value ? { contains: value } : { equals: null },
            });
            break;

          case 'status':
            if (value) {
              statusQuery = {
                in: value.split(','),
              };
            }
            break;

          case 'hasMarketPriceGap': //相場価格との差がある商品マスタ ※Mycaに結びついているアイテムのみ
            if (value) {
              if (value == true) {
                //この場で、差があるものを炙り出す ジャンルIDが指定されていたら一応それも利用しておく
                const genreIdQuery: Prisma.Sql = query.genre_id
                  ? Prisma.sql`
                AND i.genre_id = ${query.genre_id}
                `
                  : Prisma.sql`
                `;

                const targetIds = await API.db.$queryRaw<{ id: Item['id'] }[]>`
                SELECT i.id FROM Item i
                INNER JOIN Myca_Item mi ON i.myca_item_id = mi.myca_item_id
                WHERE i.store_id = ${store_id} AND i.sell_price != mi.market_price
                ${genreIdQuery}
                `;

                whereQuery.push({
                  id: {
                    in: targetIds.map((e) => e.id),
                  },
                });
              }
            }

            break;

          case 'marketPriceUpdatedAtGte':
            if (value) {
              whereQuery.push({
                myca_item: {
                  market_price_updated_at: {
                    gte: value,
                  },
                },
              });
            }
            break;

          case 'display_name': //商品マスタと商品それぞれのdisplay_nameで検索
            if (!value) break;
            whereQuery.push({
              ...BackendCoreItemService.getDisplayNameQuery(value),
            });
            break;
        }
      }),
    );

    const { includesSummary, includesProducts } = query;

    if (query?.id) {
      //ID指定の時は制限なし
      query.take = -1;
    }

    let result: any = [];

    const orderByQuery: Prisma.ItemOrderByWithRelationInput[] =
      API.orderByQuery.map((e) => {
        const propName = Object.keys(e)[0];
        const mode = Object.values(e)[0];

        switch (propName) {
          case 'market_price':
          case 'market_price_gap_rate':
            return {
              myca_item: {
                [propName]: mode,
              },
            };
          default:
            return e;
        }
      });

    const selectResultPromise = API.db.item.findManyExists({
      where: {
        AND: [
          {
            store_id: Number(store_id),
            status: statusQuery,
          },
          ...structuredClone(whereQuery),
        ],
      },
      include: {
        genre: {
          select: {
            display_name: true,
            handle: true,
          },
        },
        category: {
          select: {
            display_name: true,
            handle: true,
            condition_options: {
              select: {
                id: true,
                display_name: true,
                deleted: true,
                order_number: true,
              },
            },
          },
        },
        ...(includesProducts
          ? {
              products: {
                include: {
                  specialty: {
                    select: {
                      display_name: true,
                      order_number: true,
                    },
                  },
                  condition_option: {
                    select: {
                      display_name: true,
                      order_number: true,
                    },
                  },
                  consignment_client: {
                    select: {
                      full_name: true,
                      display_name: true,
                    },
                  },
                },
              },
            }
          : null),

        //バンドルを指定されていたら
        ...(query?.type?.includes(ItemCategoryHandle.BUNDLE)
          ? {
              bundle_item_products: true,
            }
          : null),

        //オリパを指定されていたら
        ...(query?.type?.includes(ItemCategoryHandle.ORIGINAL_PACK) ||
        query?.type?.includes(ItemCategoryHandle.LUCKY_BAG) ||
        query?.type?.includes(ItemCategoryHandle.DECK)
          ? {
              original_pack_products: {
                include: {
                  product: {
                    select: {
                      id: true,
                      display_name: true,
                      image_url: true,
                      specialty: {
                        select: {
                          display_name: true,
                        },
                      },
                      original_pack_products: {
                        select: {
                          process_id: true,
                          product: {
                            select: {
                              id: true,
                              display_name: true,
                              image_url: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            }
          : null),

        //MycaItem
        ...(query?.includesMycaItemInfo
          ? {
              myca_item: true,
            }
          : null),

        //カートンマスタ
        ...(query?.includesInnerBoxItemInfo
          ? {
              inner_box_item: true,
            }
          : null),
      },
      orderBy: [
        ...orderByQuery,
        {
          myca_item_id: 'desc',
        },
        {
          order_number: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      ...API.limitQuery,
    });

    const totalValues = {
      itemCount: 0,
    };

    let countQueryPromise: Promise<number> | null = null;

    if (includesSummary) {
      //合計まで取得するように指定されていたら
      countQueryPromise = API.db.item.countExists({
        where: {
          AND: [
            {
              store_id: Number(store_id),
              status: statusQuery,
            },
            ...structuredClone(whereQuery),
          ],
        },
      });
    }

    const [selectResult, countQueryResult] = await Promise.all([
      selectResultPromise,
      countQueryPromise,
    ]);

    totalValues.itemCount = countQueryResult ?? 0;

    //物理削除されている在庫は除く [TODO] なんかもっと良い方法ないん？　Prismaのミドルウェア使う？
    if (includesProducts) {
      selectResult.forEach((item) => {
        item.products = item.products.filter((product) => !product.deleted);

        item.products.forEach((product) => {
          //@ts-expect-error becuase of because of
          product.tags = [];
        });

        //論理削除されているコンディションオプションは除く
        item.category.condition_options = item.category.condition_options
          .filter((co) => !co.deleted)
          .sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0));

        //この商品マスタで許可されている状態を取得しておく
        const allowedConditionOptions = tabletAllowDefs.filter(
          (def) =>
            def.item_category_id === item.category_id &&
            def.item_genre_id === item.genre_id,
        );

        //在庫タブレットからの検索だったら許可されていないProductは除く
        if (query?.fromTablet) {
          item.products = item.products.filter((product) => {
            //tablet_allowedがfalseの場合は除く
            if (!product.tablet_allowed) {
              return false;
            }

            // 管理番号があるproductは除く
            if (product.management_number !== null) {
              return false;
            }

            // 特価在庫も除く
            if (product.is_special_price_product) {
              return false;
            }
            // 委託商品も除く
            if (product.consignment_client_id !== null) {
              return false;
            }

            const allowedConditionOption = allowedConditionOptions.find(
              (def) =>
                (!def.condition_option_id ||
                  product.condition_option_id === def.condition_option_id) &&
                (!def.specialty_id ||
                  product.specialty_id === def.specialty_id) &&
                (!def.no_specialty || product.specialty_id === null),
            );

            if (allowedConditionOption) {
              //注文可能数を入れる
              //@ts-expect-error becuase of because of
              product.tablet_limit_count = allowedConditionOption.limit_count;

              return true;
            }

            return false;
          });

          // tabletの設定するUIがなかったのでとりあえずデフォルトで在庫なし、販売価格０は表示しないようにする
          //在庫なしの場合非表示にするやつの対応
          item.products = item.products.filter(
            (product) => product.stock_number > 0,
          );

          //販売価格が0の場合非表示にするやつの対応
          item.products = item.products.filter(
            (product) =>
              (product.specific_sell_price ?? product.sell_price ?? 0) > 0,
          );
          // //在庫なしの場合非表示にするやつの対応
          // if (API.resources.store!.hide_no_stock_product_on_tablet) {
          //   item.products = item.products.filter(
          //     (product) => product.stock_number > 0,
          //   );
          // }

          // //販売価格が0の場合非表示にするやつの対応
          // if (API.resources.store!.hide_no_sell_price_product_on_tablet) {
          //   item.products = item.products.filter(
          //     (product) =>
          //       (product.specific_sell_price ?? product.sell_price ?? 0) > 0,
          //   );
          // }
        }

        //ECで出品できるやつだけ絞る
        if (query?.onlyEcPublishableProducts) {
          item.products = item.products.filter(
            (product) =>
              (product.specific_ec_publishable_stock_number ?? 0) > 0 ||
              (product.ec_pos_stock_gap ?? 0) >
                (API.resources.store!.ec_setting?.reserved_stock_number ?? 0),
          );
        }

        //出品できる個数も付け加える
        item.products.forEach((product) => {
          //@ts-expect-error becuase of because of
          product.actual_ec_publishable_stock_number = Math.max(
            product.specific_ec_publishable_stock_number ??
              (product.ec_pos_stock_gap ?? 0) -
                (API.resources.store!.ec_setting?.reserved_stock_number ?? 0),
            0,
          );
        });

        //状態並び替え - 希望の順番で並び替え
        // 商品の並び替え - 通常商品を先頭に、その後特殊商品を並べる
        item.products.sort((a, b) => {
          // 1. 特価在庫かどうか（特価在庫が後）
          if (a.is_special_price_product !== b.is_special_price_product) {
            return a.is_special_price_product ? 1 : -1;
          }

          // 2. 委託商品かどうか（委託商品が後）
          if (a.consignment_client_id !== b.consignment_client_id) {
            return a.consignment_client_id ? 1 : -1;
          }

          // 3. 管理番号の有無（管理番号がある方が後）
          // 管理番号がnullでない場合は「ある」と判定
          const aHasManagementNumber = a.management_number !== null;
          const bHasManagementNumber = b.management_number !== null;
          if (aHasManagementNumber !== bHasManagementNumber) {
            return aHasManagementNumber ? 1 : -1;
          }

          // 4. 管理番号ありの中で空文字のものが最後に来るように並び替え
          if (aHasManagementNumber && bHasManagementNumber) {
            const aIsEmptyString = a.management_number === '';
            const bIsEmptyString = b.management_number === '';
            if (aIsEmptyString !== bIsEmptyString) {
              return aIsEmptyString ? 1 : -1;
            }
          }

          // 5. 特殊状態の有無・order_number
          const aSpecialtyId = a.specialty_id;
          const bSpecialtyId = b.specialty_id;

          // 特殊状態がない商品を先頭に
          if (aSpecialtyId === null && bSpecialtyId !== null) return -1;
          if (aSpecialtyId !== null && bSpecialtyId === null) return 1;

          // 特殊状態がある商品同士はorder_numberで比較
          if (aSpecialtyId !== null && bSpecialtyId !== null) {
            const aSpecialtyOrder = (a as any).specialty?.order_number ?? 0;
            const bSpecialtyOrder = (b as any).specialty?.order_number ?? 0;
            if (aSpecialtyOrder !== bSpecialtyOrder) {
              return aSpecialtyOrder - bSpecialtyOrder;
            }
          }

          // 5. condition_optionのorder_number（状態順、小さい順）
          const aConditionOrder =
            (a as any).condition_option?.order_number ?? 0;
          const bConditionOrder =
            (b as any).condition_option?.order_number ?? 0;
          if (aConditionOrder !== bConditionOrder) {
            return aConditionOrder - bConditionOrder;
          }

          // 6. 委託商品同士は委託者名で並び替え
          if (a.consignment_client_id && b.consignment_client_id) {
            const aClientName = (a as any).consignment_client?.full_name ?? '';
            const bClientName = (b as any).consignment_client?.full_name ?? '';
            if (aClientName !== bClientName) {
              return aClientName.localeCompare(bClientName);
            }
          }

          // 全ての条件が同じ場合は元の順序を保持
          return 0;
        });
      });
    }

    const mycaApp = new BackendApiMycaAppService(API);

    await Promise.all(
      selectResult.map(async (i) => {
        //相場価格系は削除
        //@ts-expect-error becuase of because of
        delete i.market_price;
        //@ts-expect-error becuase of because of
        delete i.previous_market_price;
        //@ts-expect-error becuase of because of
        delete i.market_price_gap_rate;
        //@ts-expect-error becuase of because of
        delete i.market_price_updated_at;

        const productModel = new BackendApiProductService(API);

        //@ts-expect-error because of becau
        i.displayNameWithMeta = productModel.core.getProductNameWithMeta({
          display_name: i.display_name ?? '',
          item: {
            rarity: i.rarity,
            expansion: i.expansion,
            cardnumber: i.cardnumber,
          },
        });

        //メタ情報もマージしていく
        if (i.category.handle && i.genre?.handle) {
          const thisItemMetas = await mycaApp.core.item.getItemMetaDef(
            i.genre.handle,
            i.category.handle,
          );

          //@ts-expect-error becuase of because of
          i.metas = thisItemMetas.map((e) => ({
            ...e,
            value: i[e.columnOnPosItem],
          }));
        } else {
          //@ts-expect-error becuase of because of
          i.metas = [];
        }

        i.products?.forEach((p) => {
          const productModel = new BackendApiProductService(API);
          //@ts-expect-error becuase of because of
          p.displayNameWithMeta = productModel.core.getProductNameWithMeta({
            specialty: {
              //@ts-expect-error becuase of because of
              display_name: p.specialty?.display_name,
            },
            display_name: p.display_name,
            item: {
              rarity: i.rarity,
              expansion: i.expansion,
              cardnumber: i.cardnumber,
            },
          });
          //@ts-expect-error becuase of because of
          p.item_infinite_stock = i.infinite_stock;
        });
        i.original_pack_products?.forEach((p) => {
          const productModel = new BackendApiProductService(API);
          //@ts-expect-error becuase of because of
          p.product.displayNameWithMeta =
            productModel.core.getProductNameWithMeta({
              specialty: {
                //@ts-expect-error becuase of because of
                display_name: p.product.specialty?.display_name,
              },
              //@ts-expect-error becuase of because of
              display_name: p.product.display_name,
              //@ts-expect-error becuase of because of
              management_number: p.product.management_number,
              item: {
                rarity: i.rarity,
                expansion: i.expansion,
                cardnumber: i.cardnumber,
              },
            });
        });
      }),
    );

    //結果をフラットにしつつ、エイリアスを与える [TODO] こんなことしなくても大丈夫かも
    result = BackendAPI.useFlat(
      selectResult,
      {
        genre__display_name: 'genre_display_name',
        category__display_name: 'category_display_name',
        category__condition_options: 'category_condition_options',
        condition_option__display_name: 'condition_option_display_name',
        category__handle: 'category_handle',
        tag__id: 'tag_id',
        tag__display_name: 'tag_name',
        tag__genre1: 'genre1',
        tag__genre2: 'genre2',
        myca_item__market_price_updated_at: 'market_price_updated_at',
        myca_item__market_price: 'market_price',
        myca_item__previous_market_price: 'previous_market_price',
        myca_item__market_price_gap_rate: 'market_price_gap_rate',
      },
      {
        inner_box_item: true,
      },
    );

    result = {
      items: result,
      totalValues,
    };

    return result;
  },
);

//商品マスタを1つ登録するAPI
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: ['list_item'], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const {
      myca_item_id,
      // myca_pack_id,
      display_name,
      display_name_ruby,
      sell_price,
      buy_price,
      rarity,
      pack_name,
      description,
      expansion,
      cardnumber,
      keyword,
      image_url,
      category_id,
      genre_id,
      order_number,
      is_buy_only,
      readonly_product_code,
      allow_auto_print_label,
      allow_round,
      infinite_stock,
    } = API.body as BackendItemAPI[1]['request']['body'];

    //先にMycaのItem情報を取得しておく

    let createDataQuery: ItemCreateData | null = null;

    if (myca_item_id) {
      //Itemを作成するクエリを組み立てる
      const itemModel = new BackendApiItemService(API);

      const res = await itemModel.core.createQueryFromMycaApp({
        props: {
          id: myca_item_id,
        },
      });
      const itemQueries = res.itemQueries;

      if (itemQueries.length != 1)
        throw new ApiError({
          status: 500,
          messageText:
            '指定されたMycaアプリのIDの情報を取得することができませんでした',
        });

      createDataQuery = itemQueries[0];
    } else {
      //商品種別を選択してなかったらエラー
      if (!category_id)
        throw new ApiError({
          status: 400,
          messageText: '独自商品の追加では商品種別を指定する必要があります',
        });
      //ジャンルを選択してなかったらエラー
      if (!genre_id)
        throw new ApiError({
          status: 400,
          messageText: '独自商品の追加ではジャンルを指定する必要があります',
        });
    }

    //商品種別がオリパやバンドルだったらエラー
    if (category_id) {
      const thisCategoryInfo = await API.db.item_Category.findUnique({
        where: {
          id: category_id,
          store_id: Number(store_id),
          OR: [
            {
              handle: {
                notIn: [
                  ItemCategoryHandle.BUNDLE,
                  ItemCategoryHandle.ORIGINAL_PACK,
                  ItemCategoryHandle.LUCKY_BAG,
                  ItemCategoryHandle.DECK,
                ],
              },
            },
            {
              handle: null,
            },
          ],
        },
      });

      if (!thisCategoryInfo)
        throw new ApiError({
          status: 400,
          messageText: '指定された商品種別で商品マスタを作ることはできません',
        });
    }

    const txRes = await API.transaction(async (tx) => {
      const itemService = new BackendApiItemService(API);

      try {
        const insertResult = await itemService.core.create({
          //@ts-expect-error becuase of because of
          data: {
            ...createDataQuery,
            ...(display_name ? { display_name } : null),
            ...(rarity ? { rarity } : null),
            ...(pack_name ? { pack_name } : null),
            ...(expansion ? { expansion } : null),
            ...(keyword ? { keyword } : null),
            ...(cardnumber ? { cardnumber } : null),
            ...(image_url ? { image_url } : null),
            ...(image_url ? { image_url } : null),
            allow_auto_print_label,
            allow_round,
            infinite_stock,
            ...(category_id
              ? {
                  category: {
                    connect: {
                      id: category_id,
                    },
                  },
                }
              : null),
            ...(genre_id
              ? {
                  genre: {
                    connect: {
                      id: genre_id,
                    },
                  },
                }
              : null),
            display_name_ruby,
            sell_price: sell_price && Number(sell_price),
            buy_price: buy_price && Number(buy_price),
            is_buy_only,
            order_number: order_number && Number(order_number),
            readonly_product_code,
            description,
          },
        });

        return insertResult;
      } catch (e: any) {
        console.log(e);
        if (e.message?.includes('Item_store_id_myca_item_id_key')) {
          throw new ApiError({
            status: 400,
            messageText:
              'すでに存在しているMycaのカードを登録しようとしています',
          });
        }

        throw e;
      }
    });

    return API.status(201).response({ data: txRes });
  },
);
