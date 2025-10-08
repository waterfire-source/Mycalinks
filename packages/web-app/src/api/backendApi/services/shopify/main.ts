import { Store } from '@prisma/client';
import { BackendAPI } from '@/api/backendApi/main';
import { CustomCrypto } from '@/utils/crypto';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiService } from '@/api/backendApi/services/main';
import { BackendCoreShopifyService, BackendService } from 'backend-core';
import crypto from 'crypto';

//square関連 これもBackendCoreに移行したい
export class BackendApiShopifyService extends BackendApiService {
  declare core: BackendCoreShopifyService;

  constructor(API: BackendAPI<any>) {
    super(API);
    this.addCore(new BackendCoreShopifyService());
  }

  /**
   * OAuthのコードでアクセストークンとかを取得
   */
  public async getTokenByOAuthCode({
    storeId,
    code,
  }: {
    storeId: Store['id'];
    code: string;
  }) {
    //storeIdからshopDomainを取得
    const shopDomain = await this.API.db.ec_Setting.findUnique({
      where: {
        store_id: storeId,
      },
      select: {
        shopify_shop_domain: true,
      },
    });

    if (!shopDomain) throw new ApiError('notExist');

    const url = `https://${shopDomain.shopify_shop_domain}/admin/oauth/access_token`;

    const body = {
      client_id: BackendCoreShopifyService.config.applicationId,
      client_secret: BackendCoreShopifyService.config.applicationSecret,
      code,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to exchange token: ${response.status}, ${text}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      scope: string;
    };

    return {
      accessToken: data.access_token,
      scope: data.scope,
    };
  }

  /**
   * OAuthのHMACを検証しつつ、storeIdを抽出
   */
  public validateOAuthCallback() {
    //クエリパラメータからhmacだけを抽出
    const { hmac, ...rest } = this.API.query;

    //他のパラメータを整列して文字列化
    const sorted = Object.keys(rest)
      .sort()
      .map((key) => {
        return `${key}=${rest[key]}`;
      });
    const message = sorted.join('&');

    const generatedHmac = crypto
      .createHmac('sha256', BackendCoreShopifyService.config.applicationSecret)
      .update(message)
      .digest('hex');

    if (hmac !== generatedHmac) {
      throw new ApiError('invalidParameter');
    }

    //stateを検証
    const { state, code } = this.API.query as { state: string; code: string };

    const cookieState = this.API.req.cookies.get(
      BackendCoreShopifyService.config.oAuthStateKey,
    );

    if (!cookieState || state != cookieState.value)
      throw new ApiError({
        status: 401,
        messageText: 'Invalid State',
      });

    //stateをデコード
    const stateJson = CustomCrypto.base64Decode(state);

    const { storeId } = stateJson as { storeId: number };

    return {
      storeId,
      code,
    };
  }

  //OAuthのURLを生成
  @BackendService.WithIds(['storeId'])
  public async generateOAuthUrl({ shopDomain }: { shopDomain: string }) {
    //https://mycalinkspostest.myshopify.com/admin/oauth/authorize?client_id=6221b627a8116867b389c958040fa841&scope=read_inventory,write_inventory,read_orders,write_orders&redirect_uri=http://localhost:3020/api/shopify/oauth/callback&state=nonce1&grant_options[]=per-user

    const stateJson = {
      state: CustomCrypto.randomState,
      storeId: this.ids.storeId,
    };
    const state = CustomCrypto.base64Encode(stateJson);

    const baseUrl = `https://${shopDomain}/admin/oauth/authorize`;
    const searchParams = new URLSearchParams({
      client_id: BackendCoreShopifyService.config.applicationId,
      redirect_uri: BackendCoreShopifyService.config.callbackUrl,
      state,
    });

    return {
      url: `${baseUrl}?${searchParams.toString()}`,
      state,
    };
  }
}
