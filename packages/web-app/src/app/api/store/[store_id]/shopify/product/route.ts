//Shopify上に出品するやつ
// Shopifyに在庫を作成する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiShopifyService } from '@/api/backendApi/services/shopify/main';
import { ApiResponse, createShopifyProductApi } from 'api-generator';
import { BackendCoreError } from 'backend-core';

export const POST = BackendAPI.create(
  createShopifyProductApi,
  async (API, { body }) => {
    const { productIds } = body;

    const shopifyService = new BackendApiShopifyService(API);

    try {
      await shopifyService.core.grantToken();
    } catch (e) {
      throw new ApiError({
        status: 400,
        messageText: `このストアでShopifyは利用できません/していません`,
      });
    }

    //それぞれ作っていく
    const createdProductIds: ApiResponse<
      typeof createShopifyProductApi
    >['shopifyProducts'] = [];

    for (const productId of productIds) {
      try {
        const shopifyProductInfo =
          await shopifyService.core.createProductByPosProduct(productId);
        createdProductIds.push({
          productId: shopifyProductInfo.shopifyProduct.productId,
          variantId: shopifyProductInfo.shopifyProduct.variantId,
          inventoryItemId: shopifyProductInfo.shopifyProduct.inventoryItemId,
        });
      } catch (e) {
        if (e instanceof BackendCoreError) {
          if (e.errorCode === 'SHOPIFY_PRODUCT_ALREADY_LINKED') {
            //すでに連携されてたらスキップ
            continue;
          }
        }
        throw e;
      }
    }

    return {
      shopifyProducts: createdProductIds,
    };
  },
);
