import { BackendAPI } from '@/api/backendApi/main';
import {
  Ec_Order,
  EcOrderStatus,
  EcPaymentMethod,
  EcPlatform,
  Prisma,
  Product,
  Store,
} from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { MycaAppUser } from '@/types/BackendAPI';
import { BackendApiEcOrderService } from '@/api/backendApi/services/ec/order/main';
import { BackendApiEcPaymentService } from '@/api/backendApi/services/ec/payment/main';
import { Item_Category_Condition_Option } from '@prisma/client';
import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import {
  ApiResponse,
  createOrUpdateEcOrderApi,
  getEcOrderApi,
} from 'api-generator';
import { CustomCrypto } from 'common';
import { ShippingCandidates } from 'backend-core';
import { BackendApiEcShippingService } from '@/api/backendApi/services/ec/shipping/main';

//顧客用オーダー作成、更新API
export const POST = BackendAPI.create(
  createOrUpdateEcOrderApi,
  async (API, { body, query }) => {
    //更新モードだったら
    let currentInfo: Ec_Order | null = null;

    let { code, shipping_address_prefecture, cart_stores } = body;

    const mycaUserId = API.mycaUser?.id;
    // const mycaUserId = 123491; //俺のMycaId
    const mycaAppClient = new BackendApiMycaAppService(API);

    let mycaUserInfo: MycaAppUser | null = null;
    if (mycaUserId) {
      mycaUserInfo = await mycaAppClient.core.user.getInfo({
        user: mycaUserId,
      });
    }

    shipping_address_prefecture =
      shipping_address_prefecture || mycaUserInfo?.prefecture || '';

    //codeを指定している場合、存在するか確認
    if (code) {
      //存在するか確認
      //必要に応じてクラス化する
      currentInfo = await API.db.ec_Order.findUnique({
        where: {
          code,
          status: EcOrderStatus.DRAFT, //下書きじゃないとだめ
          myca_user_id: mycaUserId, //Mycaユーザーだったら、自分が作ったやつじゃないといけない
        },
      });
    }
    //新規作成の時、Mycaアプリ会員の場合すでにあったらそれを更新する形で作成する
    else if (mycaUserId) {
      const currentDrafts = await API.db.ec_Order.findMany({
        where: {
          myca_user_id: mycaUserId,
          status: EcOrderStatus.DRAFT,
        },
        orderBy: {
          id: 'desc',
        },
      });

      currentInfo = currentDrafts[0] ?? null;

      //2つ以上あったら2つ目以降のやつをキャンセルにする 一旦物理削除でOKそう
      for (const draft of currentDrafts.slice(1)) {
        await API.db.ec_Order.delete({
          where: {
            id: draft.id,
          },
        });
      }

      if (currentInfo) {
        code = currentInfo.code;
      }
    }

    //ストアごとのカートの中身を見ていく
    //この下あたりの処理は関数化したい
    const storeCartData: Map<
      Store['id'],
      {
        shipping_fee: number;
        total_price: number;
        shippingCandidates: ShippingCandidates;
      }
    > = new Map();

    const productData: Map<
      Product['id'],
      {
        total_unit_price: number;
      }
    > = new Map();

    //不足在庫
    const insufficientProducts: Array<{
      product_id: Product['id'];
      insufficient_count: number;
      item: {
        id: mycaItem['id']; //MycaアイテムID
        cardname: mycaItem['cardname']; //カード名
        rarity: mycaItem['rarity']; //レアリティ
        expansion: mycaItem['expansion']; //エキスパンション
        cardnumber: mycaItem['cardnumber']; //型番
        full_image_url: mycaItem['full_image_url']; //画像URL
      }; //Mycaアイテム情報
      condition_option: {
        handle: Item_Category_Condition_Option['handle']; //状態ハンドル
      };
    }> = [];

    const notExistProducts: Array<{
      product_id: Product['id'];
    }> = [];

    for (const store of cart_stores) {
      //全ての商品情報を取得しておく
      const [allProductInfo, ecSetting] = await Promise.all([
        API.db.product.findManyExists({
          where: {
            id: {
              in: store.products.map((e) => e.product_id),
            },
            store_id: store.store_id,
            mycalinks_ec_enabled: true,
          },
          include: {
            item: true,
            condition_option: {
              select: {
                handle: true,
              },
            },
          },
        }),
        API.db.ec_Setting.findUnique({
          where: {
            store_id: store.store_id,
          },
          select: {
            same_day_limit_hour: true,
            shipping_days: true,
            closed_day: true,
            enable_same_day_shipping: true,
            free_shipping_price: true,
          },
        }),
      ]);

      // MycaItemの情報を取得
      const mycaItemIds = allProductInfo.map((p) => p.item.myca_item_id);
      const mycaItems =
        mycaItemIds.length > 0
          ? await mycaAppClient.core.item.getAllDetail(
              {
                id: mycaItemIds,
              },
              {
                detail: 1,
              },
            )
          : [];

      //在庫数を確認する 同時に重量計算
      const productTotal = store.products.reduce(
        (curSum, p) => {
          //数量0のやつは弾いておく
          if (p.original_item_count == 0)
            throw new ApiError({
              status: 400,
              messageText: `数量0の商品が入っています`,
            });

          const thisProductInfo = allProductInfo.find(
            (e) => e.id == p.product_id,
          );
          if (!thisProductInfo) {
            //存在しなかった在庫として記録する
            notExistProducts.push({
              product_id: p.product_id,
            });

            return curSum;
          }

          //在庫数が足りるか確認
          if (thisProductInfo.ec_stock_number - p.original_item_count < 0) {
            console.log(
              `【在庫数エラー】 在庫ID:${p.product_id} の在庫が足りません`,
            );

            const thisMycaItem = mycaItems.find(
              (i) => i.id === thisProductInfo.item.myca_item_id,
            );

            if (!thisMycaItem)
              throw new ApiError({
                status: 404,
                messageText: 'Mycaアイテムが見つかりませんでした',
              });

            //不足在庫を記録
            insufficientProducts.push({
              product_id: p.product_id,
              insufficient_count:
                p.original_item_count - thisProductInfo.ec_stock_number,
              item: {
                id: thisMycaItem.id,
                cardname: thisMycaItem.cardname,
                rarity: thisMycaItem.rarity,
                expansion: thisMycaItem.expansion,
                cardnumber: thisMycaItem.cardnumber,
                full_image_url: thisMycaItem.full_image_url,
              },
              condition_option: thisProductInfo.condition_option!,
            });

            //とりあえず購入できる分を入れる
            p.original_item_count = thisProductInfo.ec_stock_number;
          }

          //重量を計算
          const thisWeight =
            thisProductInfo.item.weight * p.original_item_count;
          if (!thisProductInfo.actual_ec_sell_price)
            throw new ApiError({
              status: 500,
              messageText: `在庫ID:${p.product_id} の価格は設定されていません`,
            });

          const thisPrice =
            thisProductInfo.actual_ec_sell_price * p.original_item_count;

          curSum.weight += thisWeight;
          curSum.total_price += thisPrice;

          productData.set(p.product_id, {
            total_unit_price: thisProductInfo.actual_ec_sell_price,
          });

          return curSum;
        },
        {
          weight: 0,
          total_price: 0,
        },
      );

      //productTotalが0だったら飛ばす
      if (productTotal.total_price == 0) continue;

      //配送IDやincludesCandidates指定されていたらこの時点で配送方法候補を算出
      let shippingCandidates: ShippingCandidates = [];
      let shippingFee = 0;
      if (query.includesShippingMethodCandidates || store.shipping_method_id) {
        const shippingModel = new BackendApiEcShippingService(API);
        shippingModel.core.setIds({
          storeId: store.store_id,
        });

        shippingCandidates =
          await shippingModel.core.getAvailableShippingMethods({
            weight: productTotal.weight,
            prefecture: shipping_address_prefecture,
            allShippingMethods: undefined,
            totalPrice: productTotal.total_price,
            ecSetting: ecSetting!,
          });

        //まだ配送方法が選ばれていない場合、適当に選ぶ
        if (!store.shipping_method_id && shippingCandidates.length > 0) {
          store.shipping_method_id = shippingCandidates[0].id;
        }

        if (store.shipping_method_id) {
          const shippingMethod = shippingCandidates.find(
            (e) => e.id == store.shipping_method_id,
          );

          if (!shippingMethod)
            throw new ApiError({
              status: 400,
              messageText: `storeId:${store.store_id} の配送方法ID:${store.shipping_method_id} はこの注文では利用できません`,
            });

          shippingFee = shippingMethod.fee;
        }
      }

      //合計値をセット
      storeCartData.set(store.store_id, {
        shipping_fee: shippingFee,
        total_price: productTotal.total_price + shippingFee,
        shippingCandidates,
      });
    }

    //合計値を計算
    let shipping_total_fee = 0;
    let total_price = 0;

    storeCartData.forEach((e) => {
      shipping_total_fee += e.shipping_fee;
      total_price += e.total_price;
    });

    //upsertする
    const txRes = await API.transaction(async (tx) => {
      //作成更新の共通クエリ
      const commonQuery = {
        customer_name: mycaUserInfo?.full_name,
        customer_email: mycaUserInfo?.mail,
        customer_phone: mycaUserInfo?.phone_number,
        customer_name_ruby: mycaUserInfo?.full_name_ruby,
        shipping_address: mycaUserInfo
          ? mycaAppClient.core.user.getUserFullAddress(mycaUserInfo)
          : undefined,
        shipping_address_prefecture,
        customer_address_info_json: mycaUserInfo
          ? mycaAppClient.core.user.getUserFullAddressInfo(mycaUserInfo)
          : undefined,
        shipping_total_fee,
        total_price,
        cart_stores: {
          create: cart_stores
            .map((s) => {
              const thisStoreCartData = storeCartData.get(s.store_id);
              if (!thisStoreCartData) return null;

              return {
                code: CustomCrypto.generateEcOrderCartCode(),
                store: {
                  connect: {
                    id: s.store_id,
                  },
                },
                ...(s.shipping_method_id
                  ? {
                      shipping_method: {
                        connect: {
                          id: s.shipping_method_id,
                        },
                      },
                    }
                  : null),
                shipping_fee: thisStoreCartData.shipping_fee,
                total_price: thisStoreCartData.total_price,
                products: {
                  create: s.products
                    .map((p) => {
                      const thisProductInfo = productData.get(p.product_id);

                      if (!thisProductInfo) return null;

                      return {
                        product: {
                          connect: {
                            id: p.product_id,
                          },
                        },
                        total_unit_price: thisProductInfo.total_unit_price,
                        original_item_count: p.original_item_count,
                        item_count: p.original_item_count,
                      };
                    })
                    .filter((e) => e !== null),
                },
              };
            })
            .filter((e) => e !== null),
        },
      };

      //更新の場合、先にcart_storesを消しておく
      if (code) {
        await tx.ec_Order.update({
          where: {
            code,
          },
          data: {
            cart_stores: {
              deleteMany: {},
            },
          },
        });
      }

      const upsertRes = await tx.ec_Order.upsert({
        where: {
          code: code ?? '',
        },
        create: {
          myca_user_id: mycaUserId,
          code: CustomCrypto.generateUuidV7(),
          ...commonQuery,
        },
        update: {
          ...commonQuery,
        },
        select: {
          code: true,
          id: true,
          customer_phone: true,
          customer_email: true,
          customer_name: true,
          shipping_address: true,
          shipping_total_fee: true,
          total_price: true,
          shipping_address_prefecture: true,
          cart_stores: {
            select: {
              total_price: true,
              shipping_fee: true,
              store_id: true,
              shipping_method_id: true,
              products: {
                select: {
                  product_id: true,
                  original_item_count: true,
                  total_unit_price: true,
                  product: {
                    select: {
                      condition_option: {
                        select: {
                          handle: true,
                        },
                      },
                      item: {
                        select: {
                          myca_item_id: true,
                        },
                      },
                      images: {
                        select: {
                          image_url: true,
                          description: true,
                          order_number: true,
                        },
                      },
                      description: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      //candidatesが指定されている時、一工夫
      if (query.includesShippingMethodCandidates) {
        upsertRes.cart_stores.forEach((cs) => {
          //@ts-expect-error becuase of because of
          cs.shippingMethodCandidates = storeCartData.get(
            cs.store_id,
          )!.shippingCandidates;
        });
      }

      return upsertRes;
    });

    const paymentService = new BackendApiEcPaymentService(API);

    //paymentMethodの候補を取得していく
    if (query.includesPaymentMethodCandidates) {
      let candidates: Set<EcPaymentMethod> = new Set(
        paymentService.core.config.paymentMethods.all,
      );

      if (!txRes.cart_stores.every((e) => e.shipping_method_id))
        throw new ApiError({
          status: 400,
          messageText:
            '支払い方法の候補を取得するには配送方法を指定する必要があります',
        });

      //ストアのEC設定と、指定されている配送方法の情報を取得する 関数化するかも
      const [delayedPaymentMethod, shippingMethods] = await Promise.all([
        API.db.ec_Setting.findMany({
          where: {
            store_id: {
              in: txRes.cart_stores.map((e) => e.store_id),
            },
          },
          select: {
            delayed_payment_method: true,
          },
        }),
        API.db.shipping_Method.findMany({
          where: {
            id: {
              in: txRes.cart_stores.map((e) => e.shipping_method_id!),
            },
          },
          select: {
            enabled_cash_on_delivery: true,
          },
        }),
      ]);

      //それぞれ見ていく

      //非即時決済
      delayedPaymentMethod.forEach((s) => {
        const splitted = s.delayed_payment_method.split(',');

        //ない方法があったら消す
        candidates.forEach((e) => {
          if (!splitted.includes(e)) candidates.delete(e);
        });
      });

      //代引き
      if (!shippingMethods.every((e) => e.enabled_cash_on_delivery)) {
        candidates.delete(EcPaymentMethod.CASH_ON_DELIVERY);
      }

      //カードは追加する
      candidates = candidates.union(
        new Set(paymentService.core.config.paymentMethods.immediate),
      );

      // @ts-expect-error becuase of
      txRes.paymentMethodCandidates = [...candidates];
    }

    //不足在庫を記録
    if (insufficientProducts.length > 0) {
      //@ts-expect-error becuase of because of
      txRes.insufficientProducts = insufficientProducts;
    }

    //@ts-expect-error becuase of because of
    txRes.notExistProducts = notExistProducts;

    // Sort images by order_number in POST response
    txRes.cart_stores.forEach((cs) => {
      cs.products.forEach((p) => {
        if (p.product.images) {
          p.product.images.sort((a, b) => a.order_number - b.order_number);
        }
      });
    });

    return txRes as ApiResponse<typeof createOrUpdateEcOrderApi>;
  },
);

//EC顧客側用オーダー取得API
export const GET = BackendAPI.create(getEcOrderApi, async (API, { query }) => {
  const mycaUserId = API.mycaUser?.id;
  // const mycaUserId = 123491; //俺のMycaId

  //ログインしてない場合指定できるフィールドが制限される
  if (!mycaUserId && (!query.code || query.status || query.id))
    throw new ApiError('invalidParameter');

  const whereInput: Array<Prisma.Ec_OrderWhereInput> = [];

  //クエリパラメータを見ていく
  for (const prop in query) {
    const key = prop as keyof typeof query;
    const value = query[key];

    switch (key) {
      case 'code':
        whereInput.push({
          code: value as Ec_Order['code'],
        });
        break;

      case 'status':
        whereInput.push({
          status: value as Ec_Order['status'],
        });
        break;

      case 'id':
        whereInput.push({
          id: value as Ec_Order['id'],
        });
        break;
    }
  }

  const orderModel = new BackendApiEcOrderService(API);

  const orders = await API.db.ec_Order.findMany({
    where: {
      AND: whereInput,
      platform: EcPlatform.MYCALINKS,
      myca_user_id: mycaUserId, //ログインしている場合、自分のオーダーしか取得できない
      ...(!mycaUserId ? { status: EcOrderStatus.DRAFT } : null), //ログインしてなかったらDRAFTのみ取得可能
    },
    ...orderModel.core.field.ecOrder,
  });

  //全てのMycaItemの情報を取得しておく
  const allMycaItemIds = new Set(
    orders.flatMap((e) =>
      e.cart_stores.flatMap((cs) =>
        cs.products.map((p) => p.product.item.myca_item_id),
      ),
    ),
  );

  // 空チェックを追加
  if (allMycaItemIds.size === 0) {
    return { orders } as ApiResponse<typeof getEcOrderApi>;
  }

  // MycaItemの検索
  const mycaAppService = new BackendApiMycaAppService(API);
  const mycaItems = await mycaAppService.core.item.getAllDetail(
    {
      id: Array.from(allMycaItemIds),
    },
    {
      detail: 1,
    },
  );

  //このアイテムの情報をマージしていく
  for (const e of orders) {
    //不足分在庫も入れるかどうか
    if (query.includesInsufficientProducts && e.status == EcOrderStatus.DRAFT) {
      const insufficientProducts: Array<{
        product_id: Product['id'];
        insufficient_count: number;
        item: {
          id: mycaItem['id']; //MycaアイテムID
          cardname: mycaItem['cardname']; //カード名
          rarity: mycaItem['rarity']; //レアリティ
          expansion: mycaItem['expansion']; //エキスパンション
          cardnumber: mycaItem['cardnumber']; //型番
          full_image_url: mycaItem['full_image_url']; //画像URL
        }; //Mycaアイテム情報
        condition_option: {
          handle: Item_Category_Condition_Option['handle']; //状態ハンドル
        };
        specialty: {
          handle: string;
        } | null;
      }> = [];

      const notExistProducts: Array<{
        product_id: Product['id'];
      }> = [];

      //不足在庫かどうか見極めていく
      for (const store of e.cart_stores) {
        //全ての商品情報を取得しておく
        const allProductInfo = await API.db.product.findManyExists({
          where: {
            id: {
              in: store.products.map((e) => e.product_id),
            },
            store_id: store.store_id,
            mycalinks_ec_enabled: true,
          },
          include: {
            item: true,
            condition_option: {
              select: {
                handle: true,
              },
            },
            specialty: {
              select: {
                handle: true,
              },
            },
          },
        });

        //在庫数を確認する 同時に重量計算
        store.products.forEach((p) => {
          const thisProductInfo = allProductInfo.find(
            (e) => e.id == p.product_id,
          );
          if (!thisProductInfo) {
            notExistProducts.push({
              product_id: p.product_id,
            });
            return;
          }

          //在庫数が足りるか確認
          if (thisProductInfo.ec_stock_number - p.original_item_count < 0) {
            console.log(
              `【在庫数エラー】 在庫ID:${p.product_id} の在庫が足りません`,
            );

            const thisMycaItem = mycaItems.find(
              (i) => i.id === thisProductInfo.item.myca_item_id,
            );

            if (!thisMycaItem)
              throw new ApiError({
                status: 404,
                messageText: 'Mycaアイテムが見つかりませんでした',
              });

            //不足在庫を記録
            insufficientProducts.push({
              product_id: p.product_id,
              insufficient_count:
                p.original_item_count - thisProductInfo.ec_stock_number,
              item: {
                id: thisMycaItem.id,
                cardname: thisMycaItem.cardname,
                rarity: thisMycaItem.rarity,
                expansion: thisMycaItem.expansion,
                cardnumber: thisMycaItem.cardnumber,
                full_image_url: thisMycaItem.full_image_url,
              },
              condition_option: thisProductInfo.condition_option!,
              specialty: thisProductInfo.specialty?.handle
                ? { handle: thisProductInfo.specialty.handle }
                : null,
            });

            //とりあえず購入できる分を入れる
            p.original_item_count = thisProductInfo.ec_stock_number;
          }
        });
      }

      // @ts-expect-error becuase of insufficientProductsはgetEcOrderDefのレスポンス型に含まれていないため
      e.insufficientProducts = insufficientProducts;

      // @ts-expect-error becuase of notExistProductsはgetEcOrderDefのレスポンス型に含まれていないため
      e.notExistProducts = notExistProducts;
    }

    for (const cs of e.cart_stores) {
      for (const p of cs.products) {
        const thisMycaItem = mycaItems.find(
          (i) => i.id == p.product.item.myca_item_id,
        );

        if (!thisMycaItem) continue;
        // @ts-expect-error becuase of mycaItemはgetEcOrderDefのレスポンス型に含まれていないため
        p.product.mycaItem = {
          id: thisMycaItem.id,
          cardname: thisMycaItem.cardname,
          rarity: thisMycaItem.rarity,
          expansion: thisMycaItem.expansion,
          cardnumber: thisMycaItem.cardnumber,
          full_image_url: thisMycaItem.full_image_url,
        };

        // Sort images by order_number like in the reference API
        if (p.product.images) {
          p.product.images.sort((a, b) => a.order_number - b.order_number);
        }
      }
    }
  }

  return { orders } as ApiResponse<typeof getEcOrderApi>;
});
