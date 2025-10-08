//追跡番号入力
//運送会社入力
//カート内容変更リクエスト（欠品リクエスト）送信
//オーダー既読
//ステータス変更（発送準備等等）

import { BackendAPI } from '@/api/backendApi/main';
import {
  Ec_Order_Cart_Store_Product,
  EcOrderCartStoreStatus,
  EcOrderStatus,
  EcPlatform,
  Product,
  ProductEcStockHistorySourceKind,
} from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import { updateEcOrderByStoreApi } from 'api-generator';
import { BackendCoreError } from 'backend-core';
import { BackendApiEcOrderService } from '@/api/backendApi/services/ec/order/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendApiEcPaymentService } from '@/api/backendApi/services/ec/payment/main';

//ECオーダー変更API さすがに色々詰め込みすぎたのでさらに複雑化するようならエンドポイント分たい、、
//現状Mycalinks ECでの注文のみ
export const PUT = BackendAPI.create(
  updateEcOrderByStoreApi,
  async (API, { params, body }) => {
    let {
      read,
      status,
      shipping_tracking_code,
      shipping_company,
      products,
      cancelReason,
    } = body;

    //現在の情報を取得する
    const orderInfo = await API.db.ec_Order_Cart_Store.findUnique({
      where: {
        order_id_store_id: {
          order_id: params.order_id,
          store_id: params.store_id,
        },
        status: {
          notIn: [
            EcOrderCartStoreStatus.DRAFT,
            EcOrderCartStoreStatus.CANCELED,
            EcOrderCartStoreStatus.COMPLETED,
          ],
        },
        order: {
          status: {
            not: EcOrderStatus.DRAFT,
          },
        },
      },
      include: {
        order: true,
        products: true,
      },
    });

    if (!orderInfo) throw new ApiError('notExist');

    if (orderInfo.order.platform != EcPlatform.MYCALINKS)
      throw new ApiError({
        status: 400,
        messageText: '現在Mycalinks ECでの注文のみ対応しています',
      });

    //一つ一つフィールドを見ていく
    //既読をつけるタイミングに制限はない
    //追跡番号、運送会社は、発送待機中にのみつけることができる
    if (shipping_tracking_code || shipping_company) {
      if (orderInfo.status != EcOrderCartStoreStatus.WAIT_FOR_SHIPPING)
        throw new ApiError({
          status: 400,
          messageText:
            '追跡番号、運送会社は発送待機中にのみつけることができます',
        });

      //先に変えちゃう
      if (shipping_company) orderInfo.shipping_company = shipping_company;
    }

    //ステータス
    if (status) {
      switch (status) {
        case EcOrderCartStoreStatus.WAIT_FOR_SHIPPING: {
          //発送待機中にできるのは発送準備待ちの時のみ
          if (orderInfo.status != EcOrderCartStoreStatus.PREPARE_FOR_SHIPPING)
            throw new ApiError({
              status: 400,
              messageText: '発送待機中にできるのは発送準備待ちの時のみです',
            });

          //まだ入金してない場合（非即時決済など）　未入金にする
          if (orderInfo.order.status == EcOrderStatus.UNPAID) {
            status = EcOrderCartStoreStatus.UNPAID;
          }

          break;
        }

        case EcOrderCartStoreStatus.COMPLETED: {
          //完了（発送済み）にできるのは発送待機中の時のみ 一応入金したかどうかも調べる
          if (
            orderInfo.status != EcOrderCartStoreStatus.WAIT_FOR_SHIPPING ||
            orderInfo.order.status != EcOrderStatus.PAID
          )
            throw new ApiError({
              status: 400,
              messageText: '発送完了にできるのは発送待機中の時のみです',
            });

          //運送会社を指定しないといけない
          if (!orderInfo.shipping_company)
            throw new ApiError({
              status: 400,
              messageText: '発送完了にするには運送会社を登録する必要があります',
            });

          break;
        }

        case EcOrderCartStoreStatus.CANCELED: {
          //キャンセルにできるのはここで取得できているオーダーであればステータスの制限はない
          //productsと同時には指定できない（ややこしなるため）
          if (products)
            throw new ApiError({
              status: 400,
              messageText: 'キャンセルと同時に欠品登録することはできません',
            });

          break;
        }

        default:
          throw new ApiError({
            status: 400,
            messageText: 'このステータスは指定できません',
          });
      }
    }

    //欠品
    if (products) {
      //欠品登録できるのは発送準備待ちの時のみ
      if (orderInfo.status != EcOrderCartStoreStatus.PREPARE_FOR_SHIPPING)
        throw new ApiError({
          status: 400,
          messageText: '欠品登録できるのは発送準備待ちの時のみです',
        });

      //ステータスと同時指定はできない
      if (status)
        throw new ApiError({
          status: 400,
          messageText: 'キャンセルと同時に欠品登録することはできません',
        });

      //一回欠品登録してたらだめ
      if (orderInfo.products.some((p) => p.item_count != p.original_item_count))
        throw new ApiError({
          status: 400,
          messageText: 'この注文ではすでに欠品登録されています',
        });
    }

    const ecModel = new BackendApiEcOrderService(API);

    let mailKind: 'shipping' | 'orderChange' | 'cancel' | null = null;
    let returnProducts: Array<{
      product_id: Product['id'];
      item_count: number; //返品数
      unit_price: Ec_Order_Cart_Store_Product['total_unit_price']; //単価
    }> = [];

    //txをはる
    const txRes = await API.transaction(async (tx) => {
      //更新していく
      const updateRes = await tx.ec_Order_Cart_Store.update({
        where: {
          order_id_store_id: {
            order_id: orderInfo.order_id,
            store_id: orderInfo.store_id,
          },
        },
        data: {
          read, //既読
          status, //ステータス
          shipping_tracking_code,
          shipping_company,
          ...(status == EcOrderCartStoreStatus.COMPLETED ||
          status == EcOrderCartStoreStatus.CANCELED
            ? {
                finished_at: new Date(),
              }
            : {}),
        },
        ...ecModel.core.field.ecOrderCartStore,
      });

      //発送済みにしてたら発送確認メールとかを送る
      //あとすべて発送済みか確認
      if (status == EcOrderCartStoreStatus.COMPLETED) {
        mailKind = 'shipping';
      }

      let refundTotal = 0; //返金額

      //欠品報告などをしてた場合
      if (products) {
        mailKind = 'orderChange';

        //全てのitem_countが0だったらエラー
        if (products.every((p) => p.item_count == 0))
          throw new ApiError({
            status: 400,
            messageText: '全て欠品にする時はキャンセル機能をお使いください',
          });

        //ここで書き換えていく
        for (const product of products) {
          //元の数よりも多くなっていたらエラー 同じだったら無視
          const thisProductInfo = updateRes.products.find(
            (e) => e.product.id == product.product_id,
          );

          if (!thisProductInfo) throw new ApiError('notExist');

          if (
            thisProductInfo.original_item_count < product.item_count ||
            product.item_count < 0
          )
            throw new ApiError({
              status: 400,
              messageText: '欠品報告数の指定が不適切です',
            });
          if (thisProductInfo.original_item_count == product.item_count)
            continue;

          //更新する
          await tx.ec_Order_Cart_Store_Product.update({
            where: {
              id: thisProductInfo.id,
            },
            data: {
              item_count: product.item_count,
            },
          });

          //ここでの差額を算出
          const gap = thisProductInfo.original_item_count - product.item_count;
          const unitPrice = thisProductInfo.total_unit_price;
          refundTotal += gap * unitPrice;

          //差分の在庫数を返品として登録
          returnProducts.push({
            product_id: product.product_id,
            item_count: gap,
            unit_price: unitPrice,
          });
        }
      }

      //キャンセルの場合
      if (status == EcOrderCartStoreStatus.CANCELED) {
        //全てのProductを追加
        returnProducts = updateRes.products.map((p) => ({
          product_id: p.product.id,
          item_count: p.item_count, //欠品報告を過去にしている可能性を考えてこちらをとる
          unit_price: p.total_unit_price,
        }));

        //金額は送料を含めた全額
        refundTotal = updateRes.total_price;
        mailKind = 'cancel';
      }

      //在庫調整と返金処理をしていく あと出品の取り消し
      for (const product of returnProducts) {
        if (product.item_count == 0) continue;

        let source_kind: ProductEcStockHistorySourceKind;

        switch (orderInfo.order.platform) {
          case EcPlatform.MYCALINKS:
            source_kind =
              ProductEcStockHistorySourceKind.mycalinks_ec_sell_return;
            break;
          default:
            throw new BackendCoreError({
              internalMessage: '返品未対応のプラットフォームです',
            });
        }

        const thisProduct = new BackendApiProductService(
          API,
          product.product_id,
        );
        const changeResult = await thisProduct.core.increaseEcStock({
          source_kind,
          source_id: orderInfo.order.id,
          increaseCount: product.item_count,
          ecStop: true,
          description: `EC販売取引${orderInfo.order.id} キャンセル・欠品報告 において在庫${product.product_id}の数量が${product.item_count} 増加しました`,
        });
      }

      if (refundTotal) {
        //返金する
        const ecPaymentService = new BackendApiEcPaymentService(
          API,
          orderInfo.order.id,
        );

        await ecPaymentService.core.refundPartialPayment({
          amount: refundTotal,
        });

        //ステータスだけ変える
        await tx.ec_Order_Cart_Store.update({
          where: {
            order_id_store_id: {
              order_id: orderInfo.order.id,
              store_id: orderInfo.store_id,
            },
          },
          data: { status },
        });
      }

      //最後に取得
      const result = await tx.ec_Order_Cart_Store.findUnique({
        where: {
          order_id_store_id: {
            order_id: orderInfo.order.id,
            store_id: orderInfo.store_id,
          },
        },
        include: {
          products: true,
        },
      });

      return result;
    });

    if (mailKind) {
      const cs = await API.primaryDb.ec_Order_Cart_Store.findUnique({
        where: {
          order_id_store_id: {
            order_id: orderInfo.order.id,
            store_id: orderInfo.store_id,
          },
        },
        include: {
          order: true,
          products: {
            include: {
              product: {
                include: {
                  item: true,
                  specialty: {
                    select: {
                      display_name: true,
                    },
                  },
                  condition_option: {
                    select: {
                      handle: true,
                    },
                  },
                },
              },
            },
          },
          shipping_method: true,
        },
      });

      const ecOrderService = new BackendApiEcOrderService(
        API,
        orderInfo.order.id,
      );

      if (mailKind == 'shipping') {
        await ecOrderService.core.sendShippingMail(cs!);
      } else if (mailKind == 'orderChange') {
        await ecOrderService.core.sendOrderChangeMail(
          cs!,
          returnProducts,
          cancelReason,
        );
      } else if (mailKind == 'cancel') {
        await ecOrderService.core.sendOrderCancelMail(cs!, cancelReason!);
      }
    }

    return {
      storeOrder: txRes!,
    };
  },
);
