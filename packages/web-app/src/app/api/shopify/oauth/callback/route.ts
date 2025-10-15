import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { NextResponse, type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiShopifyService } from '@/api/backendApi/services/shopify/main';
import { PATH } from '@/constants/paths';

// OAuthのコールバック
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.everyone], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    //oauth callback url検証
    const shopifyService = new BackendApiShopifyService(API);
    const { storeId, code } = shopifyService.validateOAuthCallback();

    //storeIdとcodeからトークンを取得
    const tokenInfo = await shopifyService.getTokenByOAuthCode({
      storeId,
      code,
    });

    console.log(`Shopify OAuth処理完了: ${storeId}`);
    console.log(tokenInfo);

    //トークンをDBに保存する
    const ecSetting = await API.db.ec_Setting.update({
      where: {
        store_id: storeId,
      },
      data: {
        shopify_access_token: tokenInfo.accessToken,
      },
    });

    //ロケーションIDを取得
    shopifyService.core.config.accessToken = tokenInfo.accessToken;
    shopifyService.core.config.shopDomain = ecSetting.shopify_shop_domain!;

    await shopifyService.core.grantToken();

    const targetLocation = await shopifyService.core.getTargetLocation();

    //同時にストアのshopify有効設定も変える
    const ecSettingUpdateRes = await API.db.ec_Setting.update({
      where: { store_id: storeId },
      data: {
        shopify_location_id: targetLocation.id,
        store: {
          update: {
            shopify_ec_enabled: true,
          },
        },
      },
    });

    //成功ページへ遷移
    return NextResponse.redirect(
      new URL(PATH.EC.external, process.env.NEXT_PUBLIC_ORIGIN!),
    );
  },
);
