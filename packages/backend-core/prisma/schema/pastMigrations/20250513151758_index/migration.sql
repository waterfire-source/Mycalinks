-- DropIndex
DROP INDEX `Account_deleted_idx` ON `Account`;

-- DropIndex
DROP INDEX `Item_myca_item_id_idx` ON `Item`;

-- DropIndex
DROP INDEX `Item_status_idx` ON `Item`;

-- DropIndex
DROP INDEX `Item_Category_Condition_Option_deleted_idx` ON `Item_Category_Condition_Option`;

-- DropIndex
DROP INDEX `Product_actual_sell_price_idx` ON `Product`;

-- DropIndex
DROP INDEX `Product_deleted_idx` ON `Product`;

-- DropIndex
DROP INDEX `Product_readonly_product_code_idx` ON `Product`;

-- DropIndex
DROP INDEX `Stocking_status_idx` ON `Stocking`;

-- DropIndex
DROP INDEX `Transaction_is_return_idx` ON `Transaction`;

-- AlterTable
ALTER TABLE `Account` MODIFY `login_flg` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Account_Group` MODIFY `create_account` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `update_corporation` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `admin_mode` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `update_store` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `sales_mode` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `update_store_setting` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `get_transaction_customer_info` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `set_transaction_manual_discount` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `create_transaction_return` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `create_buy_reception` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `assess_buy_transaction` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `finish_buy_transaction` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `set_buy_transaction_manual_product_price` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_item` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_product` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_inventory` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_stocking_supplier` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_stocking` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_cash_history` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_transaction` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_customer` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `get_stats` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `App_Advertisement` MODIFY `on_pause` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Appraisal` MODIFY `shipping_date` DATE NOT NULL DEFAULT (CURRENT_DATE()),
    MODIFY `finished` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Contact` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Contract` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Contract_Payment` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Corporation` MODIFY `square_available` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `enabled_staff_account` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Customer` MODIFY `is_active` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Customer_Point_History` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Department` MODIFY `is_auto_registered` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `auto_update` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `hidden` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Ec_Order` MODIFY `code` VARCHAR(32) NOT NULL DEFAULT concat(lpad(hex(unix_timestamp(now(3)) * 1000), 12, '0'),'7',substr(hex(random_bytes(2)), 2),hex(floor(rand() * 4 + 8)),substr(hex(random_bytes(8)), 2)),
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Ec_Order_Cart_Store` MODIFY `code` VARCHAR(30) NOT NULL DEFAULT concat(lpad(hex(unix_timestamp(now(3)) * 1000), 12, '0'),substr(hex(random_bytes(2)), 2)),
    MODIFY `read` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Ec_Order_Cart_Store_Contact` MODIFY `myca_user_last_read_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Ec_Order_Cart_Store_Contact_Message` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Ec_Setting` MODIFY `auto_listing` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `auto_stocking` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `enable_same_day_shipping` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Gmo_Credit_Card` MODIFY `is_primary` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Inventory` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Inventory_Shelf` MODIFY `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Item` MODIFY `jan_code_as_product_code` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `is_buy_only` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `allow_auto_print_label` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `allow_round` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `market_price_updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `infinite_stock` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `tablet_allowed` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `hidden_products` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Item_Calculate_History` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Item_Category` MODIFY `hidden` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Item_Category_Condition_Option` MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Item_Genre` MODIFY `auto_update` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `hidden` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Item_Group` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Item_Price` MODIFY `date` DATE NOT NULL DEFAULT (CURRENT_DATE());

-- AlterTable
ALTER TABLE `Loss` MODIFY `datetime` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Loss_Genre` MODIFY `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Memo` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Pack_Open_History` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Product` MODIFY `is_buy_only` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `mycalinks_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `disable_ec_auto_stocking` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `is_active` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `arrow_auto_price_adjustment` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `force_no_price_label` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `is_special_price_product` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `allowed_point` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `tablet_allowed` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `sell_price_updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `buy_price_updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Product_Price` MODIFY `date` DATE NOT NULL DEFAULT (CURRENT_DATE());

-- AlterTable
ALTER TABLE `Product_Stock_History` MODIFY `datetime` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Product_Wholesale_Price_History` MODIFY `arrived_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `is_exact` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Purchase_Table` MODIFY `show_store_name` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Purchase_Table_Item` MODIFY `any_model_number` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Register` MODIFY `is_primary` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `auto_print_receipt_enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `cash_reset_enabled` TINYINT UNSIGNED NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `Register_Cash_History` MODIFY `datetime` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Register_Settlement` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `data_end_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Register_Status_History` MODIFY `run_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Sale` MODIFY `on_pause` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Sale_Calculate_History` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Set_Deal` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Shipping_Method` MODIFY `enabled_tracking` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `enabled_cash_on_delivery` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `is_all_in_one_fee` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Stocking` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Store` MODIFY `code` VARCHAR(32) NOT NULL DEFAULT concat(lpad(hex(unix_timestamp(now(3)) * 1000), 12, '0'),'7',substr(hex(random_bytes(2)), 2),hex(floor(rand() * 4 + 8)),substr(hex(random_bytes(8)), 2)),
    MODIFY `opened` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `is_active` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `auto_print_receipt` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `allow_print_no_price_label` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `point_enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `visit_point_enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `sell_point_enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `sell_point_limit_enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `buy_point_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `buy_point_limit_enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `point_spend_limit_enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `point_expire_enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `register_cash_reset_enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `register_cash_manage_by_separately` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `mycalinks_ec_terms_accepted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `mycalinks_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `hide_non_mycalinks_item_on_tablet` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `hide_no_stock_product_on_tablet` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `hide_no_sell_price_product_on_tablet` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `include_tax` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `allow_duty_free` TINYINT UNSIGNED NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `Store_History` MODIFY `run_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Supplier` MODIFY `enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Tag` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Task` MODIFY `requested_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Transaction` MODIFY `is_return` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `finished_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `buy__is_assessed` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `can_create_signature` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Account_deleted_linked_corporation_id_code_idx` ON `Account`(`deleted`, `linked_corporation_id`, `code`);

-- CreateIndex
CREATE INDEX `Customer_myca_user_id_idx` ON `Customer`(`myca_user_id`);

-- CreateIndex
CREATE INDEX `Ec_Order_myca_user_id_idx` ON `Ec_Order`(`myca_user_id`);

-- CreateIndex
CREATE INDEX `Item_status_category_id_genre_id_idx` ON `Item`(`status`, `category_id`, `genre_id`);

-- CreateIndex
CREATE INDEX `Item_market_price_idx` ON `Item`(`market_price`);

-- CreateIndex
CREATE INDEX `Item_status_myca_item_id_idx` ON `Item`(`status`, `myca_item_id`);

-- CreateIndex
CREATE INDEX `Item_Category_Condition_Option_item_category_id_deleted_idx` ON `Item_Category_Condition_Option`(`item_category_id`, `deleted`);

-- CreateIndex
CREATE INDEX `Product_store_id_deleted_item_id_idx` ON `Product`(`store_id`, `deleted`, `item_id`);

-- CreateIndex
CREATE INDEX `Product_store_id_deleted_is_active_item_id_stock_number_idx` ON `Product`(`store_id`, `deleted`, `is_active`, `item_id`, `stock_number`);

-- CreateIndex
CREATE INDEX `Product_store_id_deleted_is_buy_only_idx` ON `Product`(`store_id`, `deleted`, `is_buy_only`);

-- CreateIndex
CREATE INDEX `Product_item_id_deleted_mycalinks_ec_enabled_actual_ec_sell__idx` ON `Product`(`item_id`, `deleted`, `mycalinks_ec_enabled`, `actual_ec_sell_price`, `ec_stock_number`, `condition_option_id`);

-- CreateIndex
CREATE INDEX `Product_store_id_readonly_product_code_idx` ON `Product`(`store_id`, `readonly_product_code`);

-- CreateIndex
CREATE INDEX `Product_store_id_actual_sell_price_idx` ON `Product`(`store_id`, `actual_sell_price`);

-- CreateIndex
CREATE INDEX `Sale_store_id_status_transaction_kind_idx` ON `Sale`(`store_id`, `status`, `transaction_kind`);

-- CreateIndex
CREATE INDEX `Set_Deal_status_store_id_idx` ON `Set_Deal`(`status`, `store_id`);

-- CreateIndex
CREATE INDEX `Stocking_store_id_status_idx` ON `Stocking`(`store_id`, `status`);

-- CreateIndex
CREATE INDEX `Store_mycalinks_ec_enabled_idx` ON `Store`(`mycalinks_ec_enabled`);

-- CreateIndex
CREATE INDEX `Transaction_is_return_store_id_transaction_kind_status_idx` ON `Transaction`(`is_return`, `store_id`, `transaction_kind`, `status`);

-- CreateIndex
CREATE INDEX `Transaction_customer_id_store_id_status_idx` ON `Transaction`(`customer_id`, `store_id`, `status`);

-- CreateIndex
CREATE INDEX `Transaction_register_id_store_id_status_idx` ON `Transaction`(`register_id`, `store_id`, `status`);

-- CreateIndex
CREATE INDEX `Transaction_Cart_transaction_id_product_id_idx` ON `Transaction_Cart`(`transaction_id`, `product_id`);

-- CreateIndex
CREATE INDEX `Transaction_Customer_Cart_transaction_id_product_id_idx` ON `Transaction_Customer_Cart`(`transaction_id`, `product_id`);

DROP TRIGGER IF EXISTS whenUpdateProductStockNumber_updateItemProductsStockNumber;

-- 無限在庫
UPDATE Product 
INNER JOIN Item ON Product.item_id = Item.id
SET Product.is_active = 1, Product.stock_number = 1
WHERE Item.infinite_stock = 1;