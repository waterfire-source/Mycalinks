//GMO関連

import {
  AuthorizationMode,
  CashService,
  CreditcardService,
  CreditChargeOptions,
  MemberService,
  mulpay,
  mulpay_2,
  NextAction,
  OnfileCardType,
  OrderInquiryResponse,
  OrderService,
  Payer,
  StatusCash,
  StatusCredit,
  TokenizedCard,
  TransactionType,
} from '@/services/external/gmo/openApiClient';
import {
  Contract,
  Contract_Payment,
  Ec_Order,
  Ec_Order_Payment,
  EcPaymentMethod,
  Gmo_Credit_Card,
} from '@prisma/client';
import { BackendCoreError } from '@/error/main';

//[TODO] 外部サービスとして定義
export class BackendExternalGmoService {
  public config = {
    // member: {
    //   init: {
    //     corporation: 'corporation',
    //     appUser: 'appUser',
    //   },
    // },
    currency: 'JPY',
    auth: {},
    merchant: {
      name: '株式会社Myca',
      nameKana: 'カブシキガイシャマイカ',
      nameAlphabet: 'Myca Inc.',
      nameShort: 'Myca',
      contactName: '株式会社Myca',
      contactPhone: '029-828-8410',
      contactOpeningHours: '10:00-17:00',
    },
    callbackUrl: {
      ec: `${process.env.NEXT_PUBLIC_ORIGIN}/api/ec/order/[order_id]/pay/callback`,
      contract: `${process.env.NEXT_PUBLIC_ORIGIN}/api/contract/pay/callback`,
    },
    paymentPeriod: 5, //支払い受付期間は5日間のみ
    cardPaymentTimeout: 60 * 5, //カード決済のタイムアウトは5分
    webhookUrl: {
      fromServerIp: ['210.175.7.20', '210.197.108.196'],
      ec: `${process.env.GMO_WEBHOOK_URL}?type=ec`,
      // ec: `https://ba90210fe065.ngrok-free.app/api/gmo/webhook?type=ec`,
      contract: `${process.env.GMO_WEBHOOK_URL}?type=contract`,
    },
    testCards: [''],
  };

  constructor(public mode: 'contract' | 'ec' = 'ec') {}

  /**
   * アクセストークンを発行する
   */
  // public issueAccessToken = async () => {
  //   const res = await TokenService.token({
  //     grant_type: TokenRequest.grant_type.CLIENT_CREDENTIALS,
  //     scope: TokenRequest.scope.OPENAPI,
  //   });

  //   const res = await fetch('https://stg.oauth.mul-pay.jp/token', {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer`
  //     }
  //   })

  //   return res;
  // };

  /**
   * 顧客をGMO上に作成する
   */
  public createMember = async ({
    id,
  }: {
    id: number; //リソースのID
  }) => {
    const memberId = `${this.mode}-${id}`;

    const createMemberRes = await MemberService.memberCreate(
      {
        memberId,
      },
      `createUser-${memberId}`,
      this.mode,
    );

    return createMemberRes;
  };

  public getEcPaymentCommonPayload = ({
    orderId,
    paymentId,
    totalAmount,
  }: {
    orderId: Ec_Order['id'];
    paymentId: Ec_Order_Payment['id'];
    totalAmount: number;
  }) => {
    // const gmoOrderId = `ec-test-${orderId}-payment-${paymentId}`;
    const gmoOrderId = `ec-order-${orderId}-payment-${paymentId}`;

    return {
      merchant: {
        ...this.config.merchant,
        callbackUrl: this.config.callbackUrl.ec.replace(
          '[order_id]',
          String(orderId),
        ),
        webhookUrl: this.config.webhookUrl.ec,
      },
      order: {
        orderId: gmoOrderId,
        amount: String(totalAmount),
        currency: this.config.currency,
        transactionType: TransactionType.CIT,
      },
    };
  };

  public getContractPaymentCommonPayload = ({
    from,
    contractId,
    paymentId,
    totalAmount,
  }: {
    from: 'system' | 'customer';
    contractId: Contract['id'];
    paymentId: Contract_Payment['id'];
    totalAmount: number;
  }) => {
    const gmoOrderId = `pos-contract-${paymentId}-pay`;

    return {
      merchant: {
        ...this.config.merchant,
        callbackUrl: this.config.callbackUrl.contract,
        webhookUrl: this.config.webhookUrl.contract,
      },
      order: {
        orderId: gmoOrderId,
        amount: String(totalAmount),
        currency: this.config.currency,
        transactionType:
          from == 'customer' ? TransactionType.CIT : TransactionType.MIT,
      },
    };
  };

  /**
   * 都度決済 ECの方の決済
   */
  public createEcCardPayment = async ({
    orderId,
    paymentId,
    cardInfo,
    payer,
    totalAmount,
  }: {
    orderId: Ec_Order['id'];
    paymentId: Ec_Order_Payment['id'];
    cardInfo: Gmo_Credit_Card;
    payer: Payer;
    totalAmount: number;
  }) => {
    if (!payer.name || !payer.nameKana)
      throw new BackendCoreError({
        internalMessage: '顧客の名前が指定されていません',
      });

    if (this.mode !== 'ec') {
      throw new BackendCoreError({
        internalMessage: '決済モードがECではありません',
      });
    }

    const createChargeRes = await CreditcardService.creditOnfileCharge(
      {
        ...this.getEcPaymentCommonPayload({
          orderId,
          paymentId,
          totalAmount,
        }),
        payer,
        creditOnfileInformation: {
          onfileCard: {
            memberId: cardInfo.customer_id,
            type: OnfileCardType.CREDIT_CARD,
            cardId: cardInfo.card_id,
          },
          creditChargeOptions: {
            authorizationMode: CreditChargeOptions.authorizationMode.CAPTURE,
            useTds2: true,
          },
        },
        tds2Information: {
          tds2Options: {
            skipNotEnrolledCard: true,
          },
        },
      },
      `ec-order-${orderId}-payment-${paymentId}-pay`,
      this.mode,
    );

    if (
      !createChargeRes.orderReference ||
      !createChargeRes.orderReference.accessId
    )
      throw new BackendCoreError({
        internalMessage: 'ECの支払い作成に失敗しました',
      });

    let redirectUrl: string | null = null;
    let finished: boolean = false;

    if (createChargeRes.orderReference?.status == StatusCredit.CAPTURE) {
      //決済完了
      finished = true;
    } else if (
      createChargeRes.nextAction == NextAction.REDIRECT &&
      'redirectInformation' in createChargeRes
    ) {
      redirectUrl = createChargeRes.redirectInformation?.redirectUrl ?? null;
    } else {
      console.log(createChargeRes);
      throw new BackendCoreError({
        internalMessage: 'ECの支払い作成に失敗しました',
      });
    }

    return {
      createChargeRes,
      accessId: createChargeRes.orderReference.accessId!,
      redirectUrl,
      finished,
    };
  };

  /**
   * ECのコンビニ払い
   */
  public createEcCashPayment = async ({
    orderId,
    paymentId,
    payer,
    totalAmount,
    paymentMethod,
    konbiniCode,
  }: {
    orderId: Ec_Order['id'];
    paymentId: Ec_Order_Payment['id'];
    payer: Payer;
    totalAmount: number;
    paymentMethod: EcPaymentMethod;
    konbiniCode?: mulpay_2; //コンビニ決済の時
  }) => {
    if (this.mode !== 'ec') {
      throw new BackendCoreError({
        internalMessage: '決済モードがECではありません',
      });
    }

    let cashType: mulpay;

    if (paymentMethod == EcPaymentMethod.BANK) {
      cashType = mulpay.BANK_TRANSFER_GMO_AOZORA;
    } else if (paymentMethod == EcPaymentMethod.CONVENIENCE_STORE) {
      cashType = mulpay.KONBINI;
    } else {
      throw new BackendCoreError({
        internalMessage: 'この支払い方法は現在対応していません',
      });
    }

    if (!payer.name || !payer.nameKana || !payer.phones?.length)
      throw new BackendCoreError({
        internalMessage: '顧客の電話番号や名前が指定されていません',
      });

    const createChargeRes = await CashService.cashCharge(
      {
        ...this.getEcPaymentCommonPayload({
          orderId,
          paymentId,
          totalAmount,
        }),
        payer,
        cashInformation: {
          cashType,
          cashOptions: {
            konbiniCode,
            paymentPeriod: String(this.config.paymentPeriod),
          },
        },
      },
      `ec-order-${orderId}-payment-${paymentId}-pay`,
      this.mode,
    );

    if (
      !createChargeRes.orderReference ||
      !createChargeRes.orderReference.accessId ||
      !createChargeRes.cashResult?.paymentExpiryDateTime
    )
      throw new BackendCoreError({
        internalMessage: 'ECの支払い作成に失敗しました',
      });

    const paymentInfo = createChargeRes.cashResult;

    return {
      createChargeRes,
      accessId: createChargeRes.orderReference.accessId!,
      paymentInfo,
    };
  };

  /**
   * POSの方の決済作成
   */
  public createContractPayment = async ({
    contractId,
    paymentId,
    cardInfo,
    totalAmount,
    from,
    payer,
  }: {
    contractId: Contract['id'];
    paymentId: Contract_Payment['id'];
    cardInfo: Gmo_Credit_Card;
    totalAmount: number;
    from: 'system' | 'customer';
    payer: Payer;
  }) => {
    if (this.mode !== 'contract') {
      throw new BackendCoreError({
        internalMessage: '決済モードがPOSではありません',
      });
    }

    const createChargeRes = await CreditcardService.creditOnfileCharge(
      {
        ...this.getContractPaymentCommonPayload({
          from,
          contractId,
          paymentId,
          totalAmount,
        }),
        payer,
        creditOnfileInformation: {
          onfileCard: {
            memberId: cardInfo.customer_id,
            type: OnfileCardType.CREDIT_CARD,
            cardId: cardInfo.card_id,
          },
          creditChargeOptions: {
            authorizationMode: CreditChargeOptions.authorizationMode.CAPTURE,
            useTds2: from == 'customer' ? true : false,
          },
        },
        tds2Information: {
          tds2Options: {
            skipNotEnrolledCard: true,
          },
        },
      },
      `contract-payment-${paymentId}-pay`,
      this.mode,
    );

    if (
      !createChargeRes.orderReference ||
      !createChargeRes.orderReference.accessId
    )
      throw new BackendCoreError({
        internalMessage: 'ECの支払い作成に失敗しました',
      });

    let redirectUrl: string | null = null;
    let finished: boolean = false;

    if (createChargeRes.orderReference?.status == StatusCredit.CAPTURE) {
      //決済完了
      finished = true;
    } else if (
      createChargeRes.nextAction == NextAction.REDIRECT &&
      'redirectInformation' in createChargeRes
    ) {
      redirectUrl = createChargeRes.redirectInformation?.redirectUrl ?? null;
    } else {
      console.log(createChargeRes);
      throw new BackendCoreError({
        internalMessage: 'POS契約の支払い作成に失敗しました',
      });
    }

    return {
      createChargeRes,
      accessId: createChargeRes.orderReference.accessId!,
      redirectUrl,
      finished,
    };
  };

  /**
   * 取引確定
   * @param accessId アクセスID
   * @returns 取引確定
   */
  // public captureOrder = async (accessId: string) => {
  //   const res = await OrderService.orderCapture({
  //     accessId,
  //   });

  //   return res;
  // };

  /**
   * カード返金
   * @param accessId アクセスID
   * @param amount 返金した後の合計額
   */
  public createEcCardRefund = async ({
    accessId,
    toAmount, //この値段にする
  }: {
    accessId: string;
    toAmount: number;
  }) => {
    if (this.mode !== 'ec') {
      throw new BackendCoreError({
        internalMessage: '決済モードがECではありません',
      });
    }

    if (toAmount > 0) {
      const createRefundRes = await OrderService.orderUpdate(
        {
          accessId,
          amount: String(toAmount),
          authorizationMode: AuthorizationMode.CAPTURE,
        },
        undefined,
        this.mode,
      );

      return createRefundRes;
    } else {
      const cancelRes = await OrderService.orderCancel(
        {
          accessId,
        },
        undefined,
        this.mode,
      );

      return cancelRes;
    }
  };

  /**
   * 取引取得
   * @param accessId アクセスID
   * @returns 取引取得結果
   */
  public getOrder = async (
    accessId: string,
  ): Promise<{
    gmoOrder: OrderInquiryResponse;
    finished: boolean;
  }> => {
    const res = await OrderService.orderInquiry(
      {
        accessId,
      },
      this.mode,
    );

    let finished = false;

    if (
      res.orderReference &&
      'status' in res.orderReference &&
      (res.orderReference.status == StatusCredit.CAPTURE ||
        //@ts-expect-error becuase of because of  気にしない
        res.orderReference.status == StatusCash.PAYSUCCESS)
    ) {
      finished = true;
    }

    return {
      gmoOrder: res,
      finished,
    };
  };

  /**
   * カード保存
   */
  public async saveCard({
    token,
    memberId,
    cardId,
  }: {
    token: string;
    memberId: Gmo_Credit_Card['customer_id'];
    cardId?: Gmo_Credit_Card['card_id'];
  }) {
    const saveCardRes = await CreditcardService.creditStoreCard(
      {
        merchant: {
          ...this.config.merchant,
        },
        creditStoringInformation: {
          tokenizedCard: {
            type: TokenizedCard.type.MP_TOKEN,
            token,
          },
          onfileCardOptions: {
            memberId,
            cardId,
          },
        },
      },
      undefined,
      this.mode,
    );

    return saveCardRes;
  }
}

export {
  NextAction,
  StatusCredit,
  mulpay_2 as CONVENIENCE_CODE,
  Phone as GmoPhone,
  CashType as GmoCashType,
} from '@/services/external/gmo/openApiClient'; //一応
