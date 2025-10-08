import { BackendAPI } from '@/api/backendApi/main';
import { stockingAllProductsDef } from '@/app/api/store/[store_id]/cheat/def';
import { ItemTask, TaskManager } from 'backend-core';

export const POST = BackendAPI.defineApi(
  stockingAllProductsDef,
  async (API, { params }) => {
    //全ての在庫を取得し、全仕入れ

    const suppliers = await API.db.supplier.findMany({
      where: {
        deleted: false,
        store_id: params.store_id,
      },
    });

    const getRandomSupplierId = () =>
      suppliers[Math.floor(Math.random() * suppliers.length)].id;

    const chunkSize = 10000;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const allProducts = await API.db.product.findMany({
        where: {
          store_id: params.store_id,
        },
        skip,
        take: chunkSize,
        orderBy: {
          stock_number: 'asc',
        },
      });

      skip += chunkSize;

      if (allProducts.length < chunkSize) {
        hasMore = false;
      }

      //こいつらを出品していく

      const tasks: ItemTask.Stocking[] = allProducts
        .filter((e) => e?.id)
        .map((product) => ({
          id: product.id,
          stocking_item_count: Math.floor(Math.random() * 91) + 10,
          stocking_wholesale_price:
            Math.floor(Math.random() * (1000 - 100 + 1)) + 100,
          supplier_id: getRandomSupplierId(),
          staff_account_id: API.resources.actionAccount!.id,
        }));

      console.log(skip);

      const taskManager = new TaskManager({
        targetWorker: 'product',
        kind: 'productStocking',
      });

      await taskManager.publish({
        body: tasks,
        service: API,
        fromSystem: true,
        suffix: skip.toString(),
      });
    }
  },
);
