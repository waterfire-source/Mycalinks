//Shopifyロケーション取得 動作確認用
// Shopifyの店舗一覧取得

import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiShopifyService } from '@/api/backendApi/services/shopify/main';
import { getShopifyLocationApi } from 'api-generator';

export const GET = BackendAPI.create(getShopifyLocationApi, async (API) => {
  const shopifyService = new BackendApiShopifyService(API);
  await shopifyService.core.grantToken();

  const targetLocation = await shopifyService.core.getTargetLocation();

  return targetLocation;
});
