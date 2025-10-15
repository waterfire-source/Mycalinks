import mysql from 'mysql2/promise';

// const q = async (query) => await prisma.$executeRaw(query);

//本当はストアドプロシージャとかなるべく使いたくない（lambdaとかに置き換えたい）

(async () => {
  const mysqlClient = await mysql.createConnection({
    uri: process.env.DATABASE_SERVER_URL,
  });

  try {
    await mysqlClient.query(`
        DROP FUNCTION IF EXISTS GET_ADJUSTED_PRICE;
            `);

    await mysqlClient.query(`
        CREATE FUNCTION GET_ADJUSTED_PRICE(original_price INT, adjust_def VARCHAR(191), round_rule ENUM('up','down','round'), round_rank INT, allow_round TINYINT, specific_adjust_def VARCHAR(191)) RETURNS INT DETERMINISTIC
BEGIN
  DECLARE base_price DOUBLE;
  DECLARE final_price DOUBLE;

  -- original_priceがNULLの場合は0を返す
  IF original_price IS NULL THEN
    RETURN 0;
  END IF;

  -- 通常のadjust処理
  IF adjust_def IS NOT NULL AND adjust_def LIKE '%\%%' THEN
  
    SET base_price = original_price * (CAST(REPLACE(adjust_def, '%', '') AS DECIMAL(10, 4)) / 100);
  ELSEIF adjust_def IS NOT NULL THEN
    SET base_price = original_price + CAST(adjust_def AS DECIMAL(10, 4));
  ELSE
    SET base_price = original_price;
  END IF;

  -- specific_adjust処理
  IF specific_adjust_def IS NOT NULL AND specific_adjust_def LIKE '%\%%' THEN
    SET final_price = base_price * (CAST(REPLACE(specific_adjust_def, '%', '') AS DECIMAL(10, 4)) / 100);
  ELSEIF specific_adjust_def IS NOT NULL THEN
    SET final_price = base_price + CAST(specific_adjust_def AS DECIMAL(10, 4));
  ELSE
    SET final_price = base_price;
  END IF;

  -- 丸め処理
  RETURN CASE
    WHEN allow_round = 0 OR round_rank IS NULL THEN FLOOR(final_price)
    WHEN round_rule = 'up' THEN CEILING(final_price / round_rank) * round_rank
    WHEN round_rule = 'down' THEN FLOOR(final_price / round_rank) * round_rank
    ELSE ROUND(final_price / round_rank) * round_rank
  END;
END
              
              `);
    await mysqlClient.query(`
        DROP FUNCTION IF EXISTS GET_EC_ADJUSTED_PRICE;
            `);

    await mysqlClient.query(`
        CREATE FUNCTION GET_EC_ADJUSTED_PRICE(sell_price INT, adjust_def INT, round_rule ENUM('UP','DOWN','ROUND'), round_rank INT, tax_rate FLOAT, tax_mode ENUM('INCLUDE','EXCLUDE')) RETURNS INT DETERMINISTIC
BEGIN
  DECLARE base_price DOUBLE;
  DECLARE adjusted_price DOUBLE;

  -- 初期価格（null対応）
  SET base_price = IFNULL(sell_price, 0);

  -- 調整係数（% → デフォルト100%）
  SET adjusted_price = base_price * IFNULL(adjust_def, 100) / 100;

  -- 税込み変換
  IF tax_mode = 'EXCLUDE' THEN
    SET adjusted_price = adjusted_price * (1 + IFNULL(tax_rate, 0));
  END IF;

  -- 丸めて返却（INTで返すなら最後に変換）
  RETURN CASE
    WHEN round_rule IS NULL THEN FLOOR(adjusted_price)
    WHEN round_rule = 'UP' THEN CEILING(adjusted_price / round_rank) * round_rank
    WHEN round_rule = 'DOWN' THEN FLOOR(adjusted_price / round_rank) * round_rank
    ELSE ROUND(adjusted_price / round_rank) * round_rank
  END;
END
              
              `);
    await mysqlClient.query(`
        DROP FUNCTION IF EXISTS UUID_V7;
            `);

    await mysqlClient.query(`
        CREATE FUNCTION UUID_V7() RETURNS VARCHAR(32) NOT DETERMINISTIC
        BEGIN
          
          RETURN concat(lpad(hex(unix_timestamp(now(3)) * 1000), 12, '0'),'7',substr(hex(random_bytes(2)), 2),hex(floor(rand() * 4 + 8)),substr(hex(random_bytes(8)), 2));
        
        END
              
              `);

    await mysqlClient.query(`
DROP PROCEDURE IF EXISTS AdjustedPriceInsertIntoProduct
`);

    await mysqlClient.query(`
CREATE PROCEDURE AdjustedPriceInsertIntoProduct(IN item_id INT, IN is_update TINYINT(1))
BEGIN

-- 最優先の rate_id を持つ中間テーブルを WITH 句で定義し、そのまま UPDATE に JOIN
UPDATE Product p
JOIN (
  SELECT
    product_id,
    rate_id,
    sell_price, buy_price, allow_round,
    specific_auto_sell_price_adjustment,
    price_adjustment_round_rule,
    price_adjustment_round_rank,
    auto_sell_price_adjustment,
    auto_buy_price_adjustment,
    ec_adj,
    ec_round_rule,
    ec_round_rank,
    tax_rate,
    tax_mode
  FROM (
    SELECT
      p.id AS product_id,
      cor.id AS rate_id,
      i.sell_price, i.buy_price, i.allow_round,
      p.specific_auto_sell_price_adjustment,
      s.price_adjustment_round_rule,
      s.price_adjustment_round_rank,
      cor.auto_sell_price_adjustment,
      cor.auto_buy_price_adjustment,
      es.auto_sell_price_adjustment AS ec_adj,
      es.price_adjustment_round_rule AS ec_round_rule,
      es.price_adjustment_round_rank AS ec_round_rank,
      s.tax_rate,
      s.tax_mode,
      ROW_NUMBER() OVER (
        PARTITION BY p.id
        ORDER BY cor.genre_id DESC, cor.group_id DESC
      ) AS rn
    FROM Product p
    JOIN Item i ON p.item_id = i.id
    JOIN Item_Category ic ON i.category_id = ic.id
    JOIN Item_Category_Condition_Option icoo
      ON icoo.item_category_id = ic.id AND icoo.id = p.condition_option_id
    LEFT JOIN Condition_Option_Rate cor
      ON cor.option_id = icoo.id
      AND (cor.group_id IS NULL OR cor.group_id = i.group_id)
      AND (cor.genre_id IS NULL OR cor.genre_id = i.genre_id)
    JOIN Store s ON p.store_id = s.id
    LEFT JOIN Ec_Setting es ON s.id = es.store_id
    WHERE
      p.item_id = item_id
  ) AS ranked
  WHERE rn = 1
) tmp ON p.id = tmp.product_id
SET
  p.sell_price = (@sell_price := GET_ADJUSTED_PRICE(
    tmp.sell_price,
    tmp.auto_sell_price_adjustment,
    tmp.price_adjustment_round_rule,
    tmp.price_adjustment_round_rank,
    tmp.allow_round,
    tmp.specific_auto_sell_price_adjustment
  )),
  p.buy_price = CASE
    WHEN is_update = 1
      AND p.specific_buy_price IS NULL
      AND p.buy_price IS NULL
    THEN (@buy_price := NULL)
    ELSE (@buy_price := GET_ADJUSTED_PRICE(
      tmp.buy_price,
      tmp.auto_buy_price_adjustment,
      tmp.price_adjustment_round_rule,
      tmp.price_adjustment_round_rank,
      tmp.allow_round,
      tmp.specific_auto_sell_price_adjustment
    ))
  END,
  p.sell_price_updated_at = CASE
    WHEN IFNULL(p.actual_sell_price, 0) != @sell_price
    THEN CURRENT_TIMESTAMP ELSE p.sell_price_updated_at
  END,
  p.buy_price_updated_at = CASE
    WHEN IFNULL(p.actual_buy_price, 0) != IFNULL(@buy_price, 0)
    THEN CURRENT_TIMESTAMP ELSE p.buy_price_updated_at
  END,
  p.ec_sell_price = (@ec_sell_price := GET_EC_ADJUSTED_PRICE(
    IFNULL(p.specific_sell_price, @sell_price),
    tmp.ec_adj,
    tmp.ec_round_rule,
    tmp.ec_round_rank,
    tmp.tax_rate,
    tmp.tax_mode
  ));

END;
`);

    await mysqlClient.query(`
DROP PROCEDURE IF EXISTS UpdateSumProductsNumber
`);

    await mysqlClient.query(`
CREATE PROCEDURE UpdateSumProductsNumber(IN specific_item_id INT)
BEGIN
UPDATE Item
  SET products_stock_number = (
    SELECT SUM(stock_number)
    FROM Product
    WHERE item_id = Item.id
  )
WHERE id = specific_item_id;
END
`);

    console.log(`
        |ーーーーーーーーーーーーーーーーーー|
        |ストアドプロシージャが更新されました|
        |ーーーーーーーーーーーーーーーーーー|
        `);
  } catch (e) {
    console.log(e);
  } finally {
    await mysqlClient.end();
  }
})();
