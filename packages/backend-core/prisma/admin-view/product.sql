-- 在庫情報の取得

SELECT 
  Store.id AS `店舗ID`,
  Store.display_name AS `店舗名`,
  Product.id AS `在庫ID`,
  4280000000000 + Product.id AS `商品コード`,
  Product.display_name AS `商品名`,
  Item.id AS `商品ID`,
  Item.myca_item_id AS `Myca商品ID`,
  Item_Genre.display_name AS `ジャンル`,
  Item_Category.display_name AS `カテゴリ`,
  Item_Category_Condition_Option.display_name AS `状態`,
  Product.image_url AS `画像URL`,
  Product.stock_number AS `在庫数`,

  -- ✅ 追加：価格情報
  Product.actual_sell_price AS `販売価格`,
  Product.actual_buy_price AS `買取価格`,
  Product.average_wholesale_price AS `平均仕入れ値`,
  Product.minimum_wholesale_price AS `最小仕入れ値`,
  Product.maximum_wholesale_price AS `最大仕入れ値`

FROM Product
INNER JOIN Store ON Product.store_id = Store.id
INNER JOIN Item ON Product.item_id = Item.id
INNER JOIN Item_Genre ON Item.genre_id = Item_Genre.id
INNER JOIN Item_Category ON Item.category_id = Item_Category.id
INNER JOIN Item_Category_Condition_Option 
  ON Product.condition_option_id = Item_Category_Condition_Option.id
WHERE Product.is_active = 1
  AND Product.deleted = 0;



-- 店舗一覧とその法人アカウント一覧
SELECT Store.id AS '店舗ID', Store.opened AS '開店中', Store.display_name AS '店舗名', Account.email AS '法人アカウントのメールアドレス', Account.linked_corporation_id AS '法人ID', Corporation.name AS '法人名' FROM Store
INNER JOIN Account_Store ON Store.id = Account_Store.store_id
INNER JOIN Account ON Account_Store.account_id = Account.id
INNER JOIN Corporation ON Account.linked_corporation_id = Corporation.id
WHERE Account.group_id = 100;