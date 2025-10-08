import {
  BackendCoreShopifyService,
  TaskCallback,
  workerDefs,
} from 'backend-core';

//Shopifyの価格変動
export const shopifyUpdatePriceController: TaskCallback<
  typeof workerDefs.externalEc.kinds.shopifyUpdatePrice.body
> = async (task) => {
  const thisBody = task.body;

  const shopifyService = new BackendCoreShopifyService();
  task.give(shopifyService);

  await shopifyService.grantToken();

  //アップデートする
  const res = await shopifyService.updatePriceBulk(
    thisBody.map((t) => ({
      productId: t.data.shopify_product_id,
      variantId: t.data.shopify_product_variant_id,
      price: t.data.price,
    })),
  );

  console.log(res, 'Shopifyの価格変動');
};
