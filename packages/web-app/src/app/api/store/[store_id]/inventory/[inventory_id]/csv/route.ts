// 過去の取引の詳細をCSVで取得する（古物台帳）

import { BackendAPI } from '@/api/backendApi/main';
import { getInventoryCsvApi } from 'api-generator';
import { customDayjs } from 'common';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import {
  Inventory,
  Inventory_Products,
  Item,
  Item_Category,
  Item_Category_Condition_Option,
  Item_Genre,
  Product,
} from '@prisma/client';

//一旦買取用
export const GET = BackendAPI.create(
  getInventoryCsvApi,
  async (API, { params }) => {
    const selectRes = await API.db.$queryRaw<
      {
        finished_at: Inventory['finished_at'];
        product_id: Inventory_Products['product_id'];
        product_display_name: Product['display_name'];
        expansion: Item['expansion'];
        cardnumber: Item['cardnumber'];
        rarity: Item['rarity'];
        condition_option_display_name: Item_Category_Condition_Option['display_name'];
        current_stock_number: Inventory_Products['current_stock_number'];
        item_count: Inventory_Products['item_count'];
        average_wholesale_price: Inventory_Products['average_wholesale_price'];
        maximum_wholesale_price: Inventory_Products['maximum_wholesale_price'];
        minimum_wholesale_price: Inventory_Products['minimum_wholesale_price'];
        total_wholesale_price: Inventory_Products['total_wholesale_price'];
        actual_sell_price: Product['actual_sell_price'];
        actual_buy_price: Product['actual_buy_price'];
        shelf_name: Inventory_Products['shelf_name'];
        genre_display_name: Item_Genre['display_name'];
        category_display_name: Item_Category['display_name'];
      }[]
    >`
    SELECT
      Inventory.finished_at,
      Inventory_Products.product_id,
      Product.display_name AS 'product_display_name',
      Item.expansion,
      Item.cardnumber,
      Item.rarity,
      Item_Category_Condition_Option.display_name AS 'condition_option_display_name',
      Inventory_Products.current_stock_number,
      Inventory_Products.item_count,
      Inventory_Products.average_wholesale_price,
      Inventory_Products.maximum_wholesale_price,
      Inventory_Products.minimum_wholesale_price,
      Inventory_Products.total_wholesale_price,
      Product.actual_sell_price,
      Product.actual_buy_price,
      Inventory_Products.shelf_name,
      Item_Genre.display_name AS 'genre_display_name',
      Item_Category.display_name AS 'category_display_name'
    FROM Inventory_Products
    INNER JOIN Inventory ON Inventory_Products.inventory_id = Inventory.id
    INNER JOIN Product ON Inventory_Products.product_id = Product.id
    INNER JOIN Item_Category_Condition_Option ON Item_Category_Condition_Option.id = Product.condition_option_id
    INNER JOIN Item ON Product.item_id = Item.id
    INNER JOIN Item_Category ON Item.category_id = Item_Category.id
    INNER JOIN Item_Genre ON Item.genre_id = Item_Genre.id
      
    WHERE Inventory.store_id = ${params.store_id}
    AND Inventory_Products.inventory_id = ${params.inventory_id}
    AND Inventory.status = 'FINISHED'
    `;

    //一つずつラベリングしていく
    const inventoryProducts = selectRes.map((p) => {
      return {
        棚卸日: customDayjs(p.finished_at).tz().format('YYYY/MM/DD'),
        在庫ID: p.product_id,
        商品名: p.product_display_name,
        エキスパンション: p.expansion,
        カード番号: p.cardnumber,
        レアリティ: p.rarity,
        状態: p.condition_option_display_name,
        理論値: p.current_stock_number,
        登録数: p.item_count,
        差分: p.item_count - (p.current_stock_number ?? 0),
        平均仕入値: p.average_wholesale_price,
        最大仕入値: p.maximum_wholesale_price,
        最小仕入値: p.minimum_wholesale_price,
        合計仕入値: p.total_wholesale_price,
        販売価格: p.actual_sell_price,
        買取価格: p.actual_buy_price,
        棚名: p.shelf_name,
        ジャンル: p.genre_display_name,
        カテゴリ: p.category_display_name,
      };
    });

    const csvService = new BackendApiCsvService(API);
    const fileService = new BackendApiFileService(API);

    const uploadRes = await fileService.uploadCsvToS3({
      dirKind: 'inventory',
      writer: async (passThrough) => {
        csvService.core.passThrough = passThrough;

        //@ts-expect-error テンプレート管理外
        await csvService.core.maker(inventoryProducts);
      },
    });

    return {
      fileUrl: uploadRes,
    };
  },
);
