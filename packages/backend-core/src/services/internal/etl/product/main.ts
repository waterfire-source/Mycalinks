export * from '@/services/internal/product/wholesalePrice/main';
//仕入れ値関連
import { BackendService } from '@/services/internal/main';
import { customDayjs, posCommonConstants } from 'common';

import {
  Item,
  Item_Category,
  Item_Category_Condition_Option,
  Item_Genre,
  Prisma,
  Product,
  Specialty,
  Store,
} from '@prisma/client';

/**
 * 在庫数関連
 */
export class BackendCoreProductEtlService extends BackendService {
  constructor(storeId?: Store['id']) {
    super();
    this.setIds({
      storeId,
    });
  }

  /**
   * 日毎の集計をストアごとに作成する
   */
  @BackendService.WithIds(['storeId'])
  public dailyCalculate = async (targetDay: Date) => {
    targetDay = customDayjs(targetDay).tz().startOf('day').toDate();
    const targetDayString = customDayjs(targetDay).tz().format('YYYY-MM-DD');
    const targetNextDay = customDayjs(targetDay).add(1, 'day').toDate();

    const isPast =
      targetDay.getTime() <
      customDayjs().tz().startOf('day').subtract(1, 'day').valueOf();

    console.log(
      `storeId: ${this.ids.storeId} targetDay: ${targetDay} の商品DWH用の集計を行います`,
    );

    //特定の日付を指定されたら、その時点での在庫数を取得する
    let stockNumberQuery: Prisma.Sql = Prisma.sql`
    Product.stock_number AS 'stock_number'
    `;

    //価格も同様
    let priceQuery: Prisma.Sql = Prisma.sql`
    Product.sell_price AS 'sell_price',
    Product.buy_price AS 'buy_price',
    Product.specific_sell_price AS 'specific_sell_price',
    Product.specific_buy_price AS 'specific_buy_price',
    `;

    if (isPast) {
      stockNumberQuery = Prisma.sql`
    IFNULL(
      (SELECT result_stock_number FROM Product_Stock_History
      WHERE Product_Stock_History.product_id = Product.id
      AND DATE(Product_Stock_History.datetime) <= DATE(${targetDayString})
      ORDER BY Product_Stock_History.datetime DESC
      LIMIT 1),
      Product.stock_number
    ) AS 'stock_number'
    `;

      priceQuery = Prisma.sql`
    IFNULL(
      (SELECT price FROM Product_Price
      WHERE Product_Price.product_id = Product.id
      AND Product_Price.date <= DATE(${targetDayString})
      AND Product_Price.kind = 'sell'
      ORDER BY Product_Price.date DESC
      LIMIT 1),
      Product.sell_price
    ) AS 'actual_sell_price',
    IFNULL(
      (SELECT price FROM Product_Price
      WHERE Product_Price.product_id = Product.id
      AND Product_Price.date <= DATE(${targetDayString})
      AND Product_Price.kind = 'buy'
      ORDER BY Product_Price.date DESC
      LIMIT 1),
      Product.buy_price
    ) AS 'actual_buy_price',
    `;
    }

    const allProducts = await this.db.$queryRaw<
      Array<
        Product & {
          condition_option_display_name: Item_Category_Condition_Option['display_name'];
          total_wholesale_price: number;
          myca_item_id: Item['myca_item_id'];
          expansion: Item['expansion'];
          rarity: Item['rarity'];
          cardnumber: Item['cardnumber'];
          category_display_name: Item_Category['display_name'];
          genre_display_name: Item_Genre['display_name'];
          specialty_display_name: Specialty['display_name'];
          management_number: Product['management_number'];
          specialty_id: Specialty['id'];
          category_id: Item_Category['id'];
          genre_id: Item_Genre['id'];
        }
      >
    >`
      SELECT
        Product.*,
        Item.myca_item_id,
        Item.expansion,
        Item.rarity,
        Item.cardnumber,
        Item.category_id,
        Item.genre_id,
        Item_Category_Condition_Option.display_name AS 'condition_option_display_name',
        Item_Genre.display_name AS 'genre_display_name',
        Item_Category.display_name AS 'category_display_name',
        Specialty.display_name AS 'specialty_display_name',
        Product.management_number,
        Product.specialty_id,
        SUM(H.unit_price * H.item_count) AS 'total_wholesale_price',
        ${priceQuery /* 価格のクエリ */}
        ${stockNumberQuery /* ここに在庫数のクエリをぶち込む */}
      FROM
        Product
      LEFT JOIN
        Item_Category_Condition_Option
      ON Item_Category_Condition_Option.id = Product.condition_option_id

      LEFT JOIN
        Item
      ON Product.item_id = Item.id

      LEFT JOIN
        Item_Genre
      ON Item.genre_id = Item_Genre.id

      LEFT JOIN
        Item_Category
      ON Item.category_id = Item_Category.id

      LEFT JOIN
        Specialty
      ON Product.specialty_id = Specialty.id

      LEFT JOIN
        Product_Wholesale_Price_History H
      ON Product.id = H.product_id AND H.resource_type = 'PRODUCT'

      WHERE Product.store_id = ${this.ids.storeId}
      AND Product.deleted = 0
      AND Item.status != 'DELETED'
      AND Product.is_active = 1
      -- AND Item.infinite_stock = 0
      AND Product.stock_number != ${
        posCommonConstants.infiniteItemDefaultStockNumber
      } -- 固定在庫数が入力されていない無限在庫を除く
      AND DATE(Product.created_at) <= DATE(${targetDayString})

      GROUP BY Product.id
      `;

    //fact productの作成

    //在庫の情報をみっちりと取得
    console.log(`対象データ: ${allProducts.length}件`);

    //summary用
    const summaryRecords = {
      store_id: this.ids.storeId!,
      target_day: targetDay,
      total_wholesale_price: 0,
      total_sell_price: 0,
      total_stock_number: 0,
    };

    const factRecords: Array<
      Prisma.Fact_Daily_ProductCreateManyInput & {
        total_sale_price: number;
        total_wholesale_price: number;
      }
    > = [];

    //それぞれの在庫を見ていく
    for (const p of allProducts) {
      let totalWholesalePrice = Number(p.total_wholesale_price) ?? 0;
      const sell_price = Number(p.actual_sell_price) ?? 0;
      const buy_price = Number(p.actual_buy_price) ?? 0;
      const stock_number = Number(p.stock_number) ?? 0;

      //在庫がなかったら飛ばす
      if (stock_number <= 0) continue;

      if (isPast) totalWholesalePrice = 0;

      factRecords.push({
        store_id: Number(p.store_id),
        product_id: Number(p.id),
        total_wholesale_price: totalWholesalePrice,
        actual_sell_price: sell_price,
        actual_buy_price: buy_price,
        stock_number: stock_number,
        condition_option_id: Number(p.condition_option_id),
        condition_option_display_name: p.condition_option_display_name ?? '',
        item_id: Number(p.item_id),
        myca_item_id: Number(p.myca_item_id),
        category_id: Number(p.category_id),
        category_display_name: p.category_display_name ?? '',
        genre_id: Number(p.genre_id),
        genre_display_name: p.genre_display_name ?? '',
        specialty_id: Number(p.specialty_id),
        specialty_display_name: p.specialty_display_name ?? '',
        management_number: p.management_number ?? '',
        expansion: p.expansion ?? '',
        rarity: p.rarity ?? '',
        cardnumber: p.cardnumber ?? '',
        target_day: targetDay,
        product_display_name: p.display_name,
        total_sale_price: sell_price * stock_number,
        average_wholesale_price: Number(p.average_wholesale_price),
        minimum_wholesale_price: Number(p.minimum_wholesale_price),
        maximum_wholesale_price: Number(p.maximum_wholesale_price),
      });

      console.log(`${p.id}完了`);

      summaryRecords.total_wholesale_price += totalWholesalePrice;
      summaryRecords.total_sell_price += sell_price * stock_number;
      summaryRecords.total_stock_number += stock_number;
    }

    console.log(`集計結果:`);

    console.log(`summaryRecords: ${JSON.stringify(summaryRecords, null, 2)}`);

    await this.safeTransaction(
      async (tx) => {
        //fact productの方

        //再計算対策のためにまずは削除する
        await tx.fact_Daily_Product.deleteMany({
          where: {
            store_id: this.ids.storeId ?? 0,
            target_day: targetDay,
          },
        });

        await tx.summary_Daily_Product.deleteMany({
          where: {
            store_id: this.ids.storeId ?? 0,
            target_day: targetDay,
          },
        });

        //集計結果を入れていく
        await Promise.all([
          tx.summary_Daily_Product.create({
            data: summaryRecords,
          }),
          tx.fact_Daily_Product.createMany({
            data: factRecords,
          }),
        ]);
      },
      {
        timeout: 1000 * 60 * 5, //5分間は有効にする
        maxWait: 1000 * 60 * 5,
      },
    );
  };
}
