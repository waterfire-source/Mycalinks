import {
  EcOrderCartStoreStatus,
  EcOrderStatus,
  EcPaymentService,
  EcPaymentStatus,
  EcPlatform,
  PaymentMode,
} from '@prisma/client';
import {
  BackendCoreError,
  BackendCoreOchanokoService,
  TaskCallback,
  workerDefs,
  TaskManager,
} from 'backend-core';
import { BackendCoreEcOrderService } from 'backend-core';
import { CustomCrypto } from 'common';

//おちゃのこの注文通知
export const ochanokoOrderController: TaskCallback<
  typeof workerDefs.externalEc.kinds.ochanokoOrder.body
> = async (task) => {
  const thisBody = task.body[0];

  //この注文の情報を取得する
  const ochanokoService = new BackendCoreOchanokoService();
  //メールアドレスからストアIDなどを判断する
  await ochanokoService.grantToken(thisBody.data.email);
  const storeId = ochanokoService.ids.storeId;

  task.setIds({
    storeId,
  });

  //イベントによって処理を分ける

  switch (thisBody.data.kind) {
    //新規注文
    case 'ordered': {
      //注文の情報を取得する
      const ochanokoOrderInfo = await ochanokoService.client.getOrders(
        thisBody.data.order_id,
      );

      const thisShipping = ochanokoOrderInfo.shipping[0];

      if (!thisShipping) return;

      //在庫を見つけていく
      const allOchanokoIds = thisShipping.products.map((p) => p.product_id);

      //なかったら早期リターン
      if (!allOchanokoIds.length) return;

      //在庫を見つける
      const allProducts = await task.db.product.findMany({
        where: {
          store_id: storeId,
          deleted: false,
          ochanoko_ec_enabled: true,
          ochanoko_product_id: {
            in: allOchanokoIds,
          },
        },
        select: {
          id: true,
          ochanoko_product_id: true,
        },
      });

      //全ての在庫が見つからなかったら関係ない注文として、無視する
      for (const e of allOchanokoIds) {
        const thisProduct = allProducts.find(
          (p) => p.ochanoko_product_id === e,
        );
        if (!thisProduct) {
          console.log(
            `おちゃのこ在庫:${e}が見つからないため、関係ない注文として無視します`,
          );
          return;
        }
      }

      const customerInfo = thisShipping.recipient;
      const addressFull = `${customerInfo.postal_code} ${customerInfo.prefecture} ${customerInfo.address}`;

      //注文を作って、在庫変動を行う
      await task.transaction(async (tx) => {
        const thisOrderInfo = await tx.ec_Order.create({
          data: {
            code: CustomCrypto.generateUuidV7(),
            external_ec_id: String(thisBody.data.order_id),
            platform: EcPlatform.OCHANOKO,
            status: EcOrderStatus.DRAFT,
            payment_method_display_name: '現金払い',
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone,
            customer_name_ruby: customerInfo.name_katakana,
            shipping_address: addressFull,
            shipping_address_prefecture: customerInfo.prefecture,
            shipping_total_fee: thisShipping.shipping_price,
            total_price: ochanokoOrderInfo.total_price,
            description: ochanokoOrderInfo.checkout_comments,
            ordered_at: new Date(ochanokoOrderInfo.created_at),
            payments: {
              create: {
                mode: PaymentMode.pay,
                service: EcPaymentService.OCHANOKO,
                method: ochanokoOrderInfo.payment_method,
                source_event_json: ochanokoOrderInfo.payment_details,
                total_amount: ochanokoOrderInfo.total_price,
                status: EcPaymentStatus.COMPLETED,
              },
            },
            cart_stores: {
              create: {
                code: CustomCrypto.generateEcOrderCartCode(),
                store_id: storeId,
                status: EcOrderCartStoreStatus.PREPARE_FOR_SHIPPING,
                shipping_method_display_name: thisShipping.shipping_method,
                shipping_tracking_code: thisShipping.tracking_numbers.length
                  ? thisShipping.tracking_numbers[0]
                  : null,
                shipping_company_display_name: thisShipping.tracking_company,
                shipping_fee: thisShipping.shipping_price,
                total_price: ochanokoOrderInfo.total_price,
                description: ochanokoOrderInfo.checkout_comments,
                products: {
                  create: thisShipping.products.map((ochanokoProduct) => {
                    const thisProductInfo = allProducts.find(
                      (p) =>
                        p.ochanoko_product_id === ochanokoProduct.product_id,
                    )!;

                    const unitPrice = Math.round(
                      ochanokoProduct.price / ochanokoProduct.quantity,
                    );

                    return {
                      product_id: thisProductInfo.id,
                      total_unit_price: unitPrice,
                      original_item_count: ochanokoProduct.quantity,
                      item_count: ochanokoProduct.quantity,
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
                    to: thisBody.data.email,
                    as: 'service',
                    title:
                      'おちゃのこ注文をMycalinks POSに作成することができませんでした',
                    bodyText: `おちゃのこ注文をMycalinks POSに作成することができませんでした。
                注文番号:${thisBody.data.order_id}
                注文日時:${new Date(
                  ochanokoOrderInfo.created_at,
                ).toLocaleString()}
                注文金額:${ochanokoOrderInfo.total_price}
                注文者:${customerInfo.name}
                `,
                  },
                ],
                fromSystem: true,
                service: task,
                specificGroupId: `send-email-${thisBody.data.email}`,
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

        console.log(
          `おちゃのこの注文を作成することができました`,
          thisOrderInfo,
        );

        const taskManager = new TaskManager({
          targetWorker: 'notification',
          kind: 'sendEmail',
        });

        await taskManager.publish({
          body: [
            {
              to: thisBody.data.email,
              as: 'service',
              title: 'おちゃのこ注文をMycalinks POSに作成しました',
              bodyText: `おちゃのこ注文をMycalinks POSに作成しました。
          注文番号（おちゃのこ）:${thisBody.data.order_id}
          注文ID（POS）:${thisOrderInfo.id}
          注文日時:${new Date(ochanokoOrderInfo.created_at).toLocaleString()}
          注文金額:${ochanokoOrderInfo.total_price}
          注文者:${customerInfo.name}
          `,
            },
          ],
          fromSystem: true,
          service: task,
          specificGroupId: `send-email-${thisBody.data.email}`,
        });
      });

      break;
    }

    case 'shipped': {
      //この注文を取得する
      const thisOrderInfo = await task.db.ec_Order.findFirst({
        where: {
          platform: EcPlatform.OCHANOKO,
          external_ec_id: String(thisBody.data.order_id),
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
            to: thisBody.data.email,
            as: 'service',
            title:
              'POS上に作成されていたおちゃのこ注文を発送済みとしてマークしました',
            bodyText: `POS上に作成されていたおちゃのこ注文を発送済みとしてマークしました。
        注文番号（おちゃのこ）:${thisBody.data.order_id}
        注文ID（POS）:${thisOrderInfo.id}
        注文日時:${new Date(thisOrderInfo.ordered_at).toLocaleString()}
        注文金額:${thisOrderInfo.total_price}
        注文者:${thisOrderInfo.customer_name}
        `,
          },
        ],
        fromSystem: true,
        service: task,
        specificGroupId: `send-email-${thisBody.data.email}`,
      });

      break;
    }
  }
};
