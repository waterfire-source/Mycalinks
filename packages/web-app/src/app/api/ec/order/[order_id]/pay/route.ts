import { BackendAPI } from '@/api/backendApi/main';
import {
  Ec_Order_Payment,
  EcOrderStatus,
  EcPaymentMethod,
} from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import { payEcOrderDef } from '@/app/api/ec/def';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { BackendApiEcOrderService } from '@/api/backendApi/services/ec/order/main';
import { BackendApiEcPaymentService } from '@/api/backendApi/services/ec/payment/main';
import { ApiResponse, payEcOrderApi } from 'api-generator';
import { BackendApiEcShippingService } from '@/api/backendApi/services/ec/shipping/main';

//顧客用オーダー確定API
export const POST = BackendAPI.create(
  payEcOrderApi,
  async (API, { body, params }) => {
    const { payment_method, total_price, card_id, convenience_code } = body;

    const mycaUserId = API.mycaUser?.id;
    // const mycaUserId = 123491;

    if (!mycaUserId)
      throw new ApiError({
        status: 404,
        messageText: 'Mycaユーザー情報が見つかりません',
      });

    const mycaAppClient = new BackendApiMycaAppService(API);
    const mycaUserInfo = await mycaAppClient.core.user.getInfo({
      user: mycaUserId,
    });

    if (!mycaUserInfo)
      throw new ApiError({
        status: 404,
        messageText: 'Mycaユーザー情報が見つかりません',
      });

    //存在しているか確認
    const orderInfo = await API.db.ec_Order.findUnique({
      where: {
        id: params.order_id,
        status: EcOrderStatus.DRAFT,
        myca_user_id: mycaUserId,
      },
      include: {
        payments: true,
        cart_stores: {
          include: {
            store: {
              include: {
                ec_setting: true,
                accounts: true,
              },
            },
            shipping_method: {
              include: {
                regions: true,
                weights: {
                  include: {
                    regions: true,
                  },
                },
              },
            },
            products: {
              include: {
                product: {
                  include: {
                    item: true,
                    images: {
                      select: {
                        image_url: true,
                        description: true,
                        order_number: true,
                      },
                      orderBy: {
                        order_number: 'asc',
                      },
                    },
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
          },
        },
      },
    });

    if (!orderInfo) throw new ApiError('notExist');

    const thisEc = new BackendApiEcOrderService(API, orderInfo.id);
    const paymentService = new BackendApiEcPaymentService(API, orderInfo.id);

    //住所などを確認
    if (
      orderInfo.shipping_address !=
        mycaAppClient.core.user.getUserFullAddress(mycaUserInfo) ||
      orderInfo.shipping_address_prefecture != mycaUserInfo.prefecture ||
      orderInfo.customer_email != mycaUserInfo.mail
    )
      throw new ApiError({
        status: 400,
        messageText:
          'Myca住所情報が更新されたか、指定された配送都道府県と住所情報が一致していません',
      });

    let actual_total_price = 0;

    let paymentMethodCandidates: Set<EcPaymentMethod> = new Set(
      paymentService.core.config.paymentMethods.all,
    );

    //重量や配送方法を見ていく
    for (const store of orderInfo.cart_stores) {
      if (!store.products.length)
        throw new ApiError(payEcOrderDef.error.noProducts);

      if (!store.shipping_method_id)
        throw new ApiError(payEcOrderDef.error.noShippingMethod);

      if (!orderInfo.shipping_address_prefecture || !orderInfo.shipping_address)
        throw new ApiError(payEcOrderDef.error.noShippingAddress);

      //代引きが無効な配送方法だったら消す
      if (!store.shipping_method!.enabled_cash_on_delivery) {
        paymentMethodCandidates.delete(EcPaymentMethod.CASH_ON_DELIVERY);
      }

      const splitted =
        store.store.ec_setting!.delayed_payment_method.split(',');

      //ない方法があったら消す
      paymentMethodCandidates.forEach((e) => {
        if (!splitted.includes(e)) paymentMethodCandidates.delete(e);
      });

      const weight = store.products.reduce(
        (curSum, p) => curSum + p.product.item.weight,
        0,
      );
      const prefecture = orderInfo.shipping_address_prefecture;

      const shippingModel = new BackendApiEcShippingService(API);
      shippingModel.setIds({
        shippingMethodId: store.shipping_method_id,
        storeId: store.store_id,
      });

      //この配送方法が適用できるか確認
      const thisShippingInfo = shippingModel.core.judgeValidShippingMethod(
        store.shipping_method!,
        weight,
        prefecture,
      );

      if (!thisShippingInfo)
        throw new ApiError(payEcOrderDef.error.invalidShippingMethod);

      //商品の合計価格
      const totalPrice = store.products.reduce(
        (curSum, p) =>
          curSum + p.original_item_count * p.product.actual_ec_sell_price!,
        0,
      );

      const checkFreeRes = await shippingModel.core.judgeFreeShipping({
        totalPrice,
        freeShippingPrice:
          store.store.ec_setting?.free_shipping_price ?? undefined,
      });

      if (checkFreeRes) {
        thisShippingInfo.fee = 0;
      }

      const shippingFee = thisShippingInfo.fee;

      //登録されているものと違ったらエラー
      if (shippingFee != store.shipping_fee)
        throw new ApiError(payEcOrderDef.error.invalidShippingMethod);

      actual_total_price += shippingFee + totalPrice;
    }

    //合計金額が異なっていたらエラー
    if (
      total_price != actual_total_price ||
      total_price != orderInfo.total_price
    )
      throw new ApiError(payEcOrderDef.error.invalidTotalPrice);

    //カード払いは絶対に使えるため追加する
    paymentMethodCandidates = paymentMethodCandidates.union(
      new Set(paymentService.core.config.paymentMethods.immediate),
    );

    //この支払い方法が含まれているか確認
    if (!paymentMethodCandidates.has(payment_method))
      throw new ApiError({
        status: 400,
        messageText: 'この支払い方法はこの取引で利用することができません',
      });

    //上限額などを確認
    paymentService.core.judgePaymentAvailable({
      paymentMethod: payment_method,
      totalPrice: actual_total_price,
    });

    thisEc.core.targetObject = orderInfo;
    paymentService.core.targetObject = orderInfo;

    //トランザクションを貼っていく
    const txRes = await API.transaction(async (tx) => {
      //在庫変動をさせていく（仮押さえ）
      await thisEc.core.consumeProducts();

      //支払いを作成（と同時にタイムアウトタイマーをセットする）
      const { ecOrder, gmoRes, redirectUrl, paymentInfo, ecPayment } =
        await paymentService.core.createPayment({
          paymentMethod: payment_method,
          cardId: card_id,
          convenienceCode: convenience_code,
        });

      //オーダー日時を記録
      const result = await tx.ec_Order.update({
        where: {
          id: orderInfo.id,
        },
        data: {
          ordered_at: new Date(),
        },
        ...thisEc.core.field.ecOrder,
      });

      //@ts-expect-error becuase of because of
      return {
        ...result,
        ecPayment,
        cashPaymentInfo: paymentInfo,
        cardPaymentInfo: redirectUrl ? { redirectUrl } : null,
      } as ApiResponse<typeof payEcOrderApi> & {
        ecPayment: Ec_Order_Payment;
      };
    });

    //全てのMycaItemの情報を取得しておく
    const allMycaItemIds = new Set(
      txRes.cart_stores.flatMap((cs) =>
        cs.products.map((p) => p.product.item.myca_item_id),
      ),
    );

    //検索をかけていく
    const mycaItems =
      allMycaItemIds.size > 0
        ? await mycaAppClient.core.item.getAllDetail(
            {
              id: Array.from(allMycaItemIds),
            },
            {
              detail: 1,
            },
          )
        : [];

    //このアイテムの情報をマージしていく
    txRes.cart_stores.forEach((cs) => {
      cs.products.forEach((p) => {
        const thisMycaItem = mycaItems.find(
          (i) => i.id == p.product.item.myca_item_id,
        );

        if (!thisMycaItem) return;

        p.product.mycaItem = {
          id: thisMycaItem.id,
          cardname: thisMycaItem.cardname,
          rarity: thisMycaItem.rarity,
          expansion: thisMycaItem.expansion,
          cardnumber: thisMycaItem.cardnumber,
          full_image_url: thisMycaItem.full_image_url,
        };
      });
    });

    thisEc.core.targetObject.ordered_at = txRes.ordered_at;
    thisEc.core.targetObject.payment_method = txRes.payment_method;

    //支払い方法によってメールを変える
    switch (txRes.payment_method) {
      case EcPaymentMethod.CASH_ON_DELIVERY:
      case EcPaymentMethod.CARD: {
        //カードの場合は、支払いが完了していることを確認しつつ、メールを送信する
        if (txRes.status == EcOrderStatus.PAID) {
          await thisEc.core.sendOrderMail();
        }
        break;
      }
      case EcPaymentMethod.BANK:
      case EcPaymentMethod.CONVENIENCE_STORE: {
        await thisEc.core.sendPaymentMail(txRes.ecPayment);
        break;
      }
    }

    return txRes;
  },
);
