import { BackendAPI } from '@/api/backendApi/main';
import {
  ItemCategoryHandle,
  ItemStatus,
  Original_Pack_Product,
  Pack_Open_History,
  PackOpenStatus,
  ProductStockHistorySourceKind,
  WholesalePriceHistoryResourceType,
} from '@prisma/client';

import { ApiError } from '@/api/backendApi/error/apiError';
import { releaseOriginalPackApi } from 'api-generator';
import { ApiEvent } from 'backend-core';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
//オリジナルパックの解体を行うAPI
//残っている在庫全てを解体する前提

//特定の商品（パック）の開封を行う 現在はMycaデータベース上のパックのみ対応
export const POST = BackendAPI.create(
  releaseOriginalPackApi,
  async (API, { params, body }) => {
    let {
      // staff_account_id, //担当者
      //登録先の商品
      to_products,
      additional_products, //追加在庫
      id,
      asDraft,
      itemCount,
    } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //toとadditional同時に指定されていたらエラー
    if (to_products && additional_products)
      throw new ApiError({
        status: 400,
        messageText:
          'to_productsとadditional_productsを同時に指定することはできません',
      });

    const fromProduct = new BackendApiProductService(
      API,
      Number(params.product_id),
    );

    const txResult = await API.transaction(async (tx) => {
      //更新モードかどうかを確認
      let currentInfo: Pack_Open_History | null = null;

      if (id) {
        //存在するか確認
        currentInfo = await tx.pack_Open_History.findUnique({
          where: {
            id,
            from_product: {
              store_id: params.store_id,
            },
            status: PackOpenStatus.DRAFT, //下書きのものに限る
          },
        });

        if (!currentInfo) throw new ApiError('notExist');

        //to_productsが指定されてたら一度削除する
        if (to_products) {
          await tx.pack_Open_Products.deleteMany({
            where: {
              pack_open_history_id: id,
            },
          });
        }

        //additional_productsが指定されていたら一つ一つ対応していく
        if (additional_products) {
          for (const product of additional_products) {
            //すでにあったらカウントアップし、なかったら追加
            await tx.pack_Open_Products.upsert({
              where: {
                pack_open_history_id_staff_account_id_product_id: {
                  pack_open_history_id: id,
                  staff_account_id,
                  product_id: product.product_id,
                },
              },
              create: {
                pack_open_history_id: id,
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
          throw new ApiError({
            status: 400,
            messageText: '新規登録時にadditional_productsは指定できません',
          });

        //from_productsが適切か見る
        await fromProduct.core.ifExists({
          item: {
            category: {
              handle: {
                in: [
                  ItemCategoryHandle.ORIGINAL_PACK,
                  ItemCategoryHandle.LUCKY_BAG,
                  ItemCategoryHandle.DECK,
                ],
              },
            }, //オリパ
            status: ItemStatus.PUBLISH, //作成済み
          },
        });
      }

      if (to_products) {
        //to_products内に同じstaff_account_idで同じproduct_idがあったら束ねる
        to_products = to_products.reduce<typeof to_products>((acc, cur) => {
          //accに同じstaff_account_idで同じproduct_idがあったら束ねる
          const already = acc.find(
            (p) =>
              p.staff_account_id === cur.staff_account_id &&
              p.product_id === cur.product_id,
          );

          if (already) {
            already.item_count += cur.item_count;
          } else {
            acc.push(cur);
          }

          return acc;
        }, []);
      }

      //とりあえずupsertかける
      const createRes = await tx.pack_Open_History.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
          item_count: itemCount,
          from_product: {
            connect: {
              id: params.product_id,
            },
          },
          staff_account: {
            connect: {
              id: staff_account_id ?? 0,
            },
          },
          ...(to_products && {
            to_products: {
              create: to_products,
            },
          }),
          status: PackOpenStatus.DRAFT,
        },
        update: {
          item_count: itemCount,
          //staff_account_idのupdateはない
          ...(to_products && {
            to_products: {
              create: to_products,
            },
          }),
        },
        include: {
          from_product: {
            include: {
              item: {
                include: {
                  original_pack_products: true,
                },
              },
            },
          },
          to_products: {
            include: {
              staff_account: {
                select: {
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

      //完了処理も含めるなら、ここから仕入れ値などをしっかり詰めていく

      //itemCountがなかったらエラー
      if (createRes.item_count === undefined || createRes.item_count === null)
        throw new ApiError({
          status: 400,
          messageText:
            '解体を完了させるためには解体数を指定する必要があります。',
        });

      //まずfrom側の在庫調整を行う
      const fromProductInfo = createRes.from_product;

      //オリパ定義を一回全て削除する
      await tx.original_Pack_Product.deleteMany({
        where: {
          item_id: fromProductInfo.item_id,
        },
      });

      let newOriginalPackProducts: Original_Pack_Product[] =
        fromProductInfo.item.original_pack_products;

      //それぞれの商品をPack_Open_Productsに登録しながら在庫数も変動させていく
      //デッドロック起こさないように一つずつ処理
      for (const product of createRes.to_products) {
        if (product.item_count <= 0) continue;

        //オリパ定義から消す
        for (let i = 0; i < product.item_count; i++) {
          //newOriginalPackProductsからこのproduct_idを適当に一つ取り出す
          const target = newOriginalPackProducts.find(
            (p) => p.product_id === product.product_id && p.item_count > 0,
          );

          if (!target)
            throw new ApiError({
              status: 500,
              messageText: 'オリパ定義に存在しない商品を選択しています',
            });

          //在庫数を減らす
          target.item_count--;
        }

        //item_countが0のものは間引く
        newOriginalPackProducts = newOriginalPackProducts.filter(
          (p) => p.item_count > 0,
        );

        const toProduct = new BackendApiProductService(API, product.product_id);

        //使う仕入れ値レコードを取得する
        const thisWholesaleRecords =
          await toProduct.core.wholesalePrice.getRecords({
            spend: true, //消費する
            item_count: product.item_count,
            reverse: true, //逆順
            resource_type: WholesalePriceHistoryResourceType.ORIGINAL_PACK,
            resource_id: fromProductInfo.item_id,
          });

        //仕入れ値が足りなかったらおかしいためエラー
        if (thisWholesaleRecords.nothingCount)
          throw new ApiError({
            status: 500,
            messageText:
              '指定された在庫の仕入れ値がオリパに結びついていません、もしくはオリパ定義に含まれない在庫が指定されています',
          });

        const changeResult = await toProduct.core.increaseStock({
          source_kind: ProductStockHistorySourceKind.original_pack_release,
          increaseCount: product.item_count,
          wholesaleRecords: thisWholesaleRecords.useRecords,
          description: `オリジナルパック ${fromProductInfo.id} の開封において在庫${product.product_id} の数量が${product.item_count} 増加しました`,
        });

        await tx.pack_Open_Products.update({
          where: {
            pack_open_history_id_staff_account_id_product_id: {
              pack_open_history_id: product.pack_open_history_id,
              staff_account_id: product.staff_account_id,
              product_id: product.product_id,
            },
          },
          data: {
            wholesale_price: Math.round(
              thisWholesaleRecords.totalWholesalePrice / product.item_count,
            ), //一応残す
          },
        });
      }

      //from側の在庫調整を行いつつ、仕入れ値を算出する
      //初期在庫数を変えておく
      await tx.item.update({
        where: {
          id: fromProductInfo.item_id,
        },
        data: {
          init_stock_number: {
            decrement: createRes.item_count,
          },
        },
      });

      if (createRes.item_count > 0) {
        const fromProductChangeResult = await fromProduct.core.decreaseStock({
          source_kind: ProductStockHistorySourceKind.original_pack_release,
          decreaseCount: createRes.item_count,
          description: `オリジナルパック ${createRes.from_product_id} の開封において在庫${createRes.from_product_id} の数量が${fromProductInfo.stock_number} 減少しました`,
        });
      }

      //ステータスを完了にする
      const updateResult = await tx.pack_Open_History.update({
        where: {
          id: createRes.id,
        },
        data: {
          // wholesale_price: unitWholesalePrice,
          status: PackOpenStatus.FINISHED,
        },
        include: {
          to_products: {
            include: {
              staff_account: {
                select: {
                  display_name: true,
                  // kind: true,
                },
              },
            },
          },
        },
      });

      await tx.original_Pack_Product.createMany({
        data: newOriginalPackProducts,
      });

      return updateResult;
    });

    //この時点で作成・更新通知を出す
    const apiEvent = new ApiEvent({
      type: 'packOpenHistory',
      service: API,
      specificResourceId: txResult.id,
      obj: txResult,
    });

    await apiEvent.emit(); //イベントを発する

    return txResult;
  },
);
