import {
  Payment,
  Register,
  Transaction,
  TransactionPaymentMethod,
} from '@prisma/client';
import { BackendAPI } from '@/api/backendApi/main';
import {
  Client as SquareClient,
  Environment,
  WebhooksHelper as SquareWebhooksHelper,
} from 'square';
import { CustomCrypto } from '@/utils/crypto';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiService } from '@/api/backendApi/services/main';
import { BackendApiRegisterService } from '@/api/backendApi/services/register/main';
type terminalPaymentMethod = 'CARD_PRESENT' | 'FELICA_ALL' | 'PAYPAY';

//square関連 これもBackendCoreに移行したい
export class BackendApiSquareService extends BackendApiService {
  //動的な設定値
  public config = {
    // accessToken:
    // 'EAAAl84On1MPK8WhBKNcrcokouKKomIL9_taMp8-NOQhT_52JlnBTn7RES8j-FRK', //本番 これは法人ごとに異なる（Corporationで保持）
    accessToken: '', //動的に設定する場合
    // accessToken:
    //   'EAAAl4pfvby5zK37G0uYz58hT43Nsy3aZkIWu4hUGndqzQpx4MQzPpm9isOD1pfy', //これは法人ごとに違う
    // locationId: 'LH79EWQRMDM3V', //これは店舗ごとに異なる（Storeで保持） //本番
    // locationId: 'L8CJ2CKQXX9SK', //oauth1
    locationId: '', //動的に設定する場合
    // deviceId: '412CS145B7002456', //これはレジによって違う（Registerで保持） //本番
    deviceId: '', //動的に設定する場合
  };

  //POSシステムで決まっているスタティックな設定値
  public static config = {
    runMode: process.env.SQUARE_RUN_MODE || '',
    refIdPrefix: process.env.SQUARE_REFID_PREFIX + 'Transaction_',
    webhookSignatureHeaderKey: 'x-square-hmacsha256-signature',
    webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '',
    webhookUrl: process.env.SQUARE_WEBHOOK_URL || '',
    enabled: process.env.RUN_SQUARE == 'yes',
    // enabled: true,
    apiVersion: '2024-06-04',
    applicationId: process.env.SQUARE_OAUTH_APPLICATION_ID || '',
    applicationSecret: process.env.SQUARE_OAUTH_APPLICATION_SECRET,
    oAuthUrl: process.env.SQUARE_OAUTH_URL,
    oAuthStateKey: 'Square_OAuth_State',
    succeedCallbackUrl: 'Square_OAuth_Succeed_Url',
    failedCallbackUrl: 'Square_OAuth_Failed_Url',
    requiredPermissions: [
      //OAuthの必要な権限はシステムで固定する
      'PAYMENTS_WRITE', //支払い作成
      'PAYMENTS_READ', //支払い読み取り
      'MERCHANT_PROFILE_READ', //ロケーションの読み取り
      'DEVICE_CREDENTIAL_MANAGEMENT', //デバイス関連
    ],
    oAuthFailedPagePath: '/square-fail', //要変更
    oAuthSucceedPagePath: '/square-success', //要変更
    currency: 'JPY', //通貨は日本円で固定
  };

  public client: SquareClient;

  constructor(API: BackendAPI<any>) {
    super(API);
    //[TODO]: ここでOAuthで受け取った法人それぞれのトークンをぶちこむ（現在は通常のAPIキー）
    this.client = new SquareClient({
      environment:
        BackendApiSquareService.config.runMode == 'production'
          ? Environment.Production
          : Environment.Sandbox,
    });
  }

  //トークンを付与する ついでにlocationIdがresourcesに結びついていたらそれもセットする
  //トークンの有効期限が切れていた場合、リフレッシュしないといけない
  public grantToken = async () => {
    if (!this.API.resources.corporation)
      throw new ApiError({
        status: 500,
        messageText: '法人情報が取得できないためSquareサービスを利用できません',
      });

    const {
      square_access_token,
      square_access_token_expires_at,
      square_refresh_token,
      id: corporation_id,
    } = this.API.resources.corporation;

    //locationは勝手に設定しておく
    this.config.locationId =
      this.config.locationId ||
      this.API.resources.store?.square_location_id ||
      '';

    //アクセストークンがすでに付与されている場合はそれでクライアントを作成（導入準備期間のみ）
    let accessToken = '';
    if (this.config.accessToken) {
      accessToken = this.config.accessToken;
    } else {
      //有効期限を確認する
      //有効期限1日前とかだったら期限切れとする

      const expired =
        square_access_token &&
        square_access_token_expires_at &&
        Date.now() + 1000 * 60 * 60 * 24 >
          square_access_token_expires_at.getTime();

      //期限が切れていたり、アクセストークンがなかったらリフレッシュトークンを使ってアクセストークンを作る
      if (expired) {
        try {
          //リフレッシュトークンがあるか確認
          if (!square_refresh_token) throw new Error();

          //あったらそれでトークンを更新する
          const accessTokenInfo =
            await this.getTokenByRefreshToken(square_refresh_token);

          if (!accessTokenInfo.accessToken) throw new Error();

          accessToken = accessTokenInfo.accessToken;

          //アクセストークンを格納する
          await this.API.db.corporation.update({
            where: {
              id: corporation_id,
            },
            data: {
              square_access_token: accessTokenInfo.accessToken,
              square_access_token_expires_at: accessTokenInfo.expiresAt
                ? new Date(accessTokenInfo.expiresAt)
                : null,
              square_available: true,
            },
          });
        } catch (e) {
          console.error(e);

          //この法人のSquareを無効にする
          await this.API.db.corporation.update({
            where: {
              id: corporation_id,
            },
            data: {
              square_available: false,
            },
          });

          throw new ApiError({
            status: 500,
            messageText: 'Squareとの連携が設定されていません',
          });
        }
      } else {
        //あったらそれをセット
        accessToken = square_access_token!;
      }
    }

    //アクセストークンでクライアントを作り直す
    this.config.accessToken = accessToken;
    this.client = new SquareClient({
      environment:
        BackendApiSquareService.config.runMode == 'production'
          ? Environment.Production
          : Environment.Sandbox,
      bearerAuthCredentials: {
        accessToken,
      },
    });

    console.log('Squareを店舗で使う準備が整いました！');
  };

  //現金支払いを作成する これは今使ってない
  // public createCashPayment = async ({
  //   transaction_id,
  //   total_amount,
  //   recieved_price,
  //   change_price,
  // }: {
  //   transaction_id: Transaction['id'];
  //   total_amount: Payment['total_amount'];
  //   recieved_price: Payment['cash__recieved_price'];
  //   change_price: Payment['cash__change_price'];
  // }) => {
  //   //トークンやlocationIdが与えられているか確認
  //   if (!this.config.accessToken || !this.config.locationId)
  //     throw new ApiError({
  //       status: 500,
  //       messageText: 'Squareが利用できません',
  //     });

  //   const createRes = await this.client.paymentsApi.createPayment({
  //     sourceId: 'CASH',
  //     idempotencyKey: `${SquareService.config.refIdPrefix}${transaction_id}`,
  //     referenceId: `${SquareService.config.refIdPrefix}${transaction_id}`,
  //     amountMoney: {
  //       amount: total_amount as unknown as bigint,
  //       currency: SquareService.config.currency,
  //     },
  //     locationId: this.config.locationId,
  //     cashDetails: {
  //       buyerSuppliedMoney: {
  //         amount: recieved_price as unknown as bigint,
  //         currency: SquareService.config.currency,
  //       },
  //       changeBackMoney: {
  //         amount: change_price as unknown as bigint,
  //         currency: SquareService.config.currency,
  //       },
  //     },
  //   });

  //   return createRes?.result;
  // };

  //端末支払いを作成する
  public createTerminalCheckout = async ({
    transaction_id,
    payment_method,
    total_amount,
  }: {
    transaction_id: Transaction['id'];
    payment_method: Transaction['payment_method'];
    total_amount: Payment['total_amount'];
  }) => {
    //runModeがsandboxだったら相当のデバイスIDを入れる
    if (BackendApiSquareService.config.runMode == 'sandbox') {
      switch (payment_method) {
        case TransactionPaymentMethod.square:
          this.config.deviceId = '22cd266c-6246-4c06-9983-67f0c26346b0';
          break;
        case TransactionPaymentMethod.paypay:
          this.config.deviceId = 'cae0ee02-f83b-11ec-b939-0242ac120002';
          break;
        case TransactionPaymentMethod.felica:
          this.config.deviceId = '19a01fbd-3dcd-4d9f-a499-a641684af745';
          break;
      }
    }

    //トークンやロケーションIDや端末IDが与えられているか確認
    if (
      !this.config.accessToken ||
      !this.config.locationId ||
      !this.config.deviceId
    )
      throw new ApiError({
        status: 500,
        messageText: 'Squareが利用できません',
      });

    //支払いタイプを定義する
    let paymentMethod: terminalPaymentMethod | undefined = undefined;
    switch (payment_method) {
      case TransactionPaymentMethod.square: //[TODO] これをcardにしたい
        paymentMethod = 'CARD_PRESENT';
        break;
      case TransactionPaymentMethod.paypay:
        // @ts-expect-error Squareでの仕様変更
        paymentMethod = 'QR_CODE';
        break;
      case TransactionPaymentMethod.felica:
        paymentMethod = 'FELICA_ALL';
        break;
    }

    const createRes = await this.client.terminalApi.createTerminalCheckout({
      idempotencyKey: `${BackendApiSquareService.config.refIdPrefix}${transaction_id}`,
      checkout: {
        amountMoney: {
          amount: total_amount as unknown as bigint,
          currency: BackendApiSquareService.config.currency,
        },
        locationId: this.config.locationId,
        referenceId: `${BackendApiSquareService.config.refIdPrefix}${transaction_id}`,
        deviceOptions: {
          deviceId: this.config.deviceId,
        },
        paymentType: paymentMethod,
      },
    });

    return createRes?.result;
  };

  //返金作成
  public createPaymentRefund = async ({
    transaction_id,
    paymentId,
    refund_amount,
  }: {
    transaction_id: Transaction['id'];
    paymentId: string;
    refund_amount: number;
  }) => {
    //トークンが与えられているか確認 ロケーションIDなどは必要ない
    if (!this.config.accessToken)
      throw new ApiError({
        status: 500,
        messageText: 'Squareが利用できません',
      });

    const createRes = await this.client.refundsApi.refundPayment({
      idempotencyKey: `${BackendApiSquareService.config.refIdPrefix}${transaction_id}`,
      amountMoney: {
        amount: refund_amount as unknown as bigint,
        currency: BackendApiSquareService.config.currency,
      },
      paymentId,
      // reason: 'jiji' //理由は一旦なしで
    });

    return createRes?.result;
  };

  //支払いをキャンセル
  public cancelTerminalCheckout = async (terminalCheckoutId: string) => {
    //トークンが与えられているか確認 ロケーションIDなどは必要ない
    if (!this.config.accessToken)
      throw new ApiError({
        status: 500,
        messageText: 'Squareが利用できません',
      });

    //端末にリクエストした取引をキャンセルする
    const createRes =
      await this.client.terminalApi.cancelTerminalCheckout(terminalCheckoutId);

    return createRes?.result;
  };

  //ロケーションのリストを取得する（これを使って店舗とロケーションを紐付けさせる）
  public getLocations = async () => {
    //トークンが与えられているか確認
    if (!this.config.accessToken)
      throw new ApiError({
        status: 500,
        messageText: 'Squareが利用できません',
      });

    const getRes = await this.client.locationsApi.listLocations();

    return getRes?.result;
  };

  //端末のリストを取得する
  public getDevices = async (filterByLocation?: boolean) => {
    //トークンが与えられているか確認
    if (
      !this.config.accessToken ||
      (filterByLocation && !this.config.locationId)
    )
      throw new ApiError({
        status: 500,
        messageText: 'Squareが利用できません',
      });

    const getRes = await this.client.devicesApi.listDeviceCodes();
    let deviceCodes = getRes.result.deviceCodes ?? [];

    if (filterByLocation) {
      deviceCodes = deviceCodes.filter(
        (device) => device.locationId == this.config.locationId,
      );
    }

    return {
      deviceCodes,
    };
  };

  //レジ用のデバイスコードを作成
  public createDeviceCode = async ({
    register_id,
  }: {
    register_id: Register['id']; //レジID デバイスコード格納用
  }) => {
    //トークンやlocationIdが与えられているか確認
    if (!this.config.accessToken || !this.config.locationId)
      throw new ApiError({
        status: 500,
        messageText: 'Squareが利用できません',
      });

    //レジ取得
    const thisRegister = new BackendApiRegisterService(this.API, register_id);
    const thisRegisterInfo = await thisRegister.core.existingObj;

    const createRes = await this.client.devicesApi.createDeviceCode({
      idempotencyKey: `Location_${this.config.locationId}_${this.API.requestTime}`,
      deviceCode: {
        locationId: this.config.locationId,
        productType: 'TERMINAL_API',
        name: thisRegisterInfo.display_name,
      },
    });

    if (
      !createRes.result.deviceCode?.code ||
      !createRes.result.deviceCode?.pairBy
    )
      throw new ApiError({
        status: 500,
        messageText: '端末コードが発行できませんでした',
      });

    //デバイスコードを格納する
    const updateRegisterRes = await this.API.db.register.update({
      where: {
        id: register_id,
      },
      data: {
        square_device_code: createRes.result.deviceCode.code,
        // square_device_code_expires_at: new Date(createRes.result.deviceCode.pairBy),
      },
    });

    return updateRegisterRes;
  };

  //webhookの検証を行う 現在のところsquareのみ
  verifyWebhook() {
    const bodyStringified = JSON.stringify(this.API.body);
    let signature: string = '';

    signature =
      this.API.req!.headers.get(
        BackendApiSquareService.config.webhookSignatureHeaderKey,
      ) ?? '';
    if (!signature) throw new ApiError('permission');
    const verifyRes = SquareWebhooksHelper.isValidWebhookEventSignature(
      bodyStringified,
      signature,
      BackendApiSquareService.config.webhookSignatureKey,
      BackendApiSquareService.config.webhookUrl,
    );

    if (!verifyRes)
      throw new ApiError({
        status: 401,
        messageText: 'webhookの検証に失敗しました',
      });

    return verifyRes;
  }

  //スタティック関数

  //OAuthのURLを生成
  public generateOAuthUrl = () => {
    const baseUrl = BackendApiSquareService.config.oAuthUrl;

    const params = {
      client_id: BackendApiSquareService.config.applicationId,
      response_type: 'code',
      scope: BackendApiSquareService.config.requiredPermissions.join(' '),
      state: CustomCrypto.randomState,
    };

    const url = `${baseUrl}?${new URLSearchParams(params)}`;

    return {
      url,
      state: params.state,
    };
  };

  //oAuthのcodeからトークンをobtain
  public getTokenByOAuthCode = async (code: string) => {
    const oAuthClient = this.client.oAuthApi;

    const { result } = await oAuthClient.obtainToken({
      code,
      clientId: BackendApiSquareService.config.applicationId,
      clientSecret: BackendApiSquareService.config.applicationSecret,
      grantType: 'authorization_code',
    });

    return result;
  };

  //refreshトークンからアクセストークンを取得
  public getTokenByRefreshToken = async (refreshToken: string) => {
    const oAuthClient = this.client.oAuthApi;

    const { result } = await oAuthClient.obtainToken({
      refreshToken,
      clientId: BackendApiSquareService.config.applicationId,
      clientSecret: BackendApiSquareService.config.applicationSecret,
      grantType: 'refresh_token',
    });

    return result;
  };
}
