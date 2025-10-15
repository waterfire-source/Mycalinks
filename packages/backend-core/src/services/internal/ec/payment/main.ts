//GMO関連

import {
  App_User,
  Ec_Order,
  Ec_Order_Cart_Store,
  Ec_Order_Payment,
  EcOrderCartStoreStatus,
  EcOrderStatus,
  EcPaymentMethod,
  EcPaymentService,
  EcPaymentStatus,
  Gmo_Credit_Card,
  PaymentMode,
  Prisma,
  TaskSourceKind,
} from '@prisma/client';
import { BackendService } from '@/services/internal/main';
import { BackendCoreError } from '@/error/main';
import { BackendExternalGmoService } from '@/services/external';
import {
  CashResult,
  mulpay_2,
  Phone,
} from '@/services/external/gmo/openApiClient';
import { EcOrderTask, TaskManager } from '@/task/main';
import { customDayjs, ecConstants } from 'common';
import { BackendCoreGmoService } from '@/services/internal/gmo/main';

/**
 * ECの支払い系
 */
export class BackendCoreEcPaymentService extends BackendService {
  public config = {
    paymentMethods: {
      all: Object.values(EcPaymentMethod),
      immediate: [EcPaymentMethod.CARD], //即時で決済できるやつ
      dict: ecConstants.paymentMethodDict,
    },
  };

  constructor(ecOrderId?: Ec_Order['id']) {
    super();
    this.setIds({
      ecOrderId,
    });
  }

  public targetObject?: Ec_Order & {
    payments: Array<Ec_Order_Payment>;
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
        include: { payments: true },
      });

      if (!obj)
        throw new BackendCoreError({
          internalMessage: 'ECオーダーが見つかりません',
        });

      this.targetObject = obj;

      return this.targetObject;
    })();
  }

  /**
   * 決済を行う
   * 即時決済の場合はその場で支払いを確定する
   * 非即時の場合はUNPAIDにして仮確定
   */
  @BackendService.WithTx
  @BackendService.WithIds(['ecOrderId'])
  public createPayment = async ({
    paymentMethod,
    cardId,
    convenienceCode,
  }: {
    paymentMethod: EcPaymentMethod;
    cardId?: Gmo_Credit_Card['id'];
    convenienceCode?: mulpay_2;
  }): Promise<{
    ecOrder: Ec_Order;
    gmoRes:
      | Awaited<
          ReturnType<
            (typeof BackendExternalGmoService)['prototype']['createEcCardPayment']
          >
        >['createChargeRes']
      | null;
    redirectUrl: string | null;
    paymentInfo: CashResult | null;
    ecPayment: Ec_Order_Payment;
  }> => {
    const thisOrderInfo = await this.existingObj;

    //下書きじゃなかったエラー
    if (thisOrderInfo.status != EcOrderStatus.DRAFT)
      throw new BackendCoreError({
        internalMessage: '下書きではないECオーダーです',
      });

    //電話番号が登録されてなかったらエラー
    if (!thisOrderInfo.customer_phone) {
      throw new BackendCoreError({
        internalMessage: '電話番号が登録されていません',
        externalMessage: `
電話番号が登録されていません
会員証メニューより設定をよろしくお願いいたします
`,
      });
    }

    //電話番号が登録されてなかったらエラー
    if (!thisOrderInfo.customer_name) {
      throw new BackendCoreError({
        internalMessage: '名前が登録されていません',
        externalMessage: `
名前が登録されていません
会員証メニューより設定をよろしくお願いいたします
`,
      });
    }

    //電話番号が登録されてなかったらエラー
    if (!thisOrderInfo.customer_name_ruby) {
      throw new BackendCoreError({
        internalMessage: '名前のフリガナが登録されていません',
        externalMessage: `
名前のフリガナが登録されていません
会員証メニューより設定をよろしくお願いいたします
`,
      });
    }

    let gmoRes:
      | Awaited<
          ReturnType<
            typeof BackendExternalGmoService.prototype.createEcCardPayment
          >
        >['createChargeRes']
      | null = null;

    const gmoService = new BackendExternalGmoService('ec');

    const ecOrderInput: Prisma.Ec_OrderUpdateInput = {
      payment_method: paymentMethod,
      payment_method_display_name:
        this.config.paymentMethods.dict[paymentMethod],
      status: EcOrderStatus.UNPAID,
    };

    const ecOrderCartStoreInput: Prisma.Ec_Order_Cart_StoreUpdateInput = {};

    const paymentInput: Prisma.Ec_Order_PaymentUpdateInput = {};

    let redirectUrl: string | null = null;
    let paymentInfo: CashResult | null = null;

    //Paymentを先に作成する
    const payment = await this.db.ec_Order_Payment.create({
      data: {
        order_id: thisOrderInfo.id,
        mode: PaymentMode.pay,
        method: paymentMethod,
        service: EcPaymentService.ORIGINAL,
        total_amount: thisOrderInfo.total_price,
      },
    });

    const paymentId = payment.id;

    //この下から決済
    //後に関数化する可能性が高い
    switch (paymentMethod) {
      //カード払い
      case EcPaymentMethod.CARD: {
        if (!cardId)
          throw new BackendCoreError({
            internalMessage: 'カードIDが指定されていません',
          });

        //このカードIDからGMOのカードIDを取得する
        const cardInfo = await this.db.gmo_Credit_Card.findUnique({
          where: {
            id: cardId,
            app_user_id: thisOrderInfo.myca_user_id,
          },
        });

        if (!cardInfo)
          throw new BackendCoreError({
            internalMessage: 'このカードIDは存在しません',
            externalMessage: `存在しないカードを指定しています`,
          });

        const {
          createChargeRes,
          redirectUrl: gmoRedirectUrl,
          accessId,
          finished,
        } = await gmoService.createEcCardPayment({
          orderId: thisOrderInfo.id,
          paymentId,
          payer: {
            name: thisOrderInfo.customer_name.replaceAll(' ', '') ?? '名前なし',
            nameKana:
              thisOrderInfo.customer_name_ruby.replaceAll(' ', '') ??
              'ナマエナシ',
            phones: [
              {
                type: Phone.type.MOBILE,
                countryCode: '81',
                number: thisOrderInfo.customer_phone ?? '',
              },
            ],
            email: thisOrderInfo.customer_email ?? '',
            accountId: `mycaApp-${thisOrderInfo.myca_user_id}`,
          },
          totalAmount: thisOrderInfo.total_price,
          cardInfo,
        });

        gmoRes = createChargeRes;
        redirectUrl = gmoRedirectUrl;

        if (
          'creditResult' in createChargeRes &&
          createChargeRes.creditResult &&
          createChargeRes.creditResult.cardResult
        ) {
          const cardInfo = createChargeRes.creditResult.cardResult;

          paymentInput.card__exp_month = Number(cardInfo.expiryMonth);
          paymentInput.card__exp_year = Number(cardInfo.expiryYear);
          paymentInput.card__last_4 = cardInfo.cardNumber?.slice(-4);
        }

        paymentInput.source_id = accessId;
        paymentInput.service = EcPaymentService.GMO;

        console.log(gmoRes);

        //すでに決済が完了していたらPAIDにする 3Dセキュアがない時の対応
        if (finished) {
          ecOrderInput.status = EcOrderStatus.PAID;
          ecOrderCartStoreInput.status =
            EcOrderCartStoreStatus.PREPARE_FOR_SHIPPING;
          paymentInput.status = EcPaymentStatus.COMPLETED;
        } else {
          //3Dセキュアがある時、5分後に決済ができてなかったらキャンセルをする
          const taskManager = new TaskManager({
            targetWorker: 'ecOrder',
            kind: 'paymentTimeout',
          });

          await taskManager.publish<EcOrderTask.EcOrderPaymentTimeout>({
            body: [
              {
                order_id: thisOrderInfo.id,
              },
            ],
            service: this,
            fromSystem: true, //タスクを作成しない
            delaySeconds: gmoService.config.cardPaymentTimeout,
          });
        }

        break;
      }

      //現金決済系
      case EcPaymentMethod.BANK:
      case EcPaymentMethod.CONVENIENCE_STORE: {
        if (
          paymentMethod == EcPaymentMethod.CONVENIENCE_STORE &&
          !convenienceCode
        )
          throw new BackendCoreError({
            internalMessage: 'コンビニコードが指定されていません',
          });

        const {
          createChargeRes,
          accessId,
          paymentInfo: gmoPaymentInfo,
        } = await gmoService.createEcCashPayment({
          orderId: thisOrderInfo.id,
          paymentId,
          payer: {
            name: thisOrderInfo.customer_name ?? '名前なし',
            nameKana: thisOrderInfo.customer_name_ruby ?? 'ナマエナシ',
            phones: [
              {
                type: Phone.type.MOBILE,
                countryCode: '81',
                number: thisOrderInfo.customer_phone ?? '',
              },
            ],
            email: thisOrderInfo.customer_email ?? '',
            accountId: `mycaApp-${thisOrderInfo.myca_user_id}`,
          },
          totalAmount: thisOrderInfo.total_price,
          paymentMethod,
          konbiniCode: convenienceCode,
        });

        console.log(createChargeRes);

        gmoRes = createChargeRes;

        paymentInput.source_id = accessId;
        paymentInput.payment_info_json = gmoPaymentInfo;
        ecOrderInput.payment_info = gmoPaymentInfo;
        paymentInfo = gmoPaymentInfo ?? null;
        paymentInput.service = EcPaymentService.GMO;
        ecOrderCartStoreInput.status = EcOrderCartStoreStatus.UNPAID;

        const limitDate = new Date(paymentInfo?.paymentExpiryDateTime!);
        const now = new Date();
        const diff = limitDate.getTime() - now.getTime();
        let remainSeconds = Math.floor(diff / 1000);

        //ステージングの場合は30分にする
        if (process.env.NEXT_PUBLIC_DATABASE_KIND == 'staging') {
          remainSeconds = 30 * 60;
        }

        //受付終了と同時にタイムアウト
        const taskManager = new TaskManager({
          targetWorker: 'ecOrder',
          kind: 'paymentTimeout',
        });

        await taskManager.publish<EcOrderTask.EcOrderPaymentTimeout>({
          body: [
            {
              order_id: thisOrderInfo.id,
            },
          ],
          service: this,
          fromSystem: true,
          delaySeconds: remainSeconds,
        });

        break;
      }

      case EcPaymentMethod.CASH_ON_DELIVERY: {
        ecOrderInput.status = EcOrderStatus.PAID;
        ecOrderCartStoreInput.status =
          EcOrderCartStoreStatus.PREPARE_FOR_SHIPPING;
        ecOrderInput.payment_method = paymentMethod;
        paymentInput.service = EcPaymentService.ORIGINAL;
        paymentInput.description = `EC取引${thisOrderInfo.id} の初回決済として 支払い方法${paymentMethod} で${thisOrderInfo.total_price}円の支払いを即時作成しました`;
        paymentInput.status = EcPaymentStatus.COMPLETED;
        break;
      }
      default: {
        throw new BackendCoreError({
          internalMessage: 'この支払い方法は現在対応していません',
          externalMessage: 'この支払い方法は現在対応していません',
        });
      }
    }

    const [updateEcRes, createPaymentRes] = await Promise.all([
      this.db.ec_Order.update({
        where: {
          id: thisOrderInfo.id,
        },
        data: {
          ...ecOrderInput,
          cart_stores: {
            updateMany: {
              where: {},
              data: ecOrderCartStoreInput,
            },
          },
        },
      }),
      this.db.ec_Order_Payment.update({
        where: { id: paymentId },
        data: paymentInput,
      }),
    ]);

    return {
      ecOrder: updateEcRes,
      ecPayment: createPaymentRes,
      gmoRes,
      redirectUrl,
      paymentInfo,
    };
  };

  /**
   * 仮決済を確定させる
   */
  @BackendService.WithTx
  @BackendService.WithIds(['ecOrderId'])
  public capturePayment = async () => {
    const obj = await this.existingObj;
  };

  /**
   * 部分返金（全額返金も可能）
   * ストアが結びついていないといけない
   */
  @BackendService.WithTx
  @BackendService.WithIds(['ecOrderId', 'storeId'])
  @BackendService.WithResources(['store'])
  public refundPartialPayment = async ({
    amount,
  }: {
    amount: number;
  }): Promise<{
    ecOrder: Ec_Order;
    gmoRes:
      | Awaited<
          ReturnType<
            (typeof BackendExternalGmoService)['prototype']['createEcCardPayment']
          >
        >['createChargeRes']
      | null;
    ecPayment: Ec_Order_Payment;
    ecStoreCart: Ec_Order_Cart_Store;
  }> => {
    if (amount <= 0)
      throw new BackendCoreError({
        internalMessage: '返金する金額が0円以下です',
      });

    const thisOrderInfo = await this.existingObj;

    //このストアのカートと過去の決済も取得する
    const [thisStoreCart, thisOrderPayment] = await Promise.all([
      this.db.ec_Order_Cart_Store.findUnique({
        where: {
          order_id_store_id: {
            order_id: thisOrderInfo.id,
            store_id: this.ids.storeId!,
          },
        },
      }),
      this.db.ec_Order_Payment.findFirst({
        where: {
          order_id: thisOrderInfo.id,
          mode: PaymentMode.pay,
          status: EcPaymentStatus.COMPLETED,
        },
      }),
    ]);

    if (!thisStoreCart)
      throw new BackendCoreError({
        internalMessage: 'このECオーダーにはこのストアのカートがありません',
      });

    // if (!thisOrderPayment) 有効な決済が行われていなくても返金しないといけないケースがあるためコメントアウト
    //   throw new BackendCoreError({
    //     internalMessage: 'このECオーダーでは有効な決済が行われていません',
    //   });

    const newTotalPrice = thisOrderInfo.total_price - amount;
    const newStoreTotalPrice = thisStoreCart.total_price - amount;

    //有効なステータスか確認（draft, canceled, completedはダメ）
    if (
      thisStoreCart.status == EcOrderCartStoreStatus.DRAFT ||
      thisStoreCart.status == EcOrderCartStoreStatus.COMPLETED
    )
      throw new BackendCoreError({
        internalMessage: 'このオーダーは返金できるステータスではありません',
      });

    let gmoRes:
      | Awaited<
          ReturnType<
            typeof BackendExternalGmoService.prototype.createEcCardPayment
          >
        >['createChargeRes']
      | null = null;

    const gmoService = new BackendExternalGmoService('ec');

    const paymentInput: Prisma.Ec_Order_PaymentUpdateInput = {};

    //Paymentを先に作成する
    const payment = await this.db.ec_Order_Payment.create({
      data: {
        order_id: thisOrderInfo.id,
        store_id: this.ids.storeId!,
        mode: PaymentMode.refund,
        method: thisOrderInfo.payment_method!,
        service: EcPaymentService.ORIGINAL,
        total_amount: -1 * amount,
        description: `EC取引${thisOrderInfo.id} のストア${this.ids.storeId}の返金決済として 支払い方法${thisOrderInfo.payment_method} で${amount}円の返金を作成しました`,
      },
    });

    const paymentId = payment.id;

    //この下から決済
    //後に関数化する可能性が高い
    switch (thisOrderInfo.payment_method) {
      //カード払い
      case EcPaymentMethod.CARD: {
        if (!thisOrderPayment?.source_id)
          throw new BackendCoreError({
            internalMessage: 'このECオーダーでは有効な決済が行われていません',
          });

        const createRefundRes = await gmoService.createEcCardRefund({
          accessId: thisOrderPayment.source_id,
          toAmount: newTotalPrice,
        });

        gmoRes = createRefundRes;

        paymentInput.service = EcPaymentService.GMO;
        paymentInput.status = EcPaymentStatus.COMPLETED;

        break;
      }

      //現金決済系
      case EcPaymentMethod.CASH_ON_DELIVERY:
      case EcPaymentMethod.BANK:
      case EcPaymentMethod.CONVENIENCE_STORE: {
        //現金決済の返金はできないため、GMOは経由せず、とりあえず返金できたことにする
        console.log(`現金決済の返金を行います`);

        //ここで管理者？に通知する
        const taskManager = new TaskManager({
          targetWorker: 'notification',
          kind: 'sendEmail',
        });

        await taskManager.publish({
          body: [
            {
              as: 'system',
              to: 'ec-support@myca.co.jp',
              title: 'ECのカード決済以外の返金が必要です',
              bodyText: `
ECオーダー${thisOrderInfo.id}
のストア${this.ids.storeId}の返金決済として
支払い方法${thisOrderInfo.payment_method}
で${amount}円の返金を作成しました

このお客さんは
${
  thisOrderPayment
    ? `
すでに${thisOrderPayment.total_amount}円払っています
  `
    : `
  まだ支払いが完了していませんが、システムの都合上、返金が必要です
  `
}

Myca会員ID: ${thisOrderInfo.myca_user_id}
ユーザー: ${thisOrderInfo.customer_name}
メールアドレス: ${thisOrderInfo.customer_email}
`,
            },
          ],
          service: this,
          hiddenTask: true,
          source: TaskSourceKind.API,
          processDescription: `ECの非即時決済の返金を行うためのメール`,
        });

        paymentInput.status = EcPaymentStatus.COMPLETED;

        break;
      }

      default: {
        throw new BackendCoreError({
          internalMessage: 'この支払い方法は現在対応していません',
          externalMessage: 'この支払い方法は現在対応していません',
        });
      }
    }

    const [updateEcRes, updatePaymentRes, updateStoreCartRes] =
      await Promise.all([
        this.db.ec_Order.update({
          where: { id: thisOrderInfo.id },
          data: {
            total_price: newTotalPrice,
          },
        }),
        this.db.ec_Order_Payment.update({
          where: { id: paymentId },
          data: paymentInput,
        }),
        this.db.ec_Order_Cart_Store.update({
          where: {
            order_id_store_id: {
              order_id: thisOrderInfo.id,
              store_id: this.ids.storeId!,
            },
          },
          data: {
            total_price: newStoreTotalPrice,
          },
        }),
      ]);

    return {
      ecPayment: updatePaymentRes,
      ecOrder: updateEcRes,
      ecStoreCart: updateStoreCartRes,
      gmoRes,
    };
  };

  /**
   * 仮決済キャンセル、返金
   */

  /**
   *
   */
  public getCashPaymentInfo(payment: Ec_Order_Payment) {
    const cashPaymentInfo = payment.payment_info_json as {
      cashType: 'KONBINI' | 'BANK_TRANSFER_GMO_AOZORA';
      paymentExpiryDateTime: string;
      konbiniPaymentInformation?: {
        voucherUrl?: string;
        konbiniCode: string;
        receiptNumber: string;
        confirmationNumber: string;
      };
      bankTransferPaymentInformation?: {
        bankCode: string;
        bankName: string;
        bankTransferCode?: string;
        branchCode: string;
        branchName: string;
        accountType: string;
        accountNumber: string;
        accountHolderName: string;
      };
    };

    let description = `
お支払い期限:${customDayjs(cashPaymentInfo.paymentExpiryDateTime).format(
      'YYYY/MM/DD',
    )}
お支払い先情報:

`;

    switch (cashPaymentInfo.cashType) {
      case 'KONBINI': {
        const info = cashPaymentInfo.konbiniPaymentInformation!;
        description += `
コンビニ名:${ecConstants.konbiniCodeDict[info.konbiniCode]}
${info.voucherUrl ? `払込票URL:${info.voucherUrl}` : ''}
受付番号:${info.receiptNumber}
確認番号:${info.confirmationNumber}

実際のお支払い方法につきましては、以下のリンクをご参照ください。
https://mycalinks-mall.com/archives/3202
        `;
        break;
      }

      case 'BANK_TRANSFER_GMO_AOZORA': {
        const info = cashPaymentInfo.bankTransferPaymentInformation!;
        description += `
銀行コード:${info.bankCode}
銀行名:${info.bankName}
支店コード:${info.branchCode}
支店名:${info.branchName}
口座種目:${info.accountType}
口座番号:${info.accountNumber}
口座名義人名:${info.accountHolderName}
${info.bankTransferCode ? `振込コード:${info.bankTransferCode}` : ''}
        `;
        break;
      }
    }

    description += `
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
お支払い期限を過ぎた場合、ご注文は自動的にキャンセルとなります。
また、繰り返し未入金が続いた場合には、今後のご利用に制限がかかる可能性がございます。
ご理解のほどよろしくお願いいたします。    
`;

    return { description, cashPaymentInfo };
  }

  /**
   * カードを保存
   */
  public async saveCard({
    token,
    appUserId,
  }: {
    token: string;
    appUserId: App_User['app_user_id'];
  }) {
    //メンバーを取得
    const appUser = await this.getAppGmoUser(appUserId);

    //すでにカードが登録されているか確認
    const existingCard = await this.db.gmo_Credit_Card.findFirst({
      where: {
        app_user_id: appUserId,
        is_primary: true,
      },
    });

    //カードを保存する
    const gmoService = new BackendCoreGmoService('ec');
    this.give(gmoService);

    const saveCardRes = await gmoService.client.saveCard({
      token,
      memberId: appUser.gmo_customer_id,
      cardId: existingCard?.card_id,
    });

    if (!saveCardRes.cardResult || !saveCardRes.onfileCardResult)
      throw new BackendCoreError({
        internalMessage: '決済システムエラー',
      });

    //カードレコードを作成 or 更新
    const createCardRes = await this.db.gmo_Credit_Card.upsert({
      where: {
        id: existingCard?.id ?? 0,
      },
      create: {
        customer_id: appUser.gmo_customer_id,
        card_id: saveCardRes.onfileCardResult.cardId!,
        masked_card_number: saveCardRes.cardResult.cardNumber!,
        name: saveCardRes.cardResult.cardholderName!,
        expire_month: saveCardRes.cardResult.expiryMonth!,
        expire_year: saveCardRes.cardResult.expiryYear!,
        issue_code: saveCardRes.cardResult.issuerCode!,
        brand: saveCardRes.cardResult.brand!,
        app_user_id: appUserId,
      },
      update: {
        masked_card_number: saveCardRes.cardResult.cardNumber!,
        name: saveCardRes.cardResult.cardholderName!,
        expire_month: saveCardRes.cardResult.expiryMonth!,
        expire_year: saveCardRes.cardResult.expiryYear!,
        issue_code: saveCardRes.cardResult.issuerCode!,
        brand: saveCardRes.cardResult.brand!,
      },
    });

    //こいつ以外、すべてプライマリーじゃなくする
    await this.db.gmo_Credit_Card.updateMany({
      where: {
        app_user_id: appUserId,
        id: {
          not: createCardRes.id,
        },
      },
      data: {
        is_primary: false,
      },
    });

    return createCardRes;
  }

  /**
   * アプリユーザーがあったら取得、なかったら作成する gmo会員としても結びつける
   * [TODO] BackendCoreAppServiceみたいなのを作って移行するかも
   */
  public async getAppGmoUser(appUserId: App_User['app_user_id']) {
    //すでに存在するか調べる
    const appUser = await this.db.app_User.findUnique({
      where: { app_user_id: appUserId },
      include: {
        cards: true,
      },
    });

    if (appUser) {
      return appUser;
    }

    //なかったら作る
    const gmoService = new BackendExternalGmoService('ec');
    const createMemberRes = await gmoService.createMember({
      id: appUserId,
    });

    const newAppUser = await this.db.app_User.create({
      data: {
        app_user_id: appUserId,
        gmo_customer_id: createMemberRes.memberId!,
      },
      include: {
        cards: true,
      },
    });

    return newAppUser;
  }

  /**
   * この支払い方法で耐えるか確認
   */
  public judgePaymentAvailable({
    paymentMethod,
    totalPrice,
  }: {
    paymentMethod: EcPaymentMethod;
    totalPrice: number;
  }) {
    //代引き、コンビニでは300000円以下じゃないといけない
    switch (paymentMethod) {
      case EcPaymentMethod.CASH_ON_DELIVERY:
      case EcPaymentMethod.CONVENIENCE_STORE: {
        if (totalPrice >= 300000) {
          throw new BackendCoreError({
            internalMessage:
              '代引き、コンビニでは300000円以下じゃないといけない',
            externalMessage:
              '代引き、コンビニ支払いは300,000円以下でのみご利用可能です',
          });
        }
        break;
      }
    }
  }
}
