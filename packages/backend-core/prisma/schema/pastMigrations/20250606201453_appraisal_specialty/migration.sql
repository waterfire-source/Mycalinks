/*
  Warnings:

  - You are about to drop the column `appraisal_company_id` on the `Appraisal` table. All the data in the column will be lost.
  - You are about to drop the `Appraisal_Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Appraisal_Option` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product_Card_Appraisal_Info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product_Card_Info` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[store_id,management_number]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Appraisal` DROP FOREIGN KEY `Appraisal_appraisal_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `Appraisal_Company` DROP FOREIGN KEY `Appraisal_Company_store_id_fkey`;

-- DropForeignKey
ALTER TABLE `Appraisal_Option` DROP FOREIGN KEY `Appraisal_Option_appraisal_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `Product_Card_Appraisal_Info` DROP FOREIGN KEY `Product_Card_Appraisal_Info_appraisal_option_id_fkey`;

-- DropForeignKey
ALTER TABLE `Product_Card_Appraisal_Info` DROP FOREIGN KEY `Product_Card_Appraisal_Info_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `Product_Card_Info` DROP FOREIGN KEY `Product_Card_Info_product_id_fkey`;

-- DropIndex
DROP INDEX `Appraisal_appraisal_company_id_fkey` ON `Appraisal`;

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
    MODIFY `get_stats` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_original_pack` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `list_purchase_table` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `App_Advertisement` MODIFY `on_pause` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Appraisal` DROP COLUMN `appraisal_company_id`,
    MODIFY `shipping_date` DATE NOT NULL DEFAULT (CURRENT_DATE()),
    MODIFY `finished` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Appraisal_Product` ADD COLUMN `appraisal_number` VARCHAR(191) NULL,
    ADD COLUMN `specialty_id` INTEGER UNSIGNED NULL;

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
ALTER TABLE `Product` ADD COLUMN `management_number` VARCHAR(40) NULL,
    ADD COLUMN `specialty_id` INTEGER UNSIGNED NULL,
    MODIFY `is_buy_only` TINYINT UNSIGNED NOT NULL DEFAULT false,
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
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `ochanoko_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `shopify_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Product_Ec_Stock_History` MODIFY `datetime` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

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
    MODIFY `allow_duty_free` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `ochanoko_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Store_History` MODIFY `run_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Supplier` MODIFY `enabled` TINYINT UNSIGNED NOT NULL DEFAULT true,
    MODIFY `deleted` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `System_Log` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Task` MODIFY `requested_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Task_Item` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `Transaction` MODIFY `is_return` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    MODIFY `finished_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `buy__is_assessed` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `can_create_signature` TINYINT UNSIGNED NOT NULL DEFAULT false,
    MODIFY `hidden` TINYINT UNSIGNED NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `Appraisal_Company`;

-- DropTable
DROP TABLE `Appraisal_Option`;

-- DropTable
DROP TABLE `Product_Card_Appraisal_Info`;

-- DropTable
DROP TABLE `Product_Card_Info`;

-- CreateTable
CREATE TABLE `Specialty` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `handle` VARCHAR(191) NULL,
    `kind` ENUM('NORMAL', 'APPRAISAL') NOT NULL DEFAULT 'NORMAL',
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

    UNIQUE INDEX `Specialty_store_id_display_name_key`(`store_id`, `display_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Product_store_id_specialty_id_idx` ON `Product`(`store_id`, `specialty_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Product_store_id_management_number_key` ON `Product`(`store_id`, `management_number`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `Specialty`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Specialty` ADD CONSTRAINT `Specialty_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appraisal_Product` ADD CONSTRAINT `Appraisal_Product_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `Specialty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_original_transaction_id_fkey` FOREIGN KEY (`original_transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
