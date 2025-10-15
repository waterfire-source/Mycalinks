//顧客更新API

import { BackendAPI } from '@/api/backendApi/main';
import { updateAllStoreItemMarketPriceDef } from '@/app/api/store/all/item/def';
import { TaskSourceKind } from '@prisma/client';
import { ItemTask, TaskManager } from 'backend-core';

export const PUT = BackendAPI.defineApi(
  updateAllStoreItemMarketPriceDef,
  async (API, { body }) => {
    const { updatedItemPrices } = body;

    const mycaItemIds = new Set(updatedItemPrices.map((item) => item.id));

    //対象のmyca_Itemを取得する
    const allMycaItems = await API.db.myca_Item.findMany({
      where: {
        myca_item_id: {
          in: Array.from(mycaItemIds),
        },
      },
      select: {
        myca_item_id: true,
        market_price: true,
      },
    });

    const now = new Date();

    const tasks: ItemTask.UpdateMycaItemData[] = [];
    for (const mycaItem of allMycaItems) {
      const updatedItem = updatedItemPrices.find(
        (updatedItemPrice) => updatedItemPrice.id === mycaItem.myca_item_id,
      );
      const price = updatedItem?.price;

      if (mycaItem.market_price == price) {
        continue;
      }

      tasks.push({
        myca_item_id: mycaItem.myca_item_id,
        market_price: price,
        previous_market_price: mycaItem.market_price,
        market_price_updated_at: now,
      });
    }

    if (tasks.length > 0) {
      const taskManager = new TaskManager({
        targetWorker: 'item',
        kind: 'updateMycaItem',
      });

      await taskManager.publish({
        body: tasks,
        service: API,
        source: TaskSourceKind.SYSTEM,
        processDescription: `MycaItemの相場価格を更新します`,
        hiddenTask: true,
      });
    }
  },
);
