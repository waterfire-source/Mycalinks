import { BackendAPI } from '@/api/backendApi/main';
import {
  Pack_Open_History,
  PackOpenStatus,
  ProductStockHistorySourceKind,
} from '@prisma/client';

import { ApiError } from '@/api/backendApi/error/apiError';
import { openPackApi } from 'api-generator';
import { ApiEvent } from 'backend-core';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { WholesalePriceRecord } from 'backend-core';

//特定の商品（パック）の開封を行う 現在はMycaデータベース上のパックのみ対応
export const POST = BackendAPI.create(
  openPackApi,
  async (API, { params, body }) => {
    const {
      item_count, //開封するパックの数
      item_count_per_pack, //1パック封入枚数
      // staff_account_id, //担当者
      //登録先の商品
      to_products,
      additional_products, //追加在庫
      id,
      asDraft,
      //未登録の商品の処理
      unregister_product_id, //ロスだったらnullを指定する（未指定ではない） ストレージだったらそのproductIdを入れる
      unregister_item_count, //未登録のアイテムの合計数
      unregister_product_wholesale_price, //未登録の商品の仕入れ値
      margin_wholesale_price, //余った仕入れ値
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
        if (to_products)
          await tx.pack_Open_Products.deleteMany({
            where: {
              pack_open_history_id: id,
            },
          });

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
            messageText:
              '新規作成時にadditional_productsを指定することはできません',
          });

        //from_productsが適切か見る
        await fromProduct.core.ifExists({
          item: {
            is: {
              myca_pack_id: {
                not: null, //Mycaのpackに紐づけられているもののみ
              },
            },
          },
        });
      }

      //とりあえずupsertかける
      const createRes = await tx.pack_Open_History.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
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
          item_count,
          item_count_per_pack,
          ...(to_products && {
            to_products: {
              create: to_products,
            },
          }),
          ...(unregister_product_id
            ? {
                unregister_product: {
                  connect: {
                    id: unregister_product_id,
                  },
                },
              }
            : undefined),
          unregister_item_count,
          unregister_product_wholesale_price,
          margin_wholesale_price,
          status: PackOpenStatus.DRAFT,
        },
        update: {
          //staff_account_idのupdateはない
          item_count,
          item_count_per_pack,
          ...(to_products && {
            to_products: {
              create: to_products,
            },
          }),
          ...(unregister_product_id
            ? {
                unregister_product: {
                  connect: {
                    id: unregister_product_id,
                  },
                },
              }
            : undefined),
          unregister_item_count,
          margin_wholesale_price,
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

      //asDraftがつけられていたらこれまで
      if (asDraft) return createRes;

      //完了処理も含めるなら、ここから仕入れ値などをしっかり詰めていく

      let remainingWholesalePrice = createRes.margin_wholesale_price || 0;

      //item_countやitem_count_per_packがなかったらエラー NORMAL商品のパック開封では必要
      if (!createRes.item_count || !createRes.item_count_per_pack)
        throw new ApiError({
          status: 400,
          messageText: 'item_countとitem_count_per_packは必須です',
        });

      //登録する商品と登録しない商品の合計が合計カード数になるか

      const registerItemCount = createRes.to_products.reduce(
        (acc: number, each) => acc + each.item_count,
        0,
      );
      const totalItemCount =
        (createRes.item_count || 0) * (createRes.item_count_per_pack || 0);

      if (totalItemCount != createRes.unregister_item_count + registerItemCount)
        throw new ApiError({
          status: 400,
          messageText: '合計カード数が正しくありません',
        });

      //まずfrom側の在庫調整を行う

      //まず最初にfrom側の在庫調整を行いつつ、仕入れ値を算出する
      const fromProductChangeResult = await fromProduct.core.decreaseStock({
        source_kind: ProductStockHistorySourceKind.pack_opening,
        source_id: createRes.id,
        decreaseCount: createRes.item_count!,
        description: `パック ${createRes.from_product_id} の開封において在庫${createRes.from_product_id} の数量が${createRes.item_count} 減少しました`,
      });

      //カード1枚あたりの仕入れ値を取得（主にオリパ用）
      const unitWholesalePrice =
        (fromProductChangeResult.recordInfo?.totalWholesalePrice || 0) /
        createRes.item_count! /
        (createRes.item_count_per_pack || 0);

      //それぞれの商品をPack_Open_Productsに登録しながら在庫数も変動させていく
      //デッドロック起こさないように一つずつ処理
      for (const product of createRes.to_products) {
        //仕入れ単価が指定されてたら無視して、されてなかったらDBに入れる
        if (!product.wholesale_price) {
          await tx.pack_Open_Products.update({
            where: {
              pack_open_history_id_staff_account_id_product_id: {
                pack_open_history_id: product.pack_open_history_id,
                staff_account_id: product.staff_account_id,
                product_id: product.product_id,
              },
            },
            data: {
              wholesale_price: unitWholesalePrice, //一応残す
            },
          });
        }

        const thisWholesalePrice =
          product.wholesale_price ?? unitWholesalePrice;

        //この商品の在庫数を増やす
        const toProduct = new BackendApiProductService(API, product.product_id);

        // const thisWholesalePriceRecord: WholesalePriceRecord = {
        //   product_id: product.product_id,
        //   unit_price: thisWholesalePrice,
        //   item_count: product.item_count,
        // };

        const thisWholesalePriceRecords: WholesalePriceRecord[] =
          toProduct.core.wholesalePrice.generateRecords({
            totalCount: product.item_count,
            totalWholesalePrice:
              thisWholesalePrice * product.item_count + remainingWholesalePrice, //ここで分配し切る
          });

        remainingWholesalePrice = 0;

        console.log(
          `パック開封で商品${product.product_id}の仕入れ値は${thisWholesalePrice}として登録しました`,
        );

        const changeResult = await toProduct.core.increaseStock({
          source_kind: ProductStockHistorySourceKind.pack_opening,
          source_id: createRes.id,
          increaseCount: product.item_count,
          wholesaleRecords: thisWholesalePriceRecords,
          description: `パック ${createRes.from_product_id} の開封において在庫${product.product_id} の数量が${product.item_count} 増加しました`,
        });

        console.log(changeResult);
      }

      //未登録商品の対応まで行う
      if (createRes.unregister_item_count > 0) {
        //特定の商品に在庫移動する時
        if (createRes.unregister_product_id) {
          //在庫変動させる
          const unregisterProduct = new BackendApiProductService(
            API,
            createRes.unregister_product_id,
          );

          const thisWholesalePrice =
            createRes.unregister_product_wholesale_price ?? unitWholesalePrice;

          const thisWholesalePriceRecord: WholesalePriceRecord = {
            product_id: createRes.unregister_product_id,
            unit_price: thisWholesalePrice,
            item_count: createRes.unregister_item_count,
          };

          console.log(
            `未登録商品の仕入れ値は${thisWholesalePrice}として登録しました`,
          );

          const changeResult = await unregisterProduct.core.increaseStock({
            source_kind: ProductStockHistorySourceKind.pack_opening_unregister,
            source_id: createRes.id,
            increaseCount: createRes.unregister_item_count,
            wholesaleRecords: [thisWholesalePriceRecord],
            description: `パック ${createRes.from_product_id} の開封において、未登録カードとして在庫${createRes.unregister_product_id} の数量が${createRes.unregister_item_count} 増加しました`,
          });
        } else {
          //これは定数として保持しようかと思っている
          //[TODO] この辺りはhandleを使って管理することにする
          //Departmentのところみたいに便利関数を作りたい
          const packOpenLossGenreDisplayName = 'パック開封';

          //パック開封というロス区分があるか確認
          let thisLossGenre = await tx.loss_Genre.findFirst({
            where: {
              store_id: params.store_id,
              display_name: packOpenLossGenreDisplayName,
            },
          });

          if (!thisLossGenre) {
            thisLossGenre = await tx.loss_Genre.create({
              data: {
                store_id: params.store_id,
                display_name: packOpenLossGenreDisplayName,
              },
            });
          }

          //ロス登録だったら それぞれの商品をロスの定義として組み込む
          //ロスにしても、元々あった在庫をロスとして登録したわけではないため、在庫変動履歴を入れる必要がない
          const lossInsertResult = await tx.loss.create({
            data: {
              store_id: params.store_id,
              reason: `Product ID: ${createRes.from_product_id}の開封の余り`,
              staff_account_id: createRes.staff_account_id,
              loss_genre_id: thisLossGenre.id,
              total_item_count: createRes.unregister_item_count,
              //合計販売価格は計算のしようがないためここでは入れない
            },
          });
        }
      }

      //仕入れ値をセットする ついでにステータスを完了にする
      const updateResult = await tx.pack_Open_History.update({
        where: {
          id: createRes.id,
        },
        data: {
          wholesale_price: unitWholesalePrice,
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
