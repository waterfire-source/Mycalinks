import { BackendAPI } from '@/api/backendApi/main';
import {
  Item,
  ItemCategoryHandle,
  ItemStatus,
  ProductStockHistorySourceKind,
} from '@prisma/client';

import { ApiError } from '@/api/backendApi/error/apiError';
import { ApiEvent } from 'backend-core';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendApiDepartmentService } from '@/api/backendApi/services/department/main';
import { BackendApiItemService } from '@/api/backendApi/services/item/main';
import { createOriginalPackApi } from 'api-generator';
//オリパ作成を行うAPI
//オリパ作成を完了させた場合、自動で在庫が生成される

export const POST = BackendAPI.create(
  createOriginalPackApi,
  async (API, { params, body }) => {
    let {
      // staff_account_id, //担当者
      //定義の商品
      products,
      additional_products, //追加在庫
      id,
      asDraft,

      display_name,
      init_stock_number,
      sell_price,
      image_url,
      genre_id,
      category_id,
    } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //productsとadditional同時に指定されていたらエラー
    if (products && additional_products)
      throw new ApiError(createOriginalPackApi.error.invalidProductsParameter);

    const txResult = await API.transaction(async (tx) => {
      //更新モードかどうかを確認
      let currentInfo: Item | null = null;

      const departmentModel = new BackendApiDepartmentService(API);
      const originalPackCategoryInfo =
        await departmentModel.core.createFixedItemCategory(
          ItemCategoryHandle.ORIGINAL_PACK,
        );

      const luckyBagCategoryInfo =
        await departmentModel.core.createFixedItemCategory(
          ItemCategoryHandle.LUCKY_BAG,
        );

      const deckCategoryInfo =
        await departmentModel.core.createFixedItemCategory(
          ItemCategoryHandle.DECK,
        );

      //どっちのカテゴリを指定されているか確認
      if (category_id) {
        if (
          category_id != originalPackCategoryInfo.id &&
          category_id != luckyBagCategoryInfo.id &&
          category_id != deckCategoryInfo.id
        )
          throw new ApiError({
            status: 400,
            messageText:
              'オリジナルパックか福袋かデッキのカテゴリしか指定できません',
          });
      } else {
        category_id = originalPackCategoryInfo.id;
      }

      if (id) {
        //存在するか確認
        currentInfo = await tx.item.findUnique({
          where: {
            id,
            store_id: params.store_id,
            status: ItemStatus.DRAFT, //下書きのものに限る
            category: {
              handle: {
                in: [
                  ItemCategoryHandle.ORIGINAL_PACK,
                  ItemCategoryHandle.LUCKY_BAG,
                  ItemCategoryHandle.DECK,
                ],
              },
            }, //オリパに限る
          },
        });

        if (!currentInfo) throw new ApiError('notExist');

        //productsが指定されてたら一度削除する
        if (products)
          await tx.original_Pack_Product.deleteMany({
            where: {
              item_id: id,
            },
          });

        //additional_productsが指定されていたら一つ一つ対応していく
        if (additional_products) {
          for (const product of additional_products) {
            //すでにあったらカウントアップし、なかったら追加
            await tx.original_Pack_Product.upsert({
              where: {
                item_id_process_id_staff_account_id_product_id: {
                  item_id: id,
                  process_id: 'original', //初回作成のもののみ
                  staff_account_id,
                  product_id: product.product_id,
                },
              },
              create: {
                item_id: id,
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
        //新規登録時
        //additionalを指定してたら変なためエラー
        if (additional_products)
          throw new ApiError(
            createOriginalPackApi.error.additionalProductsWhenCreate,
          );

        //ジャンル指定してなかったらエラー
        if (!genre_id)
          throw new ApiError({
            status: 400,
            messageText: 'ジャンルが指定されていません',
          });
      }

      //とりあえずupsertかける
      const createRes = await tx.item.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
          sell_price,
          init_stock_number,
          display_name,
          image_url,
          store: {
            connect: {
              id: params.store_id,
            },
          },
          category: {
            connect: {
              id: category_id,
            },
          },
          genre: {
            connect: {
              id: genre_id ?? 0,
            },
          },
          ...(products && {
            original_pack_products: {
              create: products,
            },
          }),
          status: ItemStatus.DRAFT,
        },
        update: {
          sell_price,
          init_stock_number,
          display_name,
          image_url,
          ...(genre_id
            ? {
                genre: {
                  connect: {
                    id: genre_id,
                    store_id: params.store_id,
                  },
                },
              }
            : null),
          ...(products && {
            original_pack_products: {
              create: products,
            },
          }),
        },
        include: {
          original_pack_products: {
            include: {
              staff_account: {
                select: {
                  id: true,
                  display_name: true,
                  // kind: true,
                },
              },
            },
          },
        },
      });

      //asDraftがつけられていたらこれまで
      if (asDraft) return createRes;

      //ここからは完了処理を行うとき

      //完了時に必要な情報
      if (!createRes.init_stock_number || !createRes.sell_price)
        throw new ApiError(createOriginalPackApi.error.notEnoughToFinish);

      //担当者のIDも必要
      if (!staff_account_id)
        throw new ApiError(createOriginalPackApi.error.noStaffAccountId);

      //在庫を生成する
      const thisItem = new BackendApiItemService(API, createRes.id);

      const productIds = await thisItem.core.createProducts({
        needIds: true,
      });

      if (!productIds.length)
        throw new ApiError(createOriginalPackApi.error.failedToCreateProducts);

      const thisProduct = new BackendApiProductService(API, productIds[0]);

      //在庫を増やす
      const changeResult = await thisProduct.core.increaseStock({
        source_kind: ProductStockHistorySourceKind.original_pack,
        source_id: createRes.id,
        increaseCount: createRes.init_stock_number,
        description: `オリパ${createRes.id} の作成を行いました`,
      });

      // ステータスをPUBLISHにしつつ部門を入れる
      const updateRes = await tx.item.update({
        where: {
          id: createRes.id,
        },
        data: {
          status: ItemStatus.PUBLISH,
        },
        include: {
          original_pack_products: {
            include: {
              staff_account: {
                select: {
                  display_name: true,
                  // kind: true,
                },
              },
            },
          },
          products: true,
        },
      });

      return updateRes;
    });

    //この時点で作成・更新通知を出す
    const apiEvent = new ApiEvent({
      type: 'item',
      service: API,
      specificResourceId: txResult.id,
      obj: txResult,
    });

    await apiEvent.emit(); //イベントを発する

    return txResult;
  },
);
