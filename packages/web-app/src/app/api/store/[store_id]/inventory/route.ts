import { BackendAPI } from '@/api/backendApi/main';
import { Inventory, InventoryStatus, ItemStatus, Prisma } from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import { ApiEvent } from 'backend-core';
import { createOrUpdateInventoryApi, getInventoriesApi } from 'api-generator';
import { BackendApiAccountService } from '@/api/backendApi/services/account/main';

//棚卸を登録できるAPI
//IDを指定することで編集できるようにもする
export const POST = BackendAPI.create(
  createOrUpdateInventoryApi,
  async (API, { params, body }) => {
    const {
      id, //任意の棚卸
      item_category_ids,
      item_genre_ids,
      products, //棚卸の商品
      additional_products, //スマホから送信されたもの
      title,
    } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //toとadditional同時に指定されていたらエラー
    if (products && additional_products)
      throw new ApiError(
        createOrUpdateInventoryApi.error.invalidProductsParameter,
      );

    const accountModel = new BackendApiAccountService(API);

    const updateResult = await API.transaction(async (tx) => {
      let currentInventoryInfo: Inventory | null = null;

      //IDが指定されている場合
      if (id) {
        //すでにある情報を取得する
        currentInventoryInfo = await tx.inventory.findUnique({
          where: {
            store_id: params.store_id,
            id,
            status: {
              //終了済み棚卸の編集はできない
              not: InventoryStatus.FINISHED,
            },
          },
        });

        if (!currentInventoryInfo) throw new ApiError('notExist');

        //productsが入っているなら、一度既存のものを削除
        if (products) {
          await tx.inventory_Products.deleteMany({
            where: {
              inventory_id: id,
            },
          });
        }

        if (item_category_ids) {
          await tx.inventory_Category.deleteMany({
            where: {
              inventory_id: id,
            },
          });
        }

        if (item_genre_ids) {
          await tx.inventory_Genre.deleteMany({
            where: {
              inventory_id: id,
            },
          });
        }

        //additional_productsが指定されていたら一つ一つ対応していく
        if (additional_products) {
          for (const product of additional_products) {
            //すでにあったらカウントアップし、なかったら追加
            await tx.inventory_Products.upsert({
              where: {
                inventory_id_staff_account_id_shelf_id_product_id: {
                  inventory_id: id,
                  shelf_id: product.shelf_id,
                  staff_account_id,
                  product_id: product.product_id,
                },
              },
              create: {
                inventory_id: id,
                ...product,
                staff_account_id,
              },
              update: {
                //すでにある組み合わせの場合、足す
                item_count: {
                  increment: product.item_count,
                },
              },
            });
          }
        }
      } else {
        //指定されていない場合、ちゃんと情報が足りてるか確認

        //新規登録時
        //additionalを指定してたら変なためエラー
        if (additional_products)
          throw new ApiError(
            createOrUpdateInventoryApi.error.additionalProductsWhenCreate,
          );

        if (!staff_account_id)
          throw new ApiError({
            status: 400,
            messageText: '従業員IDが指定されていません',
          });
      }

      //作成する
      const updateResult = await tx.inventory.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
          store: {
            connect: {
              id: params.store_id,
            },
          },
          title,
          ...(item_category_ids
            ? {
                item_categories: {
                  create: item_category_ids.map((e) => ({
                    item_category: {
                      connect: {
                        id: e.id!,
                      },
                    },
                  })),
                },
              }
            : null),
          ...(item_genre_ids
            ? {
                item_genres: {
                  create: item_genre_ids.map((e) => ({
                    item_genre: {
                      connect: {
                        id: e.id!,
                      },
                    },
                  })),
                },
              }
            : null),
          staff_account: await accountModel.getStaffQuery(),
          products: {
            //商品の定義
            create: (products || []).map((each) => ({
              shelf: {
                connect: {
                  id: each.shelf_id,
                },
              },
              product: {
                connect: {
                  id: each.product_id,
                },
              },
              staff_account: {
                connect: {
                  id: each.staff_account_id,
                },
              },
              item_count: each.item_count,
              input_total_wholesale_price: each.input_total_wholesale_price,
            })),
          },
        },
        update: {
          title,
          products: {
            //商品の定義
            create: (products || []).map((each) => ({
              shelf: {
                connect: {
                  id: each.shelf_id,
                },
              },
              product: {
                connect: {
                  id: each.product_id,
                },
              },
              staff_account: {
                connect: {
                  id: each.staff_account_id,
                },
              },
              item_count: each.item_count,
              input_total_wholesale_price: each.input_total_wholesale_price,
            })),
          },
        },
        include: {
          item_categories: true,
          item_genres: true,
          products: {
            include: {
              product: {
                select: {
                  actual_sell_price: true,
                  stock_number: true,
                },
              },
              staff_account: {
                select: {
                  display_name: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      return updateResult;
    });

    //統計をとる

    //指定の部門の実際の商品数を全て取得する
    const whereQuery: Prisma.ProductWhereInput = {};

    whereQuery.item = {
      status: ItemStatus.PUBLISH,
      infinite_stock: false, //無限在庫は対象外
      ...(updateResult.item_categories.length
        ? {
            category_id: {
              in: updateResult.item_categories.map((e) => e.item_category_id),
            },
          }
        : null),
      ...(updateResult.item_genres.length
        ? {
            genre_id: {
              in: updateResult.item_genres.map((e) => e.item_genre_id),
            },
          }
        : null),
    };

    const allTargetProducts = await API.db.product.findManyExists({
      where: {
        store_id: params.store_id,
        stock_number: {
          gt: 0,
        },
        consignment_client_id: null,
        ...whereQuery,
      },
      select: {
        id: true,
        stock_number: true,
        actual_sell_price: true,
        total_wholesale_price: true,
      },
    });

    //合計系の値を作っていく
    let summary = {
      total_item_count: 0,
      total_item_sell_price: 0,
      total_item_wholesale_price: 0,
      total_stock_number: 0,
      total_stock_sell_price: 0,
      total_stock_wholesale_price: 0,
    };

    //実際の在庫の統計
    summary = allTargetProducts.reduce((acc, product) => {
      const sellPrice = product.actual_sell_price ?? 0;
      const stockNumber = product.stock_number ?? 0;
      const wholesalePrice = product.total_wholesale_price ?? 0;

      acc.total_stock_number += stockNumber;
      acc.total_stock_sell_price += stockNumber * sellPrice;
      acc.total_stock_wholesale_price += wholesalePrice;

      return summary;
    }, summary);

    //棚卸の方の統計
    summary = updateResult.products.reduce((acc, product) => {
      const sellPrice = product.product.actual_sell_price ?? 0;
      const stockNumber = product.item_count ?? 0;
      const wholesalePrice = product.input_total_wholesale_price ?? 0;

      acc.total_item_wholesale_price += wholesalePrice;
      acc.total_item_count += stockNumber;
      acc.total_item_sell_price += stockNumber * sellPrice;

      return summary;
    }, summary);

    //Inventoryの方を更新する
    const summaryUpdateResult: typeof updateResult = Object.assign(
      await API.db.inventory.update({
        where: {
          id: updateResult.id,
        },
        data: {
          ...summary,
        },
      }),
      {
        products: updateResult.products,
        item_genres: updateResult.item_genres,
        item_categories: updateResult.item_categories,
      },
    );

    //この下から今の販売価格をInventory_Productsに格納していく
    //また、この時点での店の名前も格納していく

    const allShelves = await API.db.inventory_Shelf.findMany({
      where: {
        store_id: params.store_id,
      },
      select: {
        id: true,
        display_name: true,
      },
    });

    await Promise.all(
      summaryUpdateResult.products.map(async (p) => {
        const sellPrice = p.product.actual_sell_price ?? 0;
        const stockNumber = p.product.stock_number ?? 0;
        const thisShelfInfo = allShelves.find((e) => e.id === p.shelf_id);

        await API.db.inventory_Products.update({
          where: {
            inventory_id_staff_account_id_shelf_id_product_id: {
              inventory_id: p.inventory_id,
              shelf_id: p.shelf_id,
              product_id: p.product_id,
              staff_account_id: p.staff_account_id,
            },
          },
          data: {
            unit_price: sellPrice,
            current_stock_number: stockNumber,
            shelf_name: thisShelfInfo?.display_name, //この時点での棚の名前を格納する
          },
        });
      }),
    );

    console.log('棚卸の後続の非同期処理が終わりました');

    //この時点で作成・更新通知を出す
    const apiEvent = new ApiEvent({
      type: 'inventory',
      service: API,
      specificResourceId: summaryUpdateResult.id,
      obj: summaryUpdateResult,
    });

    await apiEvent.emit();

    return summaryUpdateResult;
  },
);

//条件を指定して、棚卸の情報を取得するAPI
export const GET = BackendAPI.create(
  getInventoriesApi,
  async (API, { params, query }) => {
    const whereQuery: any = {};

    Object.entries(query).forEach(([prop, value]: any) => {
      switch (prop) {
        case 'id':
          whereQuery[prop] = parseInt(value || '0');
          break;

        case 'status': //こちらはあくまでもステータス
          whereQuery[prop] = value;
          break;

        case 'genre_id':
          // 棚卸しの対象ジャンルに指定されたジャンルIDが含まれている場合
          whereQuery.item_genres = {
            some: {
              item_genre_id: parseInt(value || '0'),
            },
          };
          break;

        case 'category_id':
          // 棚卸しの対象カテゴリに指定されたカテゴリIDが含まれている場合
          whereQuery.item_categories = {
            some: {
              item_category_id: parseInt(value || '0'),
            },
          };
          break;

        default:
          return false;
      }
    });

    // 総件数を取得
    const totalCount = await API.db.inventory.count({
      where: {
        ...whereQuery,
        store_id: params.store_id,
      },
    });

    const selectResult = await API.db.inventory.findMany({
      where: {
        ...whereQuery,
        store_id: params.store_id,
      },
      include: {
        item_categories: true,
        item_genres: true,
      },
      orderBy: [
        {
          id: 'desc',
        },
      ],
      ...API.limitQuery,
    });

    return {
      inventories: selectResult,
      totalCount,
    };
  },
);
