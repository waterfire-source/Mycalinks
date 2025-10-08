import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { ConditionOptionHandle, Prisma, TransactionKind } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendCoreItemService } from 'backend-core';
import { ecConstants, posCommonConstants } from 'common';
import { BackendApiStoreShipmentService } from '@/api/backendApi/services/store-shipment/main';

//条件を指定して、商品の情報を取得するAPI
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos, apiRole.everyone], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };
    const API = await BackendAPI.setUp(req, params, apiDef);

    const whereQuery: Array<Prisma.ProductWhereInput> = [];

    const { store_id } = API.params;

    let { skip, take, includesSummary, includesImages } = API.query;
    const customOrderQuery: Prisma.ProductOrderByWithRelationInput[] = [];
    let includesDeleted = false;

    await Promise.all(
      Object.entries(API.query).map(async ([prop, value]: any) => {
        switch (prop) {
          case 'is_active':
            whereQuery.push({
              is_active:
                value == 'true' ? true : value == 'false' ? false : undefined,
            });
            break;

          case 'item_infinite_stock':
            whereQuery.push({
              item: {
                infinite_stock:
                  value == 'true' ? true : value == 'false' ? false : undefined,
              },
            });
            break;

          case 'is_special_price_product':
          case 'mycalinks_ec_enabled':
            whereQuery.push({
              [prop]:
                value == 'true' ? true : value == 'false' ? false : undefined,
            });
            break;

          case 'id':
          case 'item_id':
            whereQuery.push({
              [prop]: {
                in: value.split(',').map((e: string) => parseInt(e)),
              },
            });

            //ID指定の時は論理削除されているものも含める
            includesDeleted = true;
            take = '-1'; //ID指定の時は無制限に取得

            break;

          case 'original_pack_item_id':
            whereQuery.push({
              original_pack_products: {
                some: {
                  item_id: Number(value),
                },
              },
            });

            take = '-1'; //オリパID指定の時は無制限に取得
            break;

          case 'someEcEnabled':
            whereQuery.push({
              OR: [
                {
                  mycalinks_ec_enabled: true,
                },
                {
                  ochanoko_ec_enabled: true,
                },
                {
                  shopify_ec_enabled: true,
                },
              ],
            });
            break;

          case 'ecAvailable':
            whereQuery.push({
              item: {
                genre: {
                  ec_enabled: true,
                },
                category: {
                  ec_enabled: true,
                },
                myca_item_id: {
                  not: null,
                },
              },
              condition_option: {
                handle: {
                  in: [
                    ...Object.keys(ecConstants.ecConditionOptionHandleDict),
                  ] as ConditionOptionHandle[],
                },
              },
              OR: [
                {
                  specialty_id: null,
                },
                {
                  specialty: {
                    handle: {
                      not: null,
                    },
                  },
                },
              ],
            });
            break;

          case 'inventory_id':
            whereQuery.push({
              inventory_products: {
                some: {
                  inventory_id: Number(value),
                },
              },
            });

            take = '-1'; //棚卸ID指定の時は無制限に取得
            break;

          case 'isMycalinksItem':
            if (value == 'true') {
              whereQuery.push({
                item: {
                  myca_item_id: {
                    not: null,
                  },
                },
              });
            } else if (value == 'false') {
              whereQuery.push({
                item: {
                  myca_item_id: null,
                },
              });
            }

            break;

          case 'myca_item_id':
            whereQuery.push({
              item: {
                myca_item_id: Number(value),
              },
            });
            break;

          case 'product_code': {
            //productコードを指定された時は、在庫がある順に読み込んでいく
            skip = 0;
            take = 50;
            includesDeleted = true;

            if (!isNaN(Number(value)) && String(value).startsWith('428')) {
              whereQuery.push({
                id: Number(value || 0) - posCommonConstants.productCodePrefix,
              });
            } else {
              whereQuery.push({
                readonly_product_code: value,
              });
            }

            // const orQuery: Prisma.ProductWhereInput['OR'] = [];
            // orQuery.push({
            //   readonly_product_code: value,
            // });
            // if (!isNaN(Number(value)) && String(value).startsWith('428')) {
            //   orQuery.push({
            //     id: Number(value || 0) - posCommonConstants.productCodePrefix,
            //   });
            // }

            // whereQuery.push({
            //   OR: orQuery,
            // });

            customOrderQuery.push({
              stock_number: 'desc',
            });

            break;
          }

          //JANコードの場合は部分一致にする（複数登録されている可能性もあるため）

          //指定した日時に価格変動があるかどうか（販売価格）
          case 'priceChangeDateGte':
            whereQuery.push({
              prices: {
                some: {
                  date: {
                    gte: new Date(value),
                  },
                  kind: TransactionKind.sell,
                },
              },
            });

            break;

          case 'priceChangeDateLt': //終了日の方
            whereQuery.push({
              prices: {
                some: {
                  date: {
                    lt: new Date(value),
                  },
                  kind: TransactionKind.sell,
                },
              },
            });

            break;

          //指定した日時に在庫変動があるかどうか（販売価格）
          case 'stockChangeDateGte':
            whereQuery.push({
              stocks: {
                some: {
                  datetime: {
                    gte: new Date(value),
                  },
                },
              },
            });

            break;

          case 'stockChangeDateLt': //終了日の方
            whereQuery.push({
              stocks: {
                some: {
                  datetime: {
                    lt: new Date(value),
                  },
                },
              },
            });

            break;

          //パックかどうか
          case 'isPack':
            whereQuery.push({
              item: {
                is: {
                  myca_pack_id: {
                    not: null,
                  },
                },
              },
            });

            break;

          case 'type':
            whereQuery.push({
              item: BackendCoreItemService.itemTypeToCategoryQuery(value),
            });

            break;

          //在庫数
          case 'stock_number_gte':
            whereQuery.push({
              stock_number: {
                gte: parseInt(value),
              },
            });

            break;

          //EC在庫数
          case 'ec_stock_number_gte':
            whereQuery.push({
              ec_stock_number: {
                gte: parseInt(value),
              },
            });

            break;

          case 'display_name': {
            //商品マスタと商品それぞれのdisplay_nameで検索
            if (!value) break;

            const productService = new BackendApiProductService(API);
            whereQuery.push(productService.getDisplayNameSearchQuery(value));

            break;
          }

          // レアリティに対する検索(部分一致)
          case 'item_rarity':
          case 'item_expansion':
          case 'item_cardseries':
          case 'item_card_type':
          case 'item_option1':
          case 'item_option2':
          case 'item_option3':
          case 'item_option5':
          case 'item_option6':
          case 'item_release_date':
          case 'item_displaytype1':
          case 'item_displaytype2': {
            if (value) {
              const propName = prop.replace('item_', '');
              const splitted = value.split(',') as string[];

              const orQuery: Prisma.ItemWhereInput['OR'] = [];

              splitted.forEach((e) => {
                const isPartial = e.includes('%');
                const actualValue = e.replaceAll('%', '');

                orQuery.push({
                  [propName]: isPartial
                    ? { contains: actualValue }
                    : { equals: actualValue },
                });
              });

              whereQuery.push({
                item: {
                  OR: orQuery,
                },
              });
            }

            break;
          }

          case 'item_myca_primary_pack_id':
          case 'item_option4': {
            if (!value) break;
            const propName = prop.replace('item_', '');
            whereQuery.push({
              item: {
                [propName]: Number(value),
              },
            });

            break;
          }

          // 型番の検索(部分一致)
          case 'item_cardnumber':
            if (!value) break;

            whereQuery.push({
              item: {
                OR: [
                  {
                    cardnumber: {
                      contains: value,
                    },
                  },
                ],
              },
            });

            break;

          // カテゴリ
          case 'item_category_id':
            whereQuery.push({
              item: {
                category_id: Number(value),
              },
            });

            break;

          // ジャンル
          case 'item_genre_id':
            whereQuery.push({
              item: {
                genre_id: Number(value),
              },
            });

            break;

          // 状態
          case 'condition_option_id':
            whereQuery.push({
              condition_option_id: Number(value),
            });

            break;

          // スペシャルティ
          case 'specialty_id': {
            if (value === false) {
              whereQuery.push({ specialty_id: null });
            } else {
              whereQuery.push({
                specialty_id: Number(value),
              });
            }
            break;
          }

          // 状態
          case 'condition_option_display_name':
            whereQuery.push({
              condition_option: {
                display_name: value,
              },
            });

            break;

          case 'is_consignment_product':
            if (value == 'true') {
              whereQuery.push({
                consignment_client_id: {
                  not: null,
                },
              });
            } else if (value == 'false') {
              whereQuery.push({
                consignment_client_id: null,
              });
            }
            // undefinedの場合は何もしない（全て取得）

            break;

          case 'forStoreShipment': {
            //店舗間在庫移動
            //マッピング定義を取得する
            const storeShipmentService = new BackendApiStoreShipmentService(
              API,
            );
            const mappingDef = await storeShipmentService.core.getMappingDef(
              Number(value),
              true,
            );

            whereQuery.push({
              item: {
                category: {
                  OR: [
                    {
                      handle: {
                        not: null, //自動作成カテゴリはOK
                      },
                    },
                    {
                      id: {
                        in: mappingDef.category.map((e) => e.from_category_id),
                      },
                    },
                  ],
                },
                genre: {
                  OR: [
                    {
                      handle: {
                        not: null, //自動作成ジャンルはOK
                      },
                    },
                    {
                      id: {
                        in: mappingDef.genre.map((e) => e.from_genre_id),
                      },
                    },
                  ],
                },
              },
              condition_option: {
                OR: [
                  {
                    handle: {
                      in: [
                        ConditionOptionHandle.O1_BRAND_NEW,
                        ConditionOptionHandle.O2_LIKE_NEW,
                        ConditionOptionHandle.O3_USED,
                      ],
                    },
                  },
                  {
                    id: {
                      in: mappingDef.condition_option.map(
                        (e) => e.from_option_id,
                      ),
                    },
                  },
                ],
              },
              AND: [
                {
                  OR: [
                    {
                      specialty_id: null,
                    },
                    {
                      specialty_id: {
                        in: mappingDef.specialty.map(
                          (e) => e.from_specialty_id,
                        ),
                      },
                    },
                  ],
                },
                {
                  OR: [
                    {
                      consignment_client_id: null,
                    },
                    {
                      consignment_client_id: {
                        in: mappingDef.consignment_client.map(
                          (e) => e.from_client_id,
                        ),
                      },
                    },
                  ],
                },
              ],
            });
            break;
          }

          // 管理番号があるかどうか
          case 'hasManagementNumber':
            if (value == 'true') {
              whereQuery.push({
                management_number: {
                  not: null,
                },
              });
            } else if (value == 'false') {
              whereQuery.push({
                management_number: null,
              });
            }
            // undefinedの場合は何もしない（全て取得）

            break;
        }
      }),
    );

    let result: any = [];

    const args: Prisma.ProductFindManyArgs = {
      where: {
        AND: [
          {
            store_id: parseInt(store_id || '0'),
          },
          ...structuredClone(whereQuery),
        ],
      },
      include: {
        specialty: {
          select: {
            display_name: true,
          },
        },
        item: {
          select: {
            myca_item_id: true,
            display_name: true,
            expansion: true,
            rarity: true,
            cardnumber: true,
            category: {
              select: {
                id: true,
                display_name: true,
              },
            },
            genre: {
              select: {
                id: true,
                display_name: true,
              },
            },
            infinite_stock: true,
            allow_auto_print_label: true,
          },
        },
        condition_option: {
          select: {
            display_name: true,
          },
        },
        consignment_client: {
          select: {
            full_name: true,
            display_name: true,
          },
        },
        ...(includesImages
          ? {
              images: true,
            }
          : {}),
      },
      orderBy: [
        ...customOrderQuery,
        ...API.orderByQuery,
        {
          id: 'desc',
        },
      ],
      skip: parseInt(skip || '0') || undefined,
      take: take == '-1' ? undefined : take ? parseInt(take) : 50, //何も指定がない場合は50個制限
    };

    //追加する処理：productの合計を計算
    const totalValues = {
      itemCount: 0,
      customerBase: 0,
      costBase: 0,
      inventoryCount: 0,
      totalSellPrice: 0,
      totalBuyPrice: 0,
    };

    const selectResultPromise = includesDeleted
      ? // eslint-disable-next-line
        //@ts-ignore
        API.db.product.findMany(args)
      : API.db.product.findManyExists(args);
    // const selectResult = await API.db.product.findMany(args);

    let countQueryPromise: Promise<number> | null = null;

    if (includesSummary) {
      //合計まで取得するように指定されていたら
      //以下、要修正
      countQueryPromise = API.db.product.countExists({
        where: {
          AND: [
            {
              store_id: parseInt(store_id || '0'),
            },
            ...structuredClone(whereQuery),
          ],
        },
      });
    }

    const [selectResult, countQueryResult] = await Promise.all([
      //パフォーマンスのため、並列で取得
      selectResultPromise,
      countQueryPromise,
    ]);

    totalValues.itemCount = countQueryResult ?? 0;

    selectResult.forEach((p) => {
      const productModel = new BackendApiProductService(API);
      //@ts-expect-error becuase of because of
      p.displayNameWithMeta = productModel.core.getProductNameWithMeta(p);
      // @ts-expect-error becuase of
      p.store_tax_mode = API.resources.store!.tax_mode;
      // @ts-expect-error becuase of
      p.tags = [];

      //画像を並び順
      //@ts-expect-error becuase of
      if (p.images) {
        //@ts-expect-error becuase of
        p.images.sort((a, b) => a.order_number - b.order_number);
      }
    });

    result = BackendAPI.useFlat(selectResult, {
      condition_option__display_name: 'condition_option_display_name',
      item__myca_item_id: 'item_myca_item_id',
      item__display_name: 'item_name',
      item__rarity: 'item_rarity',
      item__expansion: 'item_expansion',
      item__cardnumber: 'item_cardnumber',
      item__infinite_stock: 'item_infinite_stock',
      item__allow_auto_print_label: 'item_allow_auto_print_label',
      item__category__id: 'item_category_id',
      item__category__display_name: 'item_category_display_name',
      item__genre__id: 'item_genre_id',
      item__genre__display_name: 'item_genre_display_name',
      tag__id: 'tag_id',
      tag__display_name: 'tag_name',
      tag__genre1: 'genre1',
      tag__genre2: 'genre2',
    });

    result = { products: result, totalValues };

    return API.status(200).response({ data: result });
  },
);
