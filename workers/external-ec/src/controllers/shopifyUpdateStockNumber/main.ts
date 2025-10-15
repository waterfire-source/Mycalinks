import {
  BackendCoreShopifyService,
  TaskCallback,
  workerDefs,
} from 'backend-core';

//Shopifyの在庫変動
export const shopifyUpdateStockNumberController: TaskCallback<
  typeof workerDefs.externalEc.kinds.shopifyUpdateStockNumber.body
> = async (task) => {
  const thisBody = task.body;

  const shopifyService = new BackendCoreShopifyService();
  task.give(shopifyService);

  await shopifyService.grantToken();

  //アップデートする
  const res = await shopifyService.setInventoryItemQuantity(
    thisBody.map((t) => ({
      inventoryItemId: t.data.shopify_inventory_item_id,
      quantity: t.data.stock_number,
    })),
  );

  console.log(res, 'Shopifyの在庫変動');
};
