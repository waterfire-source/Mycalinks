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
    MODIFY `list_original_pack` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_product` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_inventory` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_stocking_supplier` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_stocking` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_cash_history` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_transaction` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_customer` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `get_stats` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_purchase_table` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Announcement` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Announcement_Store` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `App_Advertisement` MODIFY `on_pause` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Appraisal` MODIFY `shipping_date` DATE NOT NULL DEFAULT (CURRENT_DATE()),
    MODIFY `finished` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Consignment_Client` MODIFY `enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
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
ALTER TABLE `Ec_Message_Center` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Ec_Order` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Ec_Order_Cart_Store` MODIFY `read` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Ec_Order_Cart_Store_Contact` MODIFY `myca_user_last_read_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Ec_Order_Cart_Store_Contact_Message` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Ec_Order_Payment` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
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
ALTER TABLE `Item` MODIFY `is_buy_only` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `allow_auto_print_label` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `allow_round` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `infinite_stock` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `tablet_allowed` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `market_price_updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `hidden_products` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `jan_code_as_product_code` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Item_Calculate_History` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Item_Category` MODIFY `hidden` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Item_Category_Condition_Option` MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Item_Genre` MODIFY `auto_update` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `hidden` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Item_Group` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

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
ALTER TABLE `Myca_Item` MODIFY `market_price_updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Outbox_Ec_Product_Stock_History` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Outbox_Product` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Pack_Open_History` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Payment` MODIFY `bank__checked` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Product` MODIFY `is_buy_only` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `mycalinks_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `shopify_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `ochanoko_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false,
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
ALTER TABLE `Product_Ec_Stock_History` MODIFY `datetime` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Product_Image` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Product_Price` MODIFY `date` DATE NOT NULL DEFAULT (CURRENT_DATE());

-- AlterTable
ALTER TABLE `Product_Stock_History` MODIFY `source_kind` ENUM('product', 'transaction_sell', 'transaction_buy', 'transaction_sell_return', 'transaction_buy_return', 'stocking', 'stocking_rollback', 'loss', 'loss_rollback', 'bundle', 'bundle_release', 'original_pack', 'original_pack_release', 'pack_opening', 'pack_opening_unregister', 'pack_opening_rollback', 'pack_opening_unregister_rollback', 'box_opening', 'box_create', 'carton_opening', 'carton_create', 'appraisal_create', 'appraisal_return', 'transfer', 'ec_sell', 'ec_sell_return', 'consignment_create', 'consignment_return', 'store_shipment', 'store_shipment_rollback') NOT NULL,
    MODIFY `datetime` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Product_Wholesale_Price_History` MODIFY `arrived_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `is_exact` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `resource_type` ENUM('PRODUCT', 'BUNDLE', 'ORIGINAL_PACK', 'TRANSACTION', 'STOCKING', 'PACK_OPENING', 'PACK_OPENING_UNREGISTER', 'EC_ORDER', 'LOSS', 'APPRAISAL', 'CHILD', 'STORE_SHIPMENT') NOT NULL DEFAULT 'PRODUCT',
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Purchase_Table` MODIFY `show_store_name` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Purchase_Table_Item` MODIFY `any_model_number` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `is_psa10` TINYINT UNSIGNED NOT NULL DEFAULT false;

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
ALTER TABLE `Reservation` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Reservation_Reception` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Reservation_Reception_Product` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

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
ALTER TABLE `Specialty` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Stocking` ADD COLUMN `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Store` MODIFY `opened` TINYINT UNSIGNED NOT NULL DEFAULT false,
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
    MODIFY `ochanoko_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `shopify_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false,
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
ALTER TABLE `System_Log` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Tablet_Allowed_Genre_Category` MODIFY `no_specialty` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Task` MODIFY `requested_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Task_Item` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Template` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Transaction` MODIFY `is_return` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `hidden` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `finished_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `buy__is_assessed` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `can_create_signature` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `Store_Relation` (
    `from_store_id` INTEGER UNSIGNED NOT NULL,
    `to_store_id` INTEGER UNSIGNED NOT NULL,
    `mapping_defined` TINYINT UNSIGNED NOT NULL DEFAULT false,

    PRIMARY KEY (`from_store_id`, `to_store_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item_Category_Mapping` (
    `from_store_id` INTEGER UNSIGNED NOT NULL,
    `to_store_id` INTEGER UNSIGNED NOT NULL,
    `from_category_id` INTEGER UNSIGNED NOT NULL,
    `to_category_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`from_category_id`, `to_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item_Category_Condition_Option_Mapping` (
    `from_store_id` INTEGER UNSIGNED NOT NULL,
    `to_store_id` INTEGER UNSIGNED NOT NULL,
    `from_option_id` INTEGER UNSIGNED NOT NULL,
    `to_option_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`from_option_id`, `to_option_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item_Genre_Mapping` (
    `from_store_id` INTEGER UNSIGNED NOT NULL,
    `to_store_id` INTEGER UNSIGNED NOT NULL,
    `from_genre_id` INTEGER UNSIGNED NOT NULL,
    `to_genre_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`from_genre_id`, `to_genre_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Store_Shipment` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `to_stocking_id` INTEGER UNSIGNED NULL,
    `to_store_id` INTEGER UNSIGNED NOT NULL,
    `shipment_date` DATE NOT NULL,
    `description` TEXT NULL,
    `total_wholesale_price` INTEGER NULL,
    `total_item_count` INTEGER NULL,
    `total_sale_price` INTEGER NULL,
    `status` ENUM('NOT_YET', 'SHIPPED', 'FINISHED', 'CANCELED', 'ROLLBACK') NOT NULL DEFAULT 'NOT_YET',
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `finished_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

    UNIQUE INDEX `Store_Shipment_to_stocking_id_key`(`to_stocking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Store_Shipment_Product` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_shipment_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,
    `unit_price` INTEGER NULL,
    `unit_price_without_tax` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Specialty_Mapping` (
    `from_store_id` INTEGER UNSIGNED NOT NULL,
    `to_store_id` INTEGER UNSIGNED NOT NULL,
    `from_specialty_id` INTEGER UNSIGNED NOT NULL,
    `to_specialty_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`from_specialty_id`, `to_specialty_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Store_Relation` ADD CONSTRAINT `Store_Relation_from_store_id_fkey` FOREIGN KEY (`from_store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store_Relation` ADD CONSTRAINT `Store_Relation_to_store_id_fkey` FOREIGN KEY (`to_store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Category_Mapping` ADD CONSTRAINT `Item_Category_Mapping_from_store_id_to_store_id_fkey` FOREIGN KEY (`from_store_id`, `to_store_id`) REFERENCES `Store_Relation`(`from_store_id`, `to_store_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Category_Mapping` ADD CONSTRAINT `Item_Category_Mapping_from_category_id_fkey` FOREIGN KEY (`from_category_id`) REFERENCES `Item_Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Category_Mapping` ADD CONSTRAINT `Item_Category_Mapping_to_category_id_fkey` FOREIGN KEY (`to_category_id`) REFERENCES `Item_Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Category_Condition_Option_Mapping` ADD CONSTRAINT `Item_Category_Condition_Option_Mapping_from_store_id_to_sto_fkey` FOREIGN KEY (`from_store_id`, `to_store_id`) REFERENCES `Store_Relation`(`from_store_id`, `to_store_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Category_Condition_Option_Mapping` ADD CONSTRAINT `Item_Category_Condition_Option_Mapping_from_option_id_fkey` FOREIGN KEY (`from_option_id`) REFERENCES `Item_Category_Condition_Option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Category_Condition_Option_Mapping` ADD CONSTRAINT `Item_Category_Condition_Option_Mapping_to_option_id_fkey` FOREIGN KEY (`to_option_id`) REFERENCES `Item_Category_Condition_Option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Genre_Mapping` ADD CONSTRAINT `Item_Genre_Mapping_from_store_id_to_store_id_fkey` FOREIGN KEY (`from_store_id`, `to_store_id`) REFERENCES `Store_Relation`(`from_store_id`, `to_store_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Genre_Mapping` ADD CONSTRAINT `Item_Genre_Mapping_from_genre_id_fkey` FOREIGN KEY (`from_genre_id`) REFERENCES `Item_Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Genre_Mapping` ADD CONSTRAINT `Item_Genre_Mapping_to_genre_id_fkey` FOREIGN KEY (`to_genre_id`) REFERENCES `Item_Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store_Shipment` ADD CONSTRAINT `Store_Shipment_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store_Shipment` ADD CONSTRAINT `Store_Shipment_to_stocking_id_fkey` FOREIGN KEY (`to_stocking_id`) REFERENCES `Stocking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store_Shipment` ADD CONSTRAINT `Store_Shipment_to_store_id_fkey` FOREIGN KEY (`to_store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store_Shipment` ADD CONSTRAINT `Store_Shipment_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store_Shipment` ADD CONSTRAINT `Store_Shipment_store_id_to_store_id_fkey` FOREIGN KEY (`store_id`, `to_store_id`) REFERENCES `Store_Relation`(`from_store_id`, `to_store_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store_Shipment_Product` ADD CONSTRAINT `Store_Shipment_Product_store_shipment_id_fkey` FOREIGN KEY (`store_shipment_id`) REFERENCES `Store_Shipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store_Shipment_Product` ADD CONSTRAINT `Store_Shipment_Product_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Specialty_Mapping` ADD CONSTRAINT `Specialty_Mapping_from_store_id_to_store_id_fkey` FOREIGN KEY (`from_store_id`, `to_store_id`) REFERENCES `Store_Relation`(`from_store_id`, `to_store_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Specialty_Mapping` ADD CONSTRAINT `Specialty_Mapping_from_specialty_id_fkey` FOREIGN KEY (`from_specialty_id`) REFERENCES `Specialty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Specialty_Mapping` ADD CONSTRAINT `Specialty_Mapping_to_specialty_id_fkey` FOREIGN KEY (`to_specialty_id`) REFERENCES `Specialty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
