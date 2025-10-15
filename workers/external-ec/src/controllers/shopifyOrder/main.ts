import {
  EcOrderCartStoreStatus,
  EcOrderStatus,
  EcPaymentService,
  EcPaymentStatus,
  EcPlatform,
  PaymentMode,
} from '@prisma/client';
import {
  TaskCallback,
  workerDefs,
  BackendCoreShopifyService,
  BackendCoreEcOrderService,
  BackendCoreError,
  TaskManager,
} from 'backend-core';
import { AddressUtil, CustomCrypto } from 'common';

//Shopifyの注文通知
export const shopifyOrderController: TaskCallback<
  typeof workerDefs.externalEc.kinds.shopifyOrder.body
> = async (task) => {
  const thisBody = task.body[0];

  //この注文の情報を取得する
  const shopifyService = new BackendCoreShopifyService();
  //メールアドレスからストアIDなどを判断する
  await shopifyService.grantToken(thisBody.data.shopify_shop_domain);
  const storeId = shopifyService.ids.storeId;

  task.setIds({
    storeId,
  });

  switch (thisBody.data.kind) {
    case 'ordered': {
      const shopifyOrderInfo = await shopifyService.getOrder(
        thisBody.data.order_id,
      );

      console.log('ordered', shopifyOrderInfo);

      //在庫を見つけていく
      const allShopifyVariantIds = shopifyOrderInfo.lineItems.edges.map(
        (e) => e.node.variant.id,
      );

      if (!allShopifyVariantIds.length) return;

      //在庫を見つける
      const allProducts = await task.db.product.findMany({
        where: {
          store_id: storeId,
          deleted: false,
          shopify_ec_enabled: true,
          shopify_product_variant_id: {
            in: allShopifyVariantIds,
          },
        },
        select: {
          id: true,
          shopify_product_variant_id: true,
        },
      });

      //全ての在庫が見つからなかったら関係ない注文として、無視する
      for (const e of allShopifyVariantIds) {
        const thisProduct = allProducts.find(
          (p) => p.shopify_product_variant_id === e,
        );
        if (!thisProduct) {
          console.log(
            `Shopify在庫:${e}が見つからないため、関係ない注文として無視します`,
          );
          return;
        }
      }

      const addressInfo = shopifyOrderInfo.shippingAddress ?? {};

      const thisAddress = new AddressUtil({
        zipCode: addressInfo.zip,
        prefecture: addressInfo.province,
        city: addressInfo.city,
        address2: addressInfo.address1,
        building: addressInfo.address2,
        fullName: `${addressInfo.lastName} ${addressInfo.firstName}`,
        fullNameRuby: `${addressInfo.lastName} ${addressInfo.firstName}`,
        phoneNumber: addressInfo.phone,
      });

      const addressString = thisAddress.toString();

      const paymentInfo = shopifyOrderInfo.paymentGatewayNames?.[0];
      const shippingInfo = shopifyOrderInfo.shippingLines.nodes[0];

      //注文を作って、在庫変動を行う
      await task.transaction(async (tx) => {
        const thisOrderInfo = await tx.ec_Order.create({
          data: {
            code: CustomCrypto.generateUuidV7(),
            external_ec_id: thisBody.data.order_id,
            platform: EcPlatform.SHOPIFY,
            status: EcOrderStatus.DRAFT,
            payment_method_display_name: paymentInfo,
            customer_name: thisAddress.info.fullName ?? '',
            customer_phone: thisAddress.info.phoneNumber,
            customer_name_ruby: thisAddress.info.fullNameRuby,
            shipping_address: addressString,
            shipping_address_prefecture: thisAddress.info.prefecture,
            shipping_total_fee: Number(shopifyOrderInfo.totalShippingPrice),
            total_price: Number(shopifyOrderInfo.totalPrice),
            description: shopifyOrderInfo.note,
            ordered_at: new Date(shopifyOrderInfo.processedAt),
            payments: {
              create: {
                mode: PaymentMode.pay,
                service: EcPaymentService.SHOPIFY,
                method: paymentInfo,
                total_amount: Number(shopifyOrderInfo.totalPrice),
                status: EcPaymentStatus.COMPLETED,
              },
            },
            cart_stores: {
              create: {
                code: CustomCrypto.generateEcOrderCartCode(),
                store_id: storeId,
                status: EcOrderCartStoreStatus.PREPARE_FOR_SHIPPING,
                shipping_method_display_name: shippingInfo?.title,
                shipping_fee: shippingInfo?.price
                  ? Number(shippingInfo?.price)
                  : 0,
                total_price: Number(shopifyOrderInfo.totalPrice),
                description: shopifyOrderInfo.note,
                products: {
                  create: shopifyOrderInfo.lineItems.edges.map((e) => {
                    const thisProductInfo = allProducts.find(
                      (p) => p.shopify_product_variant_id === e.node.variant.id,
                    )!;

                    const unitPrice = Math.round(
                      Number(e.node.variant.price) / e.node.quantity,
                    );

                    return {
                      product_id: thisProductInfo.id,
                      total_unit_price: unitPrice,
                      original_item_count: e.node.quantity,
                      item_count: e.node.quantity,
                    };
                  }),
                },
              },
            },
          },
          include: {
            cart_stores: {
              include: {
                store: {
                  include: {
                    ec_setting: true,
                    accounts: true,
                  },
                },
                shipping_method: true,
                products: {
                  include: {
                    product: {
                      include: {
                        item: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        //在庫変動させていく
        const ecOrderService = new BackendCoreEcOrderService(thisOrderInfo.id);
        ecOrderService.targetObject = thisOrderInfo;
        ecOrderService.setIds({ ecOrderId: thisOrderInfo.id });
        task.give(ecOrderService);

        try {
          await ecOrderService.consumeProducts();
        } catch (e: unknown) {
          if (e instanceof BackendCoreError) {
            if (e.errorCode === 'EC_ENOUGH_STOCK_NUMBER') {
              //在庫が足りないので注文を作れない旨のメールを送信する
              const taskManager = new TaskManager({
                targetWorker: 'notification',
                kind: 'sendEmail',
              });

              await taskManager.publish({
                body: [
                  {
                    to: 'saidajunki@gmail.com', //[TODO] 店のメールアドレス
                    as: 'service',
                    title:
                      'Shopify注文をMycalinks POSに作成することができませんでした',
                    bodyText: `Shopify注文をMycalinks POSに作成することができませんでした。
                注文番号:${thisBody.data.order_id}
                注文者:${thisAddress.info.fullName}
                注文者電話番号:${thisAddress.info.phoneNumber}
                注文者住所:${thisAddress.toString()}
                `,
                  },
                ],
                service: task,
                specificGroupId: `send-email-saidajunki@gmail.com`,
              });

              //この注文は諦めて早期リターンする
              return;
            }
          }

          console.log(e);
          throw e;
        }

        //PAIDにする
        await tx.ec_Order.update({
          where: {
            id: thisOrderInfo.id,
          },
          data: {
            status: EcOrderStatus.PAID,
          },
        });

        console.log(`Shopify注文を作成することができました`, thisOrderInfo);

        const taskManager = new TaskManager({
          targetWorker: 'notification',
          kind: 'sendEmail',
        });

        await taskManager.publish({
          body: [
            {
              to: 'saidajunki@gmail.com', //[TODO] 店のメールアドレス
              as: 'service',
              title: 'Shopify注文をMycalinks POSに作成しました',
              bodyText: `Shopify注文をMycalinks POSに作成しました。
          注文番号:${thisBody.data.order_id}
          注文者:${thisAddress.info.fullName}
          注文者電話番号:${thisAddress.info.phoneNumber}
          注文者住所:${thisAddress.toString()}
          `,
            },
          ],
          fromSystem: true,
          service: task,
          specificGroupId: `send-email-saidajunki@gmail.com`,
        });
      });

      break;
    }

    case 'shipped': {
      //この注文を取得する
      const thisOrderInfo = await task.db.ec_Order.findFirst({
        where: {
          platform: EcPlatform.SHOPIFY,
          external_ec_id: thisBody.data.order_id,
          status: EcOrderStatus.PAID,
          cart_stores: {
            every: {
              store_id: storeId,
            },
          },
        },
      });

      if (!thisOrderInfo) return;

      //この注文のステータスを更新する
      await task.db.ec_Order.update({
        where: {
          id: thisOrderInfo.id,
        },
        data: {
          status: EcOrderStatus.COMPLETED,
          cart_stores: {
            updateMany: {
              where: {},
              data: {
                status: EcOrderCartStoreStatus.COMPLETED,
              },
            },
          },
        },
      });

      const taskManager = new TaskManager({
        targetWorker: 'notification',
        kind: 'sendEmail',
      });

      await taskManager.publish({
        body: [
          {
            to: 'saidajunki@gmail.com', //[TODO] 店のメールアドレス
            as: 'service',
            title: 'Shopify注文をMycalinks POSに作成しました',
            bodyText: `Shopify注文をMycalinks POSに作成しました。
        注文番号:${thisBody.data.order_id}
        `,
          },
        ],
        service: task,
        specificGroupId: `send-email-saidajunki@gmail.com`,
      });

      break;
    }
  }
};
