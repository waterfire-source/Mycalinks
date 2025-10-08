import { BackendAPI } from '@/api/backendApi/main';

import { adjustItemsWithMarketPriceGapDef } from '@/app/api/store/[store_id]/item/def';
import { Item, Prisma, TaskSourceKind } from '@prisma/client';
import { ItemTask, TaskManager } from 'backend-core';
//オリパ作成を行うAPI
//オリパ作成を完了させた場合、自動で在庫が生成される

export const POST = BackendAPI.defineApi(
  adjustItemsWithMarketPriceGapDef,
  async (API, { params, body, query }) => {
    const { store_id } = params;
    const { adjustAll } = body;
    const { genre_id, category_id } = query;

    //とりあえず対象の商品マスタを取得

    let whereQuery: Prisma.Sql = Prisma.sql``;

    if (genre_id) {
      whereQuery = Prisma.sql`
      AND i.genre_id = ${genre_id}
      `;
    }

    if (category_id) {
      whereQuery = Prisma.sql`
      AND i.category_id = ${category_id}
      `;
    }

    const targetItems = await API.db.$queryRaw<
      {
        id: Item['id'];
        display_name: Item['display_name'];
        market_price: Item['market_price'];
        sell_price: Item['sell_price'];
        cardnumber: Item['cardnumber'];
        expansion: Item['expansion'];
        rarity: Item['rarity'];
      }[]
    >`
    SELECT i.id, i.display_name, mi.market_price, i.sell_price, i.cardnumber, i.expansion, i.rarity FROM Item i
    INNER JOIN Myca_Item mi ON i.myca_item_id = mi.myca_item_id
    WHERE i.store_id = ${store_id} AND i.sell_price != mi.market_price AND i.status = 'PUBLISH' AND mi.market_price != 0
    ${whereQuery}
    `;

    let adjustRequested = false;

    //調整したい場合
    if (adjustAll) {
      //価格変動のタスクを作っていく
      const tasks: ItemTask.UpdateItemData[] = targetItems.map((item) => ({
        id: item.id,
        sell_price: item.market_price!,
      }));

      const taskManager = new TaskManager({
        targetWorker: 'item',
        kind: 'updateItem',
      });

      await taskManager.publish({
        body: tasks,
        service: API,
        source: TaskSourceKind.API,
        processDescription: `商品マスタの価格を相場価格に合わせます`,
      });

      adjustRequested = true;
    }

    return {
      targetItems,
      adjustRequested,
    };
  },
);
