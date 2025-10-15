import mysql from 'mysql2/promise';

(async () => {
  const mysqlClient = await mysql.createConnection({
    uri: process.env.DATABASE_SERVER_URL,
  });

  try {
    await mysqlClient.query(`
      DROP TRIGGER IF EXISTS whenUpdateItemPrice_insertItem_Price;
      `);

    await mysqlClient.query(`
      CREATE TRIGGER whenUpdateItemPrice_insertItem_Price AFTER UPDATE ON Item FOR EACH ROW
      BEGIN


        IF IFNULL(NEW.sell_price, -1) != IFNULL(OLD.sell_price, -1) OR NEW.allow_round != OLD.allow_round OR IFNULL(NEW.buy_price, -1) != IFNULL(OLD.buy_price, -1) THEN

          /* 紐づいている独自価格も必要に応じてリセットする */
          IF IFNULL(NEW.sell_price, -1) != IFNULL(OLD.sell_price, -1) THEN
            UPDATE Product SET specific_sell_price = NULL WHERE item_id = NEW.id AND allow_sell_price_auto_adjustment = 1 AND specific_sell_price IS NOT NULL;
          END IF;
          IF IFNULL(NEW.buy_price, -1) != IFNULL(OLD.buy_price, -1) THEN
            UPDATE Product SET specific_buy_price = NULL WHERE item_id = NEW.id AND allow_buy_price_auto_adjustment = 1 AND specific_buy_price IS NOT NULL;
          END IF;

          CALL AdjustedPriceInsertIntoProduct(NEW.id, 1);

        END IF;

      END

      `);

    //orderCartStoreのステータスが変わった時、orderのステータスも変える
    await mysqlClient.query(`
    DROP TRIGGER IF EXISTS whenUpdateEcOrderCartStore_updateOrderStatus;
    `);

    await mysqlClient.query(`
      CREATE TRIGGER whenUpdateEcOrderCartStore_updateOrderStatus AFTER UPDATE ON Ec_Order_Cart_Store FOR EACH ROW
      BEGIN 

        /* ステータスが変更されたか確認 */
        IF ( OLD.status != NEW.status ) THEN
          UPDATE Ec_Order o
          SET o.status = 'COMPLETED'
          WHERE o.id = NEW.order_id
            AND o.status = 'PAID'
            AND NOT EXISTS (
              SELECT 1
              FROM Ec_Order_Cart_Store cs
              WHERE cs.order_id = o.id
                AND cs.status NOT IN ('COMPLETED', 'CANCELED')
            );
        END IF;      
      
      END      
      
      `);

    //cnodition_option上の定義が変わった時に価格を再計算する
    //[TODO] Lambdaに移行したい
    await mysqlClient.query(`
DROP TRIGGER IF EXISTS whenUpdateConditionOption_updateProductPrice;
`);

    await mysqlClient.query(`
CREATE TRIGGER whenUpdateConditionOption_updateProductPrice AFTER UPDATE ON Condition_Option_Rate FOR EACH ROW
BEGIN 

  /* Store設定をとっておく */


  /* 定義がどれか変わってたら実行する */
  IF
      IFNULL(OLD.auto_sell_price_adjustment,'') != IFNULL(NEW.auto_sell_price_adjustment,'') OR
      IFNULL(OLD.auto_buy_price_adjustment,'') != IFNULL(NEW.auto_buy_price_adjustment,'')
  THEN


      /* 価格更新 */
      UPDATE Product
      INNER JOIN Item ON Product.item_id = Item.id
      LEFT JOIN (
      SELECT
        Item_Category_Condition_Option.id,
        Item.id AS item_id,
        (
          SELECT Condition_Option_Rate.id FROM Condition_Option_Rate
          WHERE Condition_Option_Rate.option_id = Item_Category_Condition_Option.id AND
          (Condition_Option_Rate.group_id IS NULL OR Condition_Option_Rate.group_id = Item.group_id) AND 
          (Condition_Option_Rate.genre_id IS NULL OR Condition_Option_Rate.genre_id = Item.genre_id)

          /* 規定のものが一番優先度低くなるようにする */
          ORDER BY Condition_Option_Rate.genre_id DESC, Condition_Option_Rate.group_id DESC
          LIMIT 1
        ) AS rate_id
      FROM Item_Category_Condition_Option
      INNER JOIN Item_Category ON Item_Category_Condition_Option.item_category_id = Item_Category.id
      INNER JOIN Item ON Item_Category.id = Item.category_id

      WHERE Item_Category_Condition_Option.id = NEW.option_id

    ) AS rate_table ON Product.condition_option_id = rate_table.id AND Product.item_id = rate_table.item_id
    LEFT JOIN Condition_Option_Rate ON rate_table.rate_id = Condition_Option_Rate.id
    LEFT JOIN Store ON Store.id = Product.store_id
    LEFT JOIN Ec_Setting ON Store.id = Ec_Setting.store_id

    SET
    Product.sell_price = (@sell_price := GET_ADJUSTED_PRICE(Item.sell_price, Condition_Option_Rate.auto_sell_price_adjustment, Store.price_adjustment_round_rule, Store.price_adjustment_round_rank, Item.allow_round, Product.specific_auto_sell_price_adjustment)),
    Product.buy_price = (@buy_orice := GET_ADJUSTED_PRICE(Item.buy_price, Condition_Option_Rate.auto_buy_price_adjustment, Store.price_adjustment_round_rule, Store.price_adjustment_round_rank, Item.allow_round, Product.specific_auto_sell_price_adjustment)),
    Product.sell_price_updated_at = (CASE WHEN IFNULL(Product.actual_sell_price,0) != IFNULL(@sell_price,0) THEN CURRENT_TIMESTAMP ELSE Product.sell_price_updated_at END),
    Product.buy_price_updated_at = (CASE WHEN IFNULL(Product.actual_buy_price,0) != IFNULL(@buy_price,0) THEN CURRENT_TIMESTAMP ELSE Product.buy_price_updated_at END),
    Product.ec_sell_price = (@ec_sell_price := GET_EC_ADJUSTED_PRICE(
      @sell_price,
      Ec_Setting.auto_sell_price_adjustment,
      Ec_Setting.price_adjustment_round_rule,
      Ec_Setting.price_adjustment_round_rank,
      Store.tax_rate,
      Store.tax_mode
    ))

    WHERE
    Product.condition_option_id = NEW.option_id;


  END IF;

END  
`);

    //Productの価格が更新された時に、それをProduct_Priceレコードに残す
    await mysqlClient.query(`
DROP TRIGGER IF EXISTS whenUpdateProductPrice_insertProduct_Price;
`);

    await mysqlClient.query(`
  CREATE TRIGGER whenUpdateProductPrice_insertProduct_Price AFTER UPDATE ON Product FOR EACH ROW
  BEGIN 

/* 販売価格 */
IF NEW.actual_sell_price IS NOT NULL AND IFNULL(OLD.actual_sell_price, -1) != NEW.actual_sell_price THEN

  /* 変動をインサートする */
  INSERT INTO Product_Price(product_id,date,kind,price)
  VALUES(NEW.id,CURRENT_DATE,'sell',NEW.actual_sell_price)
  ON DUPLICATE KEY UPDATE price = NEW.actual_sell_price;

END IF;

/* 買取価格 */
IF NEW.actual_buy_price IS NOT NULL AND IFNULL(OLD.actual_buy_price, -1) != NEW.actual_buy_price THEN

  /* 変動をインサートする */
  INSERT INTO Product_Price(product_id,date,kind,price)
  VALUES(NEW.id,CURRENT_DATE,'buy',NEW.actual_buy_price)
  ON DUPLICATE KEY UPDATE price = NEW.actual_buy_price;

END IF;


/* EC販売価格 */
IF NEW.actual_ec_sell_price IS NOT NULL AND IFNULL(OLD.actual_ec_sell_price, -1) != NEW.actual_ec_sell_price THEN

  /* 変動をインサートする */
  INSERT INTO Product_Price(product_id,date,kind,price)
  VALUES(NEW.id,CURRENT_DATE,'ec',NEW.actual_ec_sell_price)
  ON DUPLICATE KEY UPDATE price = NEW.actual_ec_sell_price;

  /* ochanoko_product_idやshopify_idなどがある場合はoutboxを作る */
  IF NEW.ochanoko_ec_enabled = 1 OR NEW.shopify_ec_enabled = 1 THEN
    /* outboxテーブルに入れる [TODO] 商品名などの情報の変更も検知するならちょっとロジック変える */
    INSERT INTO Outbox_Product(
      product_id,
      ochanoko_product_id,
      shopify_product_id,
      shopify_product_variant_id,
      store_id,
      actual_ec_sell_price
    )
    VALUES(
      NEW.id,
      CASE WHEN NEW.ochanoko_ec_enabled = 1 THEN NEW.ochanoko_product_id ELSE NULL END,
      CASE WHEN NEW.shopify_ec_enabled = 1 THEN NEW.shopify_product_id ELSE NULL END,
      CASE WHEN NEW.shopify_ec_enabled = 1 THEN NEW.shopify_product_variant_id ELSE NULL END,
      NEW.store_id,
      NEW.actual_ec_sell_price
    );

  END IF;

END IF;


END




`);

    //Storeが変更された時にその履歴を残す
    await mysqlClient.query(`
DROP TRIGGER IF EXISTS whenUpdateStore_insertStore_History;
`);

    await mysqlClient.query(`
CREATE TRIGGER whenUpdateStore_insertStore_History AFTER UPDATE ON Store FOR EACH ROW
BEGIN 


  /* 開閉店 */
  IF NEW.opened != OLD.opened THEN
    REPLACE INTO Store_History(store_id,kind,setting_value)
    VALUES(NEW.id,'opened',NEW.opened);
  END IF;

  /* 現金 */
  IF NEW.total_cash_price != OLD.total_cash_price THEN
    REPLACE INTO Store_History(store_id,kind,setting_value)
    VALUES(NEW.id,'total_cash_price',NEW.total_cash_price);
  END IF;

  /* 買取規約文 */
  IF NEW.buy_term != OLD.buy_term THEN
    REPLACE INTO Store_History(store_id,kind,setting_value)
    VALUES(NEW.id,'buy_term',NEW.buy_term);
  END IF;

  /* ステータスメッセージ */
  IF NEW.status_message != OLD.status_message OR OLD.status_message IS NULL OR NEW.status_message IS NULL THEN
    REPLACE INTO Store_History(store_id,kind,setting_value)
    VALUES(NEW.id,'status_message',NEW.status_message);
  END IF;


END

`);

    //Registerのステータスが変更された時にその履歴を残す
    await mysqlClient.query(`
DROP TRIGGER IF EXISTS whenUpdateRegisterStatus_insertRegister_History;
`);

    await mysqlClient.query(`
CREATE TRIGGER whenUpdateRegisterStatus_insertRegister_History AFTER UPDATE ON Register FOR EACH ROW
BEGIN 


  /* 開閉店 */
  IF NEW.status != OLD.status THEN
    REPLACE INTO Register_Status_History(register_id,setting_value)
    VALUES(NEW.id,NEW.status);
  END IF;


END

`);

    //Productの在庫数が更新された時に、それをItemのカラムに入れる
    await mysqlClient.query(`
DROP TRIGGER IF EXISTS whenUpdateProductStockNumber_updateItemProductsStockNumber;
`);

    await mysqlClient.query(`
CREATE TRIGGER whenUpdateProductStockNumber_updateItemProductsStockNumber AFTER UPDATE ON Product FOR EACH ROW
BEGIN 
  /* 在庫数が変更されていたら */
  IF IFNULL(NEW.stock_number, -1) != IFNULL(OLD.stock_number, -1) THEN
    CALL UpdateSumProductsNumber(NEW.item_id);
  END IF;
END
  `);

    //Itemの情報が更新された時に紐づいているProductの情報も更新する（カスタマイズされていない時）
    //これはもういらない
    await mysqlClient.query(`
DROP TRIGGER IF EXISTS whenUpdateItem_updateProducts;
`);

    //       await tx.$executeRaw`
    // CREATE TRIGGER whenUpdateItem_updateProducts AFTER UPDATE ON Item FOR EACH ROW
    // BEGIN

    //   /* 関連づけられているProductの情報を更新する */

    //   /* 価格などの更新だった場合は無視する */
    //   IF
    //     OLD.products_stock_number = NEW.products_stock_number
    //   THEN

    //     UPDATE Product
    //     SET Product.display_name = (CASE WHEN Product.display_name IS NULL OR Product.display_name = OLD.display_name THEN NEW.display_name ELSE Product.display_name END),
    //     Product.display_name_ruby = (CASE WHEN Product.display_name_ruby IS NULL OR Product.display_name_ruby = OLD.display_name_ruby THEN NEW.display_name_ruby ELSE Product.display_name_ruby END),
    //     Product.image_url = (CASE WHEN Product.image_url IS NULL OR Product.image_url = OLD.image_url THEN NEW.image_url ELSE Product.image_url END),
    //     Product.keyword = (CASE WHEN Product.keyword IS NULL OR Product.keyword = OLD.keyword THEN NEW.keyword ELSE Product.keyword END)
    //     WHERE Product.item_id = NEW.id;

    //   END IF;

    // END
    // `;

    console.log(`
        |ーーーーーーーーーーーー|
        |トリガーが更新されました|
        |ーーーーーーーーーーーー|
        `);

    //カスタムSQL
    // await prismaClient.$executeRaw`
    // UPDATE Product
    // SET
    // actual_sell_price = IFNULL(Product.specific_sell_price, Product.sell_price),
    // actual_buy_price = IFNULL(Product.specific_buy_price, Product.buy_price);
    // `
  } catch (e) {
    console.log(e);
  } finally {
    await mysqlClient.end();
  }
})();
