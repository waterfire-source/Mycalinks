//OAuth同意画面のURLを取得（state付き）

import { BackendAPI } from '@/api/backendApi/main';
import { getShopifyOAuthUrlApi } from 'api-generator';
import { BackendApiShopifyService } from '@/api/backendApi/services/shopify/main';
import { BackendCoreShopifyService } from 'backend-core';
import { ApiError } from '@/api/backendApi/error/apiError';

// 同意画面URL取得
export const GET = BackendAPI.create(
  getShopifyOAuthUrlApi,
  async (API, { query, params }) => {
    const { shopDomain } = query;

    //EC設定があるか確認する
    if (!API.resources.store!.ec_setting)
      throw new ApiError({
        status: 400,
        messageText: 'EC設定がありません',
      });

    //発行する
    const shopifyService = new BackendApiShopifyService(API);
    const authUrlInfo = await shopifyService.generateOAuthUrl({ shopDomain });

    //stateクッキーをセット
    API.setCookies.push({
      key: BackendCoreShopifyService.config.oAuthStateKey,
      value: authUrlInfo.state,
      expire: Date.now() + 300000,
    });

    //このshopDomainをDBに保存する
    await API.db.ec_Setting.update({
      where: {
        store_id: params.store_id,
      },
      data: {
        shopify_shop_domain: shopDomain,
      },
    });

    return {
      url: authUrlInfo.url,
    };
  },
);
