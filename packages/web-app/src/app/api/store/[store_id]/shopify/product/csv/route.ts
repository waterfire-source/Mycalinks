// Shopify上の全在庫のCSVを取得

import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import { BackendApiShopifyService } from '@/api/backendApi/services/shopify/main';
import { getShopifyProductCsvApi } from 'api-generator';

export const GET = BackendAPI.create(
  getShopifyProductCsvApi,
  async (API, { params }) => {
    const shopifyService = new BackendApiShopifyService(API);
    await shopifyService.core.grantToken();

    //全在庫を取得する
    const allShopifyProducts = await shopifyService.core.getAllProducts();

    const csvService = new BackendApiCsvService(API);
    const fileService = new BackendApiFileService(API);

    //すでに紐づいているやつがあったら取得する
    const alreadyLinkedShopifyProducts = await API.db.product.findManyExists({
      where: {
        store_id: params.store_id,
        shopify_product_id: {
          not: null,
        },
      },
      select: {
        id: true,
        shopify_product_id: true,
      },
    });

    const uploadRes = await fileService.uploadCsvToS3({
      dirKind: 'shopify',
      writer: async (passThrough) => {
        csvService.core.passThrough = passThrough;
        await csvService.core.maker(
          //@ts-expect-error テンプレート管理外
          allShopifyProducts.map((product) => {
            const alreadyLinkedShopifyProduct =
              alreadyLinkedShopifyProducts.find(
                (e) => e.shopify_product_id === product.productId,
              );

            return {
              商品名: product.title,
              pos_product_id: alreadyLinkedShopifyProduct?.id || '',
              shopify_product_id: product.productId,
              shopify_product_variant_id: product.variants[0].variantId,
              shopify_inventory_item_id: product.variants[0].inventoryItemId,
            };
          }),
        );
      },
    });

    return {
      fileUrl: uploadRes,
    };
  },
);
