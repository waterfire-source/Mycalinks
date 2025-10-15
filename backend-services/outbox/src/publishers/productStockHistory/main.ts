import { Outbox_Ec_Product_Stock_History, Store } from '@prisma/client';
import {
  getPrisma,
  ExternalEcTask,
  BackendService,
  TaskManager,
} from 'backend-core';

const db = getPrisma();

//在庫変動記録の処理
export const productEcStockHistoriesPublisher = async (
  productStockHistories: Outbox_Ec_Product_Stock_History[],
) => {
  //Shopifyからの変動はShopifyには伝えない（現状）
  //それ以外、おちゃのこからの変動はおちゃのこに伝えるし、Shopifyにも伝える
  //もちろんPOS起因の変動もおちゃのこおよびShopifyに伝える
  //ストアごと、プラットフォームごとにタスクは分けた方が良い

  const tasks: Map<
    Store['id'],
    {
      ochanoko: Array<ExternalEcTask.OchanokoUpdateStockNumber>;
      shopify: Array<ExternalEcTask.ShopifyUpdateStockNumber>;
    }
  > = new Map();

  for (const productStockHistory of productStockHistories) {
    let thisStoreTask = tasks.get(productStockHistory.store_id);

    if (!thisStoreTask) {
      thisStoreTask = {
        ochanoko: [],
        shopify: [],
      };
      tasks.set(productStockHistory.store_id, thisStoreTask);
    }

    //おちゃのこの変動タスクを作成する
    if (productStockHistory.ochanoko_product_id) {
      thisStoreTask.ochanoko.push({
        store_id: productStockHistory.store_id,
        ochanoko_product_id: productStockHistory.ochanoko_product_id,
        stock_number: productStockHistory.result_stock_number,
      });
    }

    //Shopifyの変動タスクを作成する
    if (productStockHistory.shopify_inventory_item_id) {
      thisStoreTask.shopify.push({
        store_id: productStockHistory.store_id,
        shopify_inventory_item_id:
          productStockHistory.shopify_inventory_item_id,
        stock_number: productStockHistory.result_stock_number,
      });
    }
  }

  //全てのタスクをpushする
  for (const [storeId, thisStoreTask] of tasks) {
    const backendService = new BackendService();
    backendService.generateService({
      ids: {
        storeId,
      },
    });

    if (thisStoreTask.ochanoko.length) {
      //おちゃのこタスクをプッシュする
      const taskManager = new TaskManager({
        targetWorker: 'externalEc',
        kind: 'ochanokoUpdateStockNumber',
      });

      await taskManager.publish({
        body: thisStoreTask.ochanoko,
        service: backendService,
        specificGroupId: `ochanoko-${storeId}-stock-number`,
        fromSystem: true,
      });

      console.log(`おちゃのこ在庫変動`, thisStoreTask.ochanoko, 'パブリッシュ');
    }

    //Shopifyの変動タスクをプッシュする
    if (thisStoreTask.shopify.length) {
      //Shopifyタスクをプッシュする
      const taskManager = new TaskManager({
        targetWorker: 'externalEc',
        kind: 'shopifyUpdateStockNumber',
      });

      await taskManager.publish({
        body: thisStoreTask.shopify,
        service: backendService,
        specificGroupId: `shopify-${storeId}-stock-number`,
        fromSystem: true,
      });
    }
  }

  const allIds = productStockHistories.map((v) => v.id);

  //publishしたら、該当レコードを消していく
  await db.outbox_Ec_Product_Stock_History.deleteMany({
    where: {
      id: {
        in: allIds,
      },
    },
  });
};
