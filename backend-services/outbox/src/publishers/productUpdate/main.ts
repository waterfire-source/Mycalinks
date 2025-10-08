import { Outbox_Product, Store } from '@prisma/client';
import {
  BackendService,
  ExternalEcTask,
  getPrisma,
  TaskManager,
} from 'backend-core';

const db = getPrisma();

//在庫情報更新
export const productUpdatePublisher = async (
  productUpdateInfos: Outbox_Product[],
) => {
  const tasks: Map<
    Store['id'],
    {
      ochanoko: Array<ExternalEcTask.OchanokoUpdatePrice>;
      shopify: Array<ExternalEcTask.ShopifyUpdatePrice>;
    }
  > = new Map();

  for (const productUpdateInfo of productUpdateInfos) {
    let thisStoreTask = tasks.get(productUpdateInfo.store_id);

    if (!thisStoreTask) {
      thisStoreTask = {
        ochanoko: [],
        shopify: [],
      };
      tasks.set(productUpdateInfo.store_id, thisStoreTask);
    }

    //おちゃのこの変動タスクを作成する
    if (productUpdateInfo.ochanoko_product_id) {
      thisStoreTask.ochanoko.push({
        store_id: productUpdateInfo.store_id,
        ochanoko_product_id: productUpdateInfo.ochanoko_product_id,
        price: productUpdateInfo.actual_ec_sell_price,
      });
    }

    //Shopifyの変動タスクを作成する
    if (
      productUpdateInfo.shopify_product_id &&
      productUpdateInfo.shopify_product_variant_id
    ) {
      thisStoreTask.shopify.push({
        store_id: productUpdateInfo.store_id,
        shopify_product_id: productUpdateInfo.shopify_product_id,
        shopify_product_variant_id:
          productUpdateInfo.shopify_product_variant_id,
        price: productUpdateInfo.actual_ec_sell_price,
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
        kind: 'ochanokoUpdatePrice',
      });

      await taskManager.publish({
        body: thisStoreTask.ochanoko,
        service: backendService,
        specificGroupId: `ochanoko-${storeId}-price`,
        fromSystem: true,
      });

      console.log(`おちゃのこ価格変動`, thisStoreTask.ochanoko, 'パブリッシュ');
    }

    //Shopifyの変動タスクをプッシュする
    if (thisStoreTask.shopify.length) {
      //Shopifyタスクをプッシュする
      const taskManager = new TaskManager({
        targetWorker: 'externalEc',
        kind: 'shopifyUpdatePrice',
      });

      await taskManager.publish({
        body: thisStoreTask.shopify,
        service: backendService,
        specificGroupId: `shopify-${storeId}-price`,
        fromSystem: true,
      });

      console.log(`Shopify価格変動`, thisStoreTask.shopify, 'パブリッシュ');
    }
  }

  const allIds = productUpdateInfos.map((v) => v.id);

  //publishしたら、該当レコードを消していく
  await db.outbox_Product.deleteMany({
    where: {
      id: {
        in: allIds,
      },
    },
  });
};
