/**
 * 外部ECサービスとの不整合を埋める
 */

import {
  BackendCoreOchanokoService,
  BackendCoreShopifyService,
  BackendJob,
  ExternalEcTask,
  TaskManager,
} from 'backend-core';

//おちゃのこに価格と在庫数を伝達
export const adjustOchanokoProductStockNumber = async (job: BackendJob) => {
  //そもそもこのストアで有効になっていて、APIトークンが利用できることを確認する
  const ochanokoService = new BackendCoreOchanokoService();
  job.give(ochanokoService);

  try {
    await ochanokoService.grantToken();
  } catch (e) {
    console.error(
      `storeId: ${job.ids.storeId} このストアでおちゃのこは利用できません/していません`,
    );
    return;
  }

  const targetProducts = await job.db.product.findMany({
    where: {
      store_id: job.ids.storeId,
      deleted: false,
      ochanoko_ec_enabled: true,
      ochanoko_product_id: {
        not: null,
      },
    },
    select: {
      ochanoko_product_id: true,
      ec_stock_number: true,
      actual_ec_sell_price: true,
    },
  });

  //タスクを送信していく
  const updateStockNumberTasks: ExternalEcTask.OchanokoUpdateStockNumber[] =
    targetProducts.map((e) => {
      return {
        store_id: job.ids.storeId,
        ochanoko_product_id: e.ochanoko_product_id,
        stock_number: e.ec_stock_number,
      };
    });

  const updatePriceTasks: ExternalEcTask.OchanokoUpdatePrice[] =
    targetProducts.map((e) => {
      return {
        store_id: job.ids.storeId,
        ochanoko_product_id: e.ochanoko_product_id,
        price: e.actual_ec_sell_price,
      };
    });

  const stockNumberTaskManager = new TaskManager({
    targetWorker: 'externalEc',
    kind: 'ochanokoUpdateStockNumber',
  });

  await stockNumberTaskManager.publish({
    body: updateStockNumberTasks,
    service: job,
    specificGroupId: `ochanoko-${job.ids.storeId}-stock-number`,
    processDescription: `おちゃのこ在庫数是正`,
    fromSystem: true,
  });

  const priceTaskManager = new TaskManager({
    targetWorker: 'externalEc',
    kind: 'ochanokoUpdatePrice',
  });

  await priceTaskManager.publish({
    body: updatePriceTasks,
    service: job,
    specificGroupId: `ochanoko-${job.ids.storeId}-price`,
    processDescription: `おちゃのこ価格是正`,
    fromSystem: true,
  });
};

//Shopifyに価格と在庫数を伝達
export const adjustShopifyProductStockNumber = async (job: BackendJob) => {
  //そもそもこのストアで有効になっていて、APIトークンが利用できることを確認する
  const shopifyService = new BackendCoreShopifyService();
  job.give(shopifyService);

  try {
    await shopifyService.grantToken();
  } catch (e) {
    console.error(
      `storeId: ${job.ids.storeId} このストアでShopifyは利用できません/していません`,
    );
    return;
  }

  const targetProducts = await job.db.product.findMany({
    where: {
      store_id: job.ids.storeId,
      deleted: false,
      shopify_ec_enabled: true,
      shopify_product_id: {
        not: null,
      },
    },
    select: {
      shopify_product_id: true,
      shopify_product_variant_id: true,
      shopify_inventory_item_id: true,
      ec_stock_number: true,
      actual_ec_sell_price: true,
    },
  });

  //タスクを送信していく
  const updateStockNumberTasks: ExternalEcTask.ShopifyUpdateStockNumber[] =
    targetProducts.map((e) => {
      return {
        store_id: job.ids.storeId,
        shopify_inventory_item_id: e.shopify_inventory_item_id,
        stock_number: e.ec_stock_number,
      };
    });

  const updatePriceTasks: ExternalEcTask.ShopifyUpdatePrice[] =
    targetProducts.map((e) => {
      return {
        store_id: job.ids.storeId,
        shopify_product_id: e.shopify_product_id,
        shopify_product_variant_id: e.shopify_product_variant_id,
        price: e.actual_ec_sell_price,
      };
    });

  const stockNumberTaskManager = new TaskManager({
    targetWorker: 'externalEc',
    kind: 'shopifyUpdateStockNumber',
  });

  await stockNumberTaskManager.publish({
    body: updateStockNumberTasks,
    service: job,
    specificGroupId: `shopify-${job.ids.storeId}-stock-number`,
    processDescription: `Shopify在庫数是正`,
    fromSystem: true,
  });

  const priceTaskManager = new TaskManager({
    targetWorker: 'externalEc',
    kind: 'shopifyUpdatePrice',
  });

  await priceTaskManager.publish({
    body: updatePriceTasks,
    service: job,
    specificGroupId: `shopify-${job.ids.storeId}-price`,
    processDescription: `Shopify価格是正`,
    fromSystem: true,
  });
};
