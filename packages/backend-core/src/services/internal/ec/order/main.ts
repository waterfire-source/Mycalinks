//GMO関連

import {
  Ec_Message_Center,
  Ec_Order,
  Ec_Order_Cart_Store,
  Ec_Order_Cart_Store_Product,
  Ec_Order_Payment,
  EcMessageCenterKind,
  EcOrderStatus,
  EcPlatform,
  Item,
  Item_Category_Condition_Option,
  Prisma,
  Product,
  ProductEcStockHistorySourceKind,
  Shipping_Method,
  Specialty,
  Store,
} from '@prisma/client';
import { BackendResources, BackendService } from '@/services/internal/main';
import { BackendCoreError } from '@/error/main';
import {
  BackendCoreProductService,
  ProductService,
} from '@/services/internal/product/main';
import { AddressUtil, customDayjs, ecConstants } from 'common';
import { TaskManager } from '@/task/main';
import { BackendCoreEcPaymentService } from '@/services/internal/ec/main';
import { BackendImageUtil } from '@/utils/image';
import { htmlEncode } from 'js-htmlencode';
import { BackendPdfUtil } from '@/utils/pdf';

/**
 * ECの注文関連
 */
export class BackendCoreEcOrderService extends BackendService {
  public targetObject?: Ec_Order & {
    cart_stores: Array<
      Ec_Order_Cart_Store & {
        store: BackendResources['store'];
        shipping_method: Shipping_Method | null;
        products: Array<
          Ec_Order_Cart_Store_Product & {
            product: Product & {
              item: Item;
              specialty: {
                display_name: Specialty['display_name'];
              } | null;
              condition_option: {
                handle: Item_Category_Condition_Option['handle'];
              } | null;
            };
          }
        >;
      }
    >;
  };

  public get existingObj(): Promise<NonNullable<typeof this.targetObject>> {
    if (this.targetObject) return Promise.resolve(this.targetObject);

    if (!this.ids.ecOrderId)
      throw new BackendCoreError({
        internalMessage: 'ECオーダーIDが指定されていません',
      });

    return (async () => {
      const obj = await this.primaryDb.ec_Order.findUnique({
        where: { id: this.ids.ecOrderId },
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

      if (!obj)
        throw new BackendCoreError({
          internalMessage: 'ECオーダーが見つかりません',
        });

      this.targetObject = obj;

      return this.targetObject;
    })();
  }

  constructor(ecOrderId?: Ec_Order['id']) {
    super();
    this.setIds({
      ecOrderId,
    });
  }

  /**
   * 在庫の仮確定を行う
   * 下書き状態じゃないといけない
   */
  @BackendService.WithTx
  @BackendService.WithIds(['ecOrderId'])
  public async consumeProducts() {
    const orderInfo = await this.existingObj;

    if (orderInfo.status != EcOrderStatus.DRAFT)
      throw new BackendCoreError({
        internalMessage: '下書き状態でないといけません',
      });

    let source_kind: ProductEcStockHistorySourceKind;

    switch (orderInfo.platform) {
      case EcPlatform.MYCALINKS:
        source_kind = ProductEcStockHistorySourceKind.mycalinks_ec_sell;
        break;
      case EcPlatform.OCHANOKO:
        source_kind = ProductEcStockHistorySourceKind.ochanoko_ec_sell;
        break;
      case EcPlatform.SHOPIFY:
        source_kind = ProductEcStockHistorySourceKind.shopify_ec_sell;
        break;
      default:
        throw new BackendCoreError({
          internalMessage: '販売未対応のプラットフォームです',
        });
    }

    //それぞれの商品を見ていく
    for (const store of orderInfo.cart_stores) {
      //ストア設定などをリソースとして登録
      this.resources.store = store.store;
      this.ids.storeId = store.store_id;

      //それぞれの商品を見ていく
      for (const product of store.products) {
        if (product.item_count == 0)
          throw new BackendCoreError({
            internalMessage: '数量が0の商品があります',
          });

        //在庫調整を行う
        const thisProduct = new BackendCoreProductService(product.product_id);
        this.give(thisProduct);

        //在庫減少させる
        const changeResult = await thisProduct.decreaseEcStock({
          source_kind,
          source_id: orderInfo.id,
          decreaseCount: product.original_item_count,
          unit_price: product.total_unit_price,
          description: `EC販売取引${orderInfo.id} において在庫${product.product_id}の数量が${product.original_item_count} 減少しました`,
        });
        console.log(changeResult);

        //使った仕入れ値を取得
        const usedWholesalePrice =
          changeResult.recordInfo?.totalWholesalePrice ?? 0;

        //仕入れ額を更新する
        await this.db.ec_Order_Cart_Store_Product.update({
          where: {
            id: product.id,
          },
          data: {
            wholesale_total_price: usedWholesalePrice,
          },
        });
      }
    }
  }

  /**
   * 在庫数変動をすべて戻す（発送前用）
   * ステータスがPAID, UNPAIDのみ
   */
  @BackendService.WithTx
  @BackendService.WithIds(['ecOrderId'])
  public rollbackProducts = async () => {
    const orderInfo = await this.existingObj;

    if (
      orderInfo.status != EcOrderStatus.PAID &&
      orderInfo.status != EcOrderStatus.UNPAID
    )
      throw new BackendCoreError({
        internalMessage: 'PAID, UNPAIDのみ',
      });

    let source_kind: ProductEcStockHistorySourceKind;

    switch (orderInfo.platform) {
      case EcPlatform.MYCALINKS:
        source_kind = ProductEcStockHistorySourceKind.mycalinks_ec_sell_return;
        break;
      default:
        throw new BackendCoreError({
          internalMessage: '返品未対応のプラットフォームです',
        });
    }

    //それぞれの商品を見ていく
    for (const store of orderInfo.cart_stores) {
      //ストア設定などをリソースとして登録
      this.resources.store = store.store;
      this.ids.storeId = store.store_id;

      //それぞれの商品を見ていく
      for (const product of store.products) {
        //在庫調整を行う
        const thisProduct = new BackendCoreProductService(product.product_id);
        this.give(thisProduct);

        //在庫増加させる
        const changeResult = await thisProduct.increaseEcStock({
          source_kind,
          source_id: orderInfo.id,
          increaseCount: product.original_item_count,
          description: `EC販売取引（注文発送全キャンセル）${orderInfo.id} において在庫${product.product_id}の数量が${product.original_item_count} 増加しました`,
        });

        //戻った仕入れ値を取得
        const returnedWholesalePrice =
          changeResult.recordInfo?.totalWholesalePrice ?? 0;

        //元の仕入れ値から引いて格納
        await this.db.ec_Order_Cart_Store_Product.update({
          where: {
            id: product.id,
          },
          data: {
            wholesale_total_price: {
              decrement: returnedWholesalePrice,
            },
          },
        });
      }
    }
  };

  /**
   * 注文確定メール
   */
  @BackendService.WithIds(['ecOrderId'])
  public async sendOrderMail() {
    const orderInfo = await this.existingObj;

    const productTotalPrice = orderInfo.cart_stores.reduce((acc, cs) => {
      return (
        acc +
        cs.products.reduce((acc, p) => {
          return acc + p.total_unit_price * p.original_item_count;
        }, 0)
      );
    }, 0);

    const title =
      '【Mycalinks Mall】ご注文ありがとうございます(ご注文内容のご確認)';
    const bodyText = `
${orderInfo.customer_name} 様
このたびは Mycalinks Mall にてご注文いただき、誠にありがとうございます。
ご注文内容を以下の通り確認させていただきました。
ショップごとに発送のタイミングや配送方法が異なりますので、ご了承ください。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${this.getOrderBasicInfoEmailBody(orderInfo)}
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${orderInfo.cart_stores.map((cs, i) => {
  if (!cs.store)
    throw new BackendCoreError({
      internalMessage: 'メールの送信にはショップ情報も必要です',
    });

  if (!cs.shipping_method)
    throw new BackendCoreError({
      internalMessage: 'メールの送信には配送方法も必要です',
    });

  return `
ショップ${i + 1}:${cs.store.display_name}
注文番号:${cs.code}
${this.getOrderProductInfoEmailBody(cs.products)}

【送料】${cs.shipping_fee.toLocaleString()}円(配送方法:${
    cs.shipping_method!.display_name
  })
【ショップ合計】${cs.total_price.toLocaleString()}円
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
`;
})}

【ご注文合計(お支払い金額)】
商品合計:${productTotalPrice.toLocaleString()}円
送料合計:${orderInfo.shipping_total_fee.toLocaleString()}円
合計金額:${orderInfo.total_price.toLocaleString()}円
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
各ショップから発送が完了次第、別途発送完了メールをお送りします。
ご注文内容や配送に関するご不明点がございましたら、注文履歴内「注文詳細」ページ最下部にあるお問い合わせフォームよりご連絡ください。

Mycalinks Mall 自体へのご意見・ご質問などは、以下のフォームからお問い合わせください。
https://mycalinks-mall.com/contact

今後とも Mycalinks Mall をよろしくお願いいたします。
`;

    await this.sendToMessageCenter({
      mycaUserId: orderInfo.myca_user_id!,
      email: orderInfo.customer_email!,
      title,
      kind: EcMessageCenterKind.MAIL,
      content: bodyText,
    });

    //お店側にも通知する
    const taskManager = new TaskManager({
      targetWorker: 'notification',
      kind: 'sendEmail',
    });
    for (const cs of orderInfo.cart_stores) {
      const { notification_email } = cs.store!.ec_setting!;
      const targetEmails = notification_email?.split(',') ?? [];

      if (targetEmails.length > 0) {
        const to = targetEmails[0];
        const cc = targetEmails.slice(1);

        await taskManager.publish({
          body: [
            {
              to,
              cc,
              title: `【Mycalinks Mall】お客様からのご注文がありました`,
              bodyText: `
${cs.store!.display_name} 様

ECMALLにて新しいご注文が入りました。

──────────────  
■注文番号：${cs.code}  
■注文日時：${customDayjs(orderInfo.created_at)
                .tz()
                .format('YYYY/MM/DD HH:mm')}  
■ご注文者名：${orderInfo.customer_name}  
■注文金額：¥${cs.total_price.toLocaleString()}  
■商品点数：${cs.products.reduce((acc, p) => {
                return acc + p.original_item_count;
              }, 0)}点  
──────────────

注文内容の詳細は管理画面よりご確認ください。  
迅速な発送対応をお願いいたします。

▼管理画面ログイン  
${process.env.NEXT_PUBLIC_ORIGIN}/auth/ec/list

※このメールは自動送信です。  
              `,
            },
          ],
          fromSystem: true,
          service: this,
          specificGroupId: `send-email-${to}`,
        });
      }
    }
  }

  /**
   * 支払い案内
   */
  @BackendService.WithIds(['ecOrderId'])
  public async sendPaymentMail(payment: Ec_Order_Payment) {
    const orderInfo = await this.existingObj;

    const productTotalPrice = orderInfo.cart_stores.reduce((acc, cs) => {
      return (
        acc +
        cs.products.reduce((acc, p) => {
          return acc + p.total_unit_price * p.original_item_count;
        }, 0)
      );
    }, 0);

    const paymentService = new BackendCoreEcPaymentService(orderInfo.id);

    const title = '【Mycalinks Mall】お支払いのご案内';
    const bodyText = `
${orderInfo.customer_name} 様
このたびは Mycalinks Mall にてご注文いただき、誠にありがとうございます。
以下の内容にてご注文を承っております。
内容をご確認のうえ、期日までにお支払いをお願いいたします。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
お支払い方法:${ecConstants.paymentMethodDict[orderInfo.payment_method!]}
お支払い金額:${orderInfo.total_price.toLocaleString()}円
${paymentService.getCashPaymentInfo(payment).description}
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${this.getOrderBasicInfoEmailBody(orderInfo)}
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${orderInfo.cart_stores.map((cs, i) => {
  if (!cs.store)
    throw new BackendCoreError({
      internalMessage: 'メールの送信にはショップ情報も必要です',
    });

  if (!cs.shipping_method)
    throw new BackendCoreError({
      internalMessage: 'メールの送信には配送方法も必要です',
    });

  return `
ショップ${i + 1}:${cs.store.display_name}
注文番号:${cs.code}
${this.getOrderProductInfoEmailBody(cs.products)}

【送料】${cs.shipping_fee.toLocaleString()}円(配送方法:${
    cs.shipping_method!.display_name
  })
【ショップ合計】${cs.total_price.toLocaleString()}円
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
`;
})}

【ご注文合計(お支払い金額)】
商品合計:${productTotalPrice.toLocaleString()}円
送料合計:${orderInfo.shipping_total_fee.toLocaleString()}円
合計金額:${orderInfo.total_price.toLocaleString()}円
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
ご注文内容や配送に関するご不明点がございましたら、注文履歴内「注文詳細」ページ最下部にあるお問い合わせフォームよりご連絡ください。

Mycalinks Mall 自体へのご意見・ご質問などは、以下のフォームからお問い合わせください。
https://mycalinks-mall.com/contact

今後とも Mycalinks Mall をよろしくお願いいたします。
`;

    await this.sendToMessageCenter({
      mycaUserId: orderInfo.myca_user_id!,
      email: orderInfo.customer_email!,
      title,
      kind: EcMessageCenterKind.MAIL,
      content: bodyText,
    });
  }

  /**
   * 入金済み
   */
  @BackendService.WithIds(['ecOrderId'])
  public async sendPaidMail() {
    const orderInfo = await this.existingObj;

    const productTotalPrice = orderInfo.cart_stores.reduce((acc, cs) => {
      return (
        acc +
        cs.products.reduce((acc, p) => {
          return acc + p.total_unit_price * p.original_item_count;
        }, 0)
      );
    }, 0);

    const title = '【Mycalinks Mall】ご入金ありがとうございます';
    const bodyText = `
${orderInfo.customer_name} 様
このたびは Mycalinks Mall にてご注文いただき、誠にありがとうございます。
以下のご注文について、ご入金を確認いたしました。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${this.getOrderBasicInfoEmailBody(orderInfo)}
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${orderInfo.cart_stores.map((cs, i) => {
  if (!cs.store)
    throw new BackendCoreError({
      internalMessage: 'メールの送信にはショップ情報も必要です',
    });

  if (!cs.shipping_method)
    throw new BackendCoreError({
      internalMessage: 'メールの送信には配送方法も必要です',
    });

  return `
ショップ${i + 1}:${cs.store.display_name}
注文番号:${cs.code}
${this.getOrderProductInfoEmailBody(cs.products)}

【送料】${cs.shipping_fee.toLocaleString()}円(配送方法:${
    cs.shipping_method!.display_name
  })
【ショップ合計】${cs.total_price.toLocaleString()}円
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
`;
})}

【ご注文合計(お支払い金額)】
商品合計:${productTotalPrice.toLocaleString()}円
送料合計:${orderInfo.shipping_total_fee.toLocaleString()}円
合計金額:${orderInfo.total_price.toLocaleString()}円
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
商品は発送準備が整い次第、順次出荷いたします。
発送完了後、別途メールにてご案内いたします。
ご注文内容や配送に関するご不明点がございましたら、注文履歴内「注文詳細」ページ最下部にあるお問い合わせフォームよりご連絡ください。

Mycalinks Mall 自体へのご意見・ご質問などは、以下のフォームからお問い合わせください。
https://mycalinks-mall.com/contact

今後とも Mycalinks Mall をよろしくお願いいたします。
`;

    await this.sendToMessageCenter({
      mycaUserId: orderInfo.myca_user_id!,
      email: orderInfo.customer_email!,
      title,
      kind: EcMessageCenterKind.MAIL,
      content: bodyText,
    });

    //お店側にも通知する
    const taskManager = new TaskManager({
      targetWorker: 'notification',
      kind: 'sendEmail',
    });
    for (const cs of orderInfo.cart_stores) {
      const { notification_email } = cs.store!.ec_setting!;
      const targetEmails = notification_email?.split(',') ?? [];

      if (targetEmails.length > 0) {
        const to = targetEmails[0];
        const cc = targetEmails.slice(1);

        await taskManager.publish({
          body: [
            {
              to,
              cc,
              title: `【Mycalinks Mall】お客様からのご注文がありました`,
              bodyText: `
${cs.store!.display_name} 様

ECMALLにて新しいご注文が入りました。

──────────────  
■注文番号：${cs.code}  
■注文日時：${customDayjs(orderInfo.created_at)
                .tz()
                .format('YYYY/MM/DD HH:mm')}  
■ご注文者名：${orderInfo.customer_name}  
■注文金額：¥${cs.total_price.toLocaleString()}  
■商品点数：${cs.products.reduce((acc, p) => {
                return acc + p.original_item_count;
              }, 0)}点  
──────────────

注文内容の詳細は管理画面よりご確認ください。  
迅速な発送対応をお願いいたします。

▼管理画面ログイン  
${process.env.NEXT_PUBLIC_ORIGIN}/auth/ec/list

※このメールは自動送信です。  
              `,
            },
          ],
          fromSystem: true,
          service: this,
          specificGroupId: `send-email-${to}`,
        });
      }
    }
  }

  /**
   * 入金失敗
   */
  @BackendService.WithIds(['ecOrderId'])
  public async sendCashPaymentTimeoutMail(payment: Ec_Order_Payment) {
    const orderInfo = await this.existingObj;

    const productTotalPrice = orderInfo.cart_stores.reduce((acc, cs) => {
      return (
        acc +
        cs.products.reduce((acc, p) => {
          return acc + p.total_unit_price * p.original_item_count;
        }, 0)
      );
    }, 0);

    const paymentService = new BackendCoreEcPaymentService(orderInfo.id);
    const paymentInfo = paymentService.getCashPaymentInfo(payment);

    const title = '【Mycalinks Mall】ご注文のキャンセルについて';
    const bodyText = `
${orderInfo.customer_name} 様
このたびは Mycalinks Mall にてご注文いただきありがとうございました。
ご案内しておりましたお支払い期限(${customDayjs(
      paymentInfo.cashPaymentInfo.paymentExpiryDateTime,
    )
      .tz()
      .format('YYYY/MM/DD')})までにご入金が確認できなかったため、
誠に恐れ入りますが、ご注文は自動的にキャンセルとなりました。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${this.getOrderBasicInfoEmailBody(orderInfo)}
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${orderInfo.cart_stores.map((cs, i) => {
  if (!cs.store)
    throw new BackendCoreError({
      internalMessage: 'メールの送信にはショップ情報も必要です',
    });

  if (!cs.shipping_method)
    throw new BackendCoreError({
      internalMessage: 'メールの送信には配送方法も必要です',
    });

  return `
ショップ${i + 1}:${cs.store.display_name}
注文番号:${cs.code}
${this.getOrderProductInfoEmailBody(cs.products)}

【送料】${cs.shipping_fee.toLocaleString()}円(配送方法:${
    cs.shipping_method!.display_name
  })
【ショップ合計】${cs.total_price.toLocaleString()}円
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
`;
})}

【ご注文合計(お支払い金額)】
商品合計:${productTotalPrice.toLocaleString()}円
送料合計:${orderInfo.shipping_total_fee.toLocaleString()}円
合計金額:${orderInfo.total_price.toLocaleString()}円
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
再度ご希望の商品がある場合は、恐れ入りますが改めてご注文をお願いいたします。
※在庫状況によってはご注文いただけない場合もございます。あらかじめご了承ください。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
【ご注意】
未入金によるキャンセルが複数回続いた場合、今後のお取引に制限を設けさせていただく
ことがございます。
ご利用にあたりご理解・ご協力のほどよろしくお願いいたします。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
ご不明な点がございましたら、注文履歴内「注文詳細」ページ最下部にあるお問い合わせフォームよりご連絡ください。
今後とも Mycalinks Mall をよろしくお願いいたします。

Mycalinks Mall 自体へのご意見・ご質問などは、以下のフォームからお問い合わせください。
https://mycalinks-mall.com/contact

今後とも Mycalinks Mall をよろしくお願いいたします。
`;

    await this.sendToMessageCenter({
      mycaUserId: orderInfo.myca_user_id!,
      email: orderInfo.customer_email!,
      title,
      kind: EcMessageCenterKind.MAIL,
      content: bodyText,
    });
  }

  /**
   * 発送完了メール
   */
  @BackendService.WithResources(['store'])
  public async sendShippingMail(
    cs: Ec_Order_Cart_Store & {
      order: Ec_Order;
      products: Array<
        Ec_Order_Cart_Store_Product & {
          product: Product &
            ProductService.WithMeta & {
              condition_option: {
                handle: Item_Category_Condition_Option['handle'];
              } | null;
            };
        }
      >;
      shipping_method: Shipping_Method | null;
    },
  ) {
    const productTotalPrice = cs.products.reduce((acc, p) => {
      return acc + p.total_unit_price * p.original_item_count;
    }, 0);

    const title = `【Mycalinks Mall】商品を発送しました(注文番号:${cs.code})`;
    const bodyText = `
${cs.order.customer_name} 様
以下のご注文商品を、${this.resources.store!.display_name} より発送いたしました。
お届けまで今しばらくお待ちください。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${this.getOrderBasicInfoEmailBody(cs.order)}
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${this.getOrderProductInfoEmailBody(cs.products)}
【商品合計】${productTotalPrice.toLocaleString()}円
【送料】${cs.shipping_fee.toLocaleString()}円(配送方法:${
      cs.shipping_method!.display_name
    })
【合計金額】${cs.total_price.toLocaleString()}円

${this.getShippingInfoEmailBody(cs)}
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
ご注文内容や配送に関するご不明点がございましたら、注文履歴内「注文詳細」ページ最下部にあるお問い合わせフォームよりご連絡ください。

Mycalinks Mall 自体へのご意見・ご質問などは、以下のフォームからお問い合わせください。
https://mycalinks-mall.com/contact

今後とも Mycalinks Mall をよろしくお願いいたします。
`;

    await this.sendToMessageCenter({
      mycaUserId: cs.order.myca_user_id!,
      email: cs.order.customer_email!,
      orderId: cs.order.id,
      storeId: cs.store_id,
      title,
      kind: EcMessageCenterKind.MAIL,
      content: bodyText,
    });
  }

  /**
   * 注文キャンセルメール
   */
  @BackendService.WithResources(['store'])
  public async sendOrderCancelMail(
    cs: Ec_Order_Cart_Store & {
      order: Ec_Order;
      products: Array<
        Ec_Order_Cart_Store_Product & {
          product: Product &
            ProductService.WithMeta & {
              condition_option: {
                handle: Item_Category_Condition_Option['handle'];
              } | null;
            };
        }
      >;
      shipping_method: Shipping_Method | null;
    },
    cancelReason?: string | null, //キャンセル理由
  ) {
    const productTotalPrice = cs.products.reduce((acc, p) => {
      return acc + p.total_unit_price * p.original_item_count;
    }, 0);

    const title = `【Mycalinks Mall/${
      this.resources.store!.display_name
    }】ご注文キャンセルのお知らせ(注文番号:${cs.code})`;
    const bodyText = `
${cs.order.customer_name} 様
このたびは Mycalinks Mall にてご注文いただき、誠にありがとうございます。
以下のご注文につきまして、ショップ「${
      this.resources.store!.display_name
    }」によってキャンセルされましたのでご案内いたします。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${this.getOrderBasicInfoEmailBody(cs.order)}
【対象ショップ】
ショップ名:${this.resources.store!.display_name}
注文番号:${cs.code}
${
  cancelReason
    ? `キャンセル理由:
${cancelReason}`
    : ''
}
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${this.getOrderProductInfoEmailBody(cs.products)}
【商品合計】${productTotalPrice.toLocaleString()}円
【送料】${cs.shipping_fee.toLocaleString()}円(配送方法:${
      cs.shipping_method!.display_name
    })
【合計金額】${cs.total_price.toLocaleString()}円

${this.getShippingInfoEmailBody(cs)}
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
【お支払い方法】${ecConstants.paymentMethodDict[cs.order.payment_method!]}
※すでにご入金いただいている場合は、キャンセル分の返金を順次対応させていただきま
す。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
【お問い合わせについて】

ご注文にお心当たりがない場合や、キャンセル内容に関してご不明な点がございましたら、注文履歴内「注文詳細」ページ最下部にあるお問い合わせフォームよりご連絡ください。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
このたびはご迷惑をおかけし申し訳ございません。
引き続き Mycalinks Mall をよろしくお願いいたします。

Mycalinks Mall 自体へのご意見・ご質問などは、以下のフォームからお問い合わせください。
https://mycalinks-mall.com/contact

今後とも Mycalinks Mall をよろしくお願いいたします。
`;

    await this.sendToMessageCenter({
      mycaUserId: cs.order.myca_user_id!,
      email: cs.order.customer_email!,
      orderId: cs.order.id,
      storeId: cs.store_id,
      title,
      kind: EcMessageCenterKind.MAIL,
      content: bodyText,
    });
  }

  /**
   * 注文変更メール
   */
  @BackendService.WithResources(['store'])
  public async sendOrderChangeMail(
    cs: Ec_Order_Cart_Store & {
      order: Ec_Order;
      products: Array<
        Ec_Order_Cart_Store_Product & {
          product: Product &
            ProductService.WithMeta & {
              condition_option: {
                handle: Item_Category_Condition_Option['handle'];
              } | null;
            };
        }
      >;
      shipping_method: Shipping_Method | null;
    },
    returnProducts: Array<{
      product_id: Product['id'];
      item_count: number; //返品数
      unit_price: Ec_Order_Cart_Store_Product['total_unit_price']; //単価
    }>,
    cancelReason?: string | null, //欠品理由
  ) {
    const productTotalPrice = cs.products.reduce((acc, p) => {
      return acc + p.total_unit_price * p.original_item_count;
    }, 0);

    const title = `【Mycalinks Mall/${
      this.resources.store!.display_name
    }】ご注文商品の一部欠品について(注文番号:${cs.code})`;
    const bodyText = `
${cs.order.customer_name} 様
${
  this.resources.store!.display_name
} にてご注文いただき、誠にありがとうございます。
誠に申し訳ありませんが、ご注文商品のうち一部に欠品が発生いたしました。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${
  cancelReason
    ? `備考:
${cancelReason}`
    : ''
}

【欠品商品】
${returnProducts
  .map((p) => {
    const product = cs.products.find(
      (target) => target.product_id == p.product_id,
    )!;
    const ps = new BackendCoreProductService(p.product_id);
    return `
・${ps.getEcProductName(product.product)} ${p.item_count}点
`;
  })
  // arrayを表示させる際にカンマ区切りをしないようにjoinする
  .join('')}

詳しくは各ショップのキャンセルポリシーをご確認ください。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${this.getOrderProductInfoEmailBody(cs.products)}
【商品合計】${productTotalPrice.toLocaleString()}円
【送料】${cs.shipping_fee.toLocaleString()}円(配送方法:${
      cs.shipping_method!.display_name
    })
【合計金額】${cs.total_price.toLocaleString()}円

${this.getShippingInfoEmailBody(cs)}
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
${this.getOrderBasicInfoEmailBody(cs.order)}
※欠品商品分の金額はキャンセル・返金等で対応させていただきます。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
ご不明点がございましたら、注文履歴内「注文詳細」ページ最下部にあるお問い合わせフォームよりご連絡ください。このたびはご迷惑をおかけし、誠に申し訳ございません。
引き続き ${this.resources.store!.display_name} をよろしくお願いいたします。

Mycalinks Mall 自体へのご意見・ご質問などは、以下のフォームからお問い合わせください。
https://mycalinks-mall.com/contact

今後とも Mycalinks Mall をよろしくお願いいたします。
`;

    await this.sendToMessageCenter({
      mycaUserId: cs.order.myca_user_id!,
      email: cs.order.customer_email!,
      orderId: cs.order.id,
      storeId: cs.store_id,
      title,
      kind: EcMessageCenterKind.MAIL,
      content: bodyText,
    });
  }

  /**
   *
   */
  private getOrderBasicInfoEmailBody(orderInfo: Ec_Order) {
    return `
【注文日時】
${customDayjs(orderInfo.ordered_at).tz().format('YYYY/MM/DD HH:mm')}
【配送先】
${orderInfo.shipping_address}
${orderInfo.customer_name} 様
TEL:${orderInfo.customer_phone}

【お支払い方法】
${ecConstants.paymentMethodDict[orderInfo.payment_method!]}
    `;
  }

  private getOrderProductInfoEmailBody(
    products: Array<
      Ec_Order_Cart_Store_Product & {
        product: ProductService.WithMeta & {
          condition_option: {
            handle: Item_Category_Condition_Option['handle'];
          } | null;
        };
      }
    >,
  ) {
    return `
【ご注文商品】
${products
  .map((p, j) => {
    const ps = new BackendCoreProductService(p.product_id);
    const displayName = ps.getEcProductName(p.product);

    return `
${j + 1}. ${displayName}
数量:${
      p.item_count != p.original_item_count
        ? `${p.original_item_count}→${p.item_count}`
        : p.item_count
    }
単価:${p.total_unit_price.toLocaleString()}円
小計:${(p.total_unit_price * p.item_count).toLocaleString()}円

`;
  })
  .join('')}
    `;
  }

  private getShippingInfoEmailBody(cs: Ec_Order_Cart_Store) {
    //会社を選択されていない場合は空文字列
    if (!cs.shipping_company) return '';

    return `
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
【配送情報】
配送会社:${ecConstants.shippingCompanyDict[cs.shipping_company]}
${
  cs.shipping_tracking_code
    ? `お問い合わせ番号:${cs.shipping_tracking_code}`
    : ''
}
    `;
  }

  /**
   * メッセージセンターとメールに送信する
   */
  public async sendToMessageCenter({
    mycaUserId,
    email,
    title,
    kind,
    content,
    orderId,
    storeId,
  }: {
    mycaUserId: Ec_Message_Center['myca_user_id'];
    email: string;
    title: Ec_Message_Center['title'];
    kind: Ec_Message_Center['kind'];
    content: Ec_Message_Center['content'];
    orderId?: Ec_Order['id'];
    storeId?: Ec_Order_Cart_Store['store_id'];
  }) {
    //メッセージセンターに作成する

    //メールに送信する
    const taskManager = new TaskManager({
      targetWorker: 'notification',
      kind: 'sendEmail',
    });

    const [createRes] = await Promise.all([
      this.db.ec_Message_Center.create({
        data: {
          myca_user_id: mycaUserId,
          title,
          kind,
          content,
          order_id: orderId,
          store_id: storeId,
        },
      }),
      taskManager.publish({
        body: [
          {
            as: 'service',
            to: email,
            // to: 'saidajunki@gmail.com',
            bcc: ['ec-support@myca.co.jp', 'ose-rara1@kcgrp.jp'],
            title,
            bodyText: content,
          },
        ],
        fromSystem: true,
        service: this,
        specificGroupId: `send-email-${email}`,
      }),
    ]);

    return createRes;
  }

  /**
   * 領収書発行（ここでしか使わないロジックであるためPDF作成ロジックを共通化しない）
   */
  public async generateReceipt(
    cs: Ec_Order_Cart_Store & {
      order: Ec_Order;
      products: Array<
        Ec_Order_Cart_Store_Product & {
          product: Product &
            ProductService.WithMeta & {
              condition_option: {
                handle: Item_Category_Condition_Option['handle'];
              } | null;
            };
        }
      >;
      shipping_method: Shipping_Method | null;
      store: Store;
    },
    customerNameRaw: string,
    regenerate: boolean = false,
    type: 'receipt' | 'deliveryNote' = 'receipt',
  ) {
    const e = htmlEncode;

    const productTotal = cs.products.reduce((acc, p) => {
      return acc + p.total_unit_price * p.item_count;
    }, 0);

    // 必要に応じてデータを取得
    const customerName = e(
      type == 'receipt' ? customerNameRaw : cs.order.customer_name || '',
    );
    const totalAmount = e(productTotal.toLocaleString() + '円');
    const orderId = e(cs.code);
    const issueDate = e(
      customDayjs(cs.order.ordered_at).tz().format('YYYY/MM/DD'),
    );
    // const registrationNumber = 'XXXXXXXXXXXX';
    const items = cs.products.map((p) => {
      const ps = new BackendCoreProductService(p.product_id);
      this.give(ps);
      const displayName = ps.getEcProductName(p.product);
      return {
        name: e(displayName),
        qty: e(p.item_count.toLocaleString()),
        price: e(p.total_unit_price.toLocaleString() + '円'),
        subtotal: e(
          (p.total_unit_price * p.original_item_count).toLocaleString() + '円',
        ),
      };
    });

    const paymentMethod = e(
      ecConstants.paymentMethodDict[cs.order.payment_method!],
    );
    const itemTotal = e(productTotal.toLocaleString() + '円');
    // const coupon = '△500円';
    // const point = '△500円';
    // const shippingFee = e(cs.shipping_fee.toLocaleString() + '円');
    const payment = e(productTotal.toLocaleString() + '円');
    const tax10 = {
      total: productTotal.toLocaleString() + '円',
      tax: Math.round(productTotal / 11).toLocaleString() + '円',
    };

    //以下は齊田が実装
    // 会社情報
    const companyInfo = {
      name: e(cs.store.display_name!),
      address: e(cs.store.full_address!),
      tel: e(cs.store.phone_number!),
      // logoUrl: cs.store.receipt_logo_url!,
      logoUrl:
        'https://myca.cards/wp-content/themes/myca/image/header_logo.png',
      logoAlt: e(cs.store.display_name!),
    };

    const logoPng = await BackendImageUtil.logoUrlToPng(companyInfo.logoUrl);
    const logoBase64 = logoPng.buffer?.toString('base64') ?? '';
    const logoDataUrl = `data:image/png;base64,${logoBase64}`;

    const title =
      type == 'receipt' ? `領収書${regenerate ? '（再発行）' : ''}` : '納品書';

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    /* 基本スタイル */
    body { font-family: 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif; margin: 40px; }
    
    /* ヘッダー部分 */
    .header { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-info { text-align: right; font-size: 12px; }
    
    /* タイトルと顧客情報 */
    .title { text-align: center; font-size: 24px; font-weight: bold; margin: 40px 0 30px 0; }
    .customer { font-size: 16px; margin-bottom: 10px; }
    .amount { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
    .note { font-size: 12px; color: #444; margin-bottom: 20px; }
    .customer-name { text-decoration: underline; }
    
    /* セクションタイトル */
    .section-title { font-size: 16px; font-weight: bold; margin: 30px 0 10px 0; }
    
    /* テーブル共通スタイル */
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #888; padding: 3px 10px; font-size: 13px; text-align: center; }
    th { background: #f5f5f5; }
    
    /* 特殊なテーブルスタイル */
    .no-border { border: none !important; }
    .noborder-table { border: none !important; }
    
    /* 支払い情報テーブル */
    .pay-table th, .pay-table td { border: 1px solid #888; padding: 3px 10px; font-size: 13px;}
    .pay-table { width: 50%; margin-bottom: 0; }
    .pay-summary { width: 38%; float: right; margin-top: -90px; }
    
    /* 支払い方法テーブル */
    .payment-method-table { width: 100%; }
    .payment-method-table th, .payment-method-table td { 
      border: none; 
      background: none; 
      padding: 3px 10px; 
      font-size: 13px; 
      text-align: left; 
    }
    
    /* 税率テーブル */
    .tax-table { width: 40%; margin-top: 20px; }
    
    /* フッター */
    .footer { 
      margin-top: 60px; 
      width: 55%; 
      font-size: 14px; 
      margin-left: auto; 
      text-align: left;
    }
    .logo { height: 40px; margin-bottom: 1px; }
  </style>
</head>
<body>
  <!-- ヘッダー部分 -->
  <div class="header">
    <div></div>
    <div class="header-info">
      発行日：${issueDate}<br>
      注文番号：${orderId}
    </div>
  </div>
  
  <!-- タイトルと顧客情報 -->
  <div class="title">${title}</div>
  <div class="customer"><span class="customer-name">${customerName}</span> 様</div>
  <div class="amount">${totalAmount}(税込)</div>
  <div class="note">
    ${
      type == 'receipt'
        ? `但し：トレーディングカード代として<br>上記、正に領収いたしました。`
        : ''
    }
    <br>
    <span style="font-size:10px;">※記載の金額には送料は含みません。<br>
    ※支払金額は、クーポンやポイントの適用後の実際のお支払い金額です。</span>
  </div>
  <!-- 注文情報セクション -->
  <div class="section-title" style="width: 100%; border-bottom: 1px solid #000; padding-bottom: 2px;">注文情報</div>
  <table style="margin-top: 10px">
    <tr>
      <th>商品名</th>
      <th>数量</th>
      <th>単価(税込)</th>
      <th>小計(税込)</th>
    </tr>
    ${items
      .map(
        (i) => `
      <tr>
        <td style="width: 45%; text-align: left">${i.name}</td>
        <td style="width: 10%; text-align: right">${i.qty}</td>
        <td style="width: 20%; text-align: right">${i.price}</td>
        <td style="width: 25%; text-align: right">${i.subtotal}</td>
      </tr>
    `,
      )
      .join('')}
  </table>
  <!-- 支払い情報セクション -->
  <div class="section-title" style="width: 100%; border-bottom: 1px solid #000; padding-bottom: 2px;">支払い情報</div>
  <div style="display: flex; justify-content: space-between; flex-wrap: wrap; magin-top:10px">
    <!-- 支払い方法テーブル -->
    <table class="payment-method-table" style="flex: 0 0 50%; margin-right: 10px;">
      <tr>
        <th>支払方法</th>
        <td colspan="3" style="text-align: center">${paymentMethod}</td>
      </tr>
      <tr>
        <th>商品小計(税込)</th>
        <td style="text-align: center">${itemTotal}</td>
      </tr>
      <tr>
        <th>合計金額(税込)</th>
        <td style="text-align: center">${payment}</td>
      </tr>
    </table>
    <!-- 支払い内訳テーブル -->
    <table class="pay-table" style="flex: 0 0 45%;">
      <tr>
        <th colspan="2">支払い内訳</th>
      </tr>
      <tr>
        <th>${paymentMethod}</th>
        <td style="text-align: right">${payment}</td>
      </tr>
    </table>
  </div>
  
  <!-- 税率別内訳テーブル -->
  <table class="tax-table" style="flex: 0 0 30%; margin-left: auto;">
    <tr>
      <th>税率別内訳</th>
      <th>税込金額</th>
      <th>内消費税額</th>
    </tr>
    <tr>
      <th>10%対象</th>
      <td style="text-align: right">${tax10.total}</td>
      <td style="text-align: right">${tax10.tax}</td>
    </tr>
    <tr>
      <th>0%対象</th>
      <td style="text-align: right">0円</td>
      <td style="text-align: right">0円</td>
    </tr>
  </table>
  <!-- フッター（会社情報） -->
  <div class="footer">
    <img class="logo" src="${logoDataUrl}" alt="Mycalinks">
    <div style="text-align: left; line-height: 1.6; margin-left: 20px;">
      ${companyInfo.name}<br>
      ${companyInfo.address}<br>
      TEL:${companyInfo.tel}
    <div>
  </div>
</body>
</html>
      `;

    const url = await BackendPdfUtil.generatePdf({
      html,
      fileName: `${title}_${cs.code}`,
      upDir: 'ec/receipt/',
    });

    //このURLと宛名をDBに保存する
    await this.db.ec_Order_Cart_Store.update({
      where: {
        order_id_store_id: {
          order_id: cs.order_id,
          store_id: cs.store_id,
        },
      },
      data: {
        ...(type == 'receipt'
          ? {
              receipt_url: url,
              receipt_customer_name: customerNameRaw,
            }
          : {
              delivery_note_url: url,
            }),
      },
    });

    return url;
  }

  /**
   * 出荷指示書を生成する
   * @param orderId
   * @returns
   */
  public async generateShippingInstructionPdf(
    cs: Ec_Order_Cart_Store & {
      order: Ec_Order;
      products: Array<
        Ec_Order_Cart_Store_Product & {
          product: Product &
            ProductService.WithMeta & {
              condition_option: {
                handle: Item_Category_Condition_Option['handle'];
              } | null;
            };
        }
      >;
      shipping_method: Shipping_Method | null;
      store: Store;
    },
  ) {
    const e = htmlEncode;

    const thisAddress = new AddressUtil(
      cs.order.customer_address_info_json as AddressUtil.Info,
    );

    const data = {
      orderNumber: cs.code,
      orderDate: customDayjs(cs.order.ordered_at).tz().format('YYYY年MM月DD日'),
      shippingDate: customDayjs().tz().format('YYYY年MM月DD日'),
      customerName: cs.order.customer_name,
      postalCode: thisAddress.info?.zipCode ?? '',
      address: thisAddress.toString(),
      phoneNumber: thisAddress.info?.phoneNumber ?? '',
      items: cs.products.map((product) => {
        const thisProduct = new BackendCoreProductService(product.product_id);
        const displayName = thisProduct.getEcProductName(product.product);

        return {
          itemName: displayName,
          quantity: product.item_count,
          unitPrice: product.total_unit_price,
          subtotal: product.total_unit_price * product.item_count,
          memo: '',
        };
      }),
    };

    const title = `ピッキング指示書`;

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif; margin: 40px; }
    .title { text-align: center; font-size: 14px; font-weight: bold; margin: 20px 0; }
    .section { margin: 20px 0; }
    .section-title { font-size: 12px; font-weight: bold; margin: 15px 0 10px 0; }
    .info-grid { display: flex; flex-direction: column; gap: 5px; margin: 10px 0; width: 60%; }
    .info-grid-item { 
      border-bottom: 1px solid #333; 
      padding-bottom: 3px; 
      display: flex; 
      flex-direction: row; 
      align-items: center;
      gap: 8px;
    }
    .info-label { font-weight: bold; font-size: 12px; width: 80px; }
    .info-value { font-size: 12px; }
    table { border-collapse: collapse; width: 100%; margin: 15px 0; }
    th, td { border: 1px solid #333; padding: 4px 3px; text-align: center; font-size: 12px;}
    th { background: #f5f5f5; font-weight: bold; }
    .memo-box { border: 1px solid #333; height: 80px; padding: 10px; margin: 10px 0; font-size: 12px; }
    .work-table { width: 40%; margin-top: 20px; margin-left: auto; table-layout: fixed;}
    .work-table th, .work-table td { height: 40px; width: 25%; }
    .note { font-size: 12px; margin: 20px 0; text-align: left; }
  </style>
</head>
<body>
  <div class="title">【${title}】</div>
  
  <div class="section">
    <div class="info-grid">
      <div class="info-grid-item">
        <div class="info-label">注文番号：</div>
        <div class="info-value">${e(data.orderNumber)}</div>
      </div>
      <div class="info-grid-item">
        <div class="info-label">注文日：</div>
        <div class="info-value">${e(data.orderDate)}</div>
      </div>
      <div class="info-grid-item">
        <div class="info-label">出荷予定日：</div>
        <div class="info-value">${e(data.shippingDate)}</div>
      </div>
      <div class="info-grid-item">
        <div class="info-label">担当者：</div>
        <div class="info-value">               </div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">＜出荷先情報＞</div>
    <div class="info-grid">
      <div class="info-grid-item">
        <div class="info-label">お名前：</div>
        <div class="info-value">${e(data.customerName ?? '')}</div>
      </div>
      <div class="info-grid-item">
        <div class="info-label">郵便番号：</div>
        <div class="info-value">${e(data.postalCode)}</div>
      </div>
      <div class="info-grid-item">
        <div class="info-label">住所：</div>
        <div class="info-value">${e(data.address)}</div>
      </div>
      <div class="info-grid-item">
        <div class="info-label">電話番号：</div>
        <div class="info-value">${e(data.phoneNumber)}</div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">＜商品リスト＞</div>
    <table>
      <tr>
        <th style="width: 47%">商品名</th>
        <th style="width: 8%">チェック欄</th>
        <th style="width: 15%">備考</th>
        <th style="width: 8%">数量</th>
        <th style="width: 11%">単価(税込)</th>
        <th style="width: 11%">小計(税込)</th>
      </tr>
      ${data.items
        .map(
          (item) => `
      <tr>
        <td style="text-align: left">${e(item.itemName)}</td>
        <td>□</td>
        <td>${e(item.memo || '')}</td>
        <td>${e(item.quantity.toString())}</td>
        <td style="text-align: right">${e(
          item.unitPrice?.toLocaleString() || '',
        )}</td>
        <td style="text-align: right">${e(
          item.subtotal?.toLocaleString() || '',
        )}</td>
      </tr>
      `,
        )
        .join('')}
      <tr>
        <td colspan="5" style="text-align: right; font-weight: bold; padding-right: 10px;">商品合計(税込)</td>
        <td colspan="1">${e(
          data.items
            .reduce((acc, item) => acc + item.subtotal, 0)
            .toLocaleString(),
        )}</td>
      </tr>
    </table>
  </div>
  <div class="section">
    <div class="section-title">＜出荷メモ＞</div>
    <div class="memo-box">                    </div>
  </div>
  <div class="note">※ピッキング後はチェック欄に✔を入れてください。</div>
  <table class="work-table">
    <tr>
      <th>ピッキング</th>
      <th>検品</th>
      <th>梱包</th>
      <th>請求書</th>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </table>
</body>
</html>
    `;

    const url = await BackendPdfUtil.generatePdf({
      html,
      fileName: `${title}_${cs.code}`,
      upDir: 'ec/receipt/',
    });

    return url;
  }

  /**
   * フィールド
   */
  public field = {
    ecOrder: {
      //顧客
      select: {
        id: true,
        code: true,
        status: true,
        payment_method: true,
        payment_info: true,
        customer_name: true,
        shipping_address: true,
        shipping_address_prefecture: true,
        shipping_total_fee: true,
        total_price: true,
        ordered_at: true,
        cart_stores: {
          select: {
            store_id: true,
            store: {
              select: {
                display_name: true,
              },
            },
            total_price: true,
            shipping_method_id: true,
            shipping_fee: true,
            shipping_method: {
              select: {
                display_name: true,
              },
            },
            shipping_company: true,
            shipping_tracking_code: true,
            receipt_customer_name: true, //レシートの宛名
            status: true,
            code: true,
            products: {
              select: {
                product_id: true,
                total_unit_price: true,
                original_item_count: true,
                item_count: true,
                product: {
                  select: {
                    ec_stock_number: true,
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
      } satisfies Prisma.Ec_OrderSelect,
    },
    ecOrderCartStore: {
      select: {
        order: {
          select: {
            id: true,
            payment_method: true,
            myca_user_id: true,
            customer_phone: true,
            customer_email: true,
            customer_name: true,
            shipping_address: true,
            ordered_at: true,
            platform: true,
          },
        },
        shipping_method: {
          select: {
            id: true,
            display_name: true,
          },
        },
        shipping_tracking_code: true,
        shipping_company: true,
        shipping_fee: true,
        total_price: true,
        status: true,
        read: true,
        code: true,
        products: {
          select: {
            id: true,
            product: {
              select: {
                specialty: {
                  select: {
                    display_name: true,
                  },
                },
                id: true,
                display_name: true,
                item: {
                  select: {
                    expansion: true,
                    rarity: true,
                    cardnumber: true,
                  },
                },
                ec_stock_number: true,
                management_number: true,
              },
            },
            total_unit_price: true,
            original_item_count: true,
            item_count: true,
          },
        },
      } satisfies Prisma.Ec_Order_Cart_StoreSelect,
    },
  };
}
