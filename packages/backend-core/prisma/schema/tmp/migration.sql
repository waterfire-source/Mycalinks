-- CreateTable
CREATE TABLE `Account` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `display_name` VARCHAR(191) NULL,
    `hashed_password` TEXT NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `email` VARCHAR(191) NOT NULL,
    `salt` VARCHAR(191) NULL,
    `group_id` INTEGER UNSIGNED NOT NULL,
    `linked_corporation_id` INTEGER UNSIGNED NOT NULL,
    `login_flg` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `code` INTEGER NULL,
    `code_updated_at` TIMESTAMP(0) NULL,
    `nick_name` VARCHAR(191) NULL,

    INDEX `Account_deleted_linked_corporation_id_code_idx`(`deleted` ASC, `linked_corporation_id` ASC, `code` ASC),
    UNIQUE INDEX `Account_email_key`(`email` ASC),
    INDEX `Account_group_id_fkey`(`group_id` ASC),
    UNIQUE INDEX `Account_linked_corporation_id_code_key`(`linked_corporation_id` ASC, `code` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account_Group` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `corporation_id` INTEGER UNSIGNED NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `admin_mode` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `assess_buy_transaction` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `create_account` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `create_buy_reception` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `create_transaction_return` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `finish_buy_transaction` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `get_transaction_customer_info` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `list_cash_history` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `list_customer` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `list_inventory` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `list_item` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `list_product` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `list_stocking` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `list_stocking_supplier` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `list_transaction` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `sales_mode` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `set_buy_transaction_manual_product_price` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `set_transaction_manual_discount` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `update_corporation` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `update_store` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `update_store_setting` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `get_stats` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `list_original_pack` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `list_purchase_table` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `Account_Group_corporation_id_fkey`(`corporation_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account_Store` (
    `account_id` INTEGER UNSIGNED NOT NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,

    INDEX `Account_Store_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`account_id` ASC, `store_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `App_Advertisement` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'UNPUBLISHED', 'PUBLISHED', 'FINISHED') NOT NULL DEFAULT 'DRAFT',
    `on_pause` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `kind` ENUM('PURCHASE_TABLE', 'EVENT', 'NOTIFICATION', 'TICKET') NOT NULL,
    `start_at` TIMESTAMP(0) NOT NULL,
    `end_at` TIMESTAMP(0) NULL,
    `thumbnail_image_url` VARCHAR(191) NULL,
    `data_type` ENUM('IMAGE', 'TEXT') NOT NULL,
    `data_text` TEXT NULL,
    `deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `App_Advertisement_deleted_idx`(`deleted` ASC),
    INDEX `App_Advertisement_staff_account_id_fkey`(`staff_account_id` ASC),
    INDEX `App_Advertisement_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `App_Advertisement_Image` (
    `advertisement_id` INTEGER UNSIGNED NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`advertisement_id` ASC, `image_url` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `App_User` (
    `app_user_id` INTEGER NOT NULL,
    `gmo_customer_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`app_user_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appraisal` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `shipping_date` DATE NOT NULL DEFAULT (curdate()),
    `appraisal_fee` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `finished` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `Appraisal_staff_account_id_fkey`(`staff_account_id` ASC),
    INDEX `Appraisal_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appraisal_Product` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `appraisal_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `sell_price` INTEGER NULL,
    `condition_option_id` INTEGER UNSIGNED NULL,
    `wholesale_price` INTEGER NOT NULL,
    `appraisal_fee` INTEGER NOT NULL,
    `to_product_id` INTEGER UNSIGNED NULL,
    `appraisal_number` VARCHAR(191) NULL,
    `specialty_id` INTEGER UNSIGNED NULL,

    INDEX `Appraisal_Product_appraisal_id_product_id_idx`(`appraisal_id` ASC, `product_id` ASC),
    INDEX `Appraisal_Product_condition_option_id_fkey`(`condition_option_id` ASC),
    INDEX `Appraisal_Product_product_id_fkey`(`product_id` ASC),
    INDEX `Appraisal_Product_specialty_id_fkey`(`specialty_id` ASC),
    INDEX `Appraisal_Product_to_product_id_fkey`(`to_product_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bundle_Item_Product` (
    `item_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,

    INDEX `Bundle_Item_Product_product_id_fkey`(`product_id` ASC),
    PRIMARY KEY (`item_id` ASC, `product_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Condition_Option_Rate` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `option_id` INTEGER UNSIGNED NOT NULL,
    `group_id` INTEGER UNSIGNED NULL,
    `genre_id` INTEGER UNSIGNED NULL,
    `auto_sell_price_adjustment` VARCHAR(191) NOT NULL,
    `auto_buy_price_adjustment` VARCHAR(191) NOT NULL,
    `auto_sell_price_adjustment_round_rule` ENUM('up', 'down', 'round') NULL,
    `auto_buy_price_adjustment_round_rule` ENUM('up', 'down', 'round') NULL,
    `auto_sell_price_adjustment_round_rank` INTEGER NULL,
    `auto_buy_price_adjustment_round_rank` INTEGER NULL,

    INDEX `Condition_Option_Rate_genre_id_fkey`(`genre_id` ASC),
    INDEX `Condition_Option_Rate_group_id_fkey`(`group_id` ASC),
    UNIQUE INDEX `Condition_Option_Rate_option_id_group_id_genre_id_key`(`option_id` ASC, `group_id` ASC, `genre_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `service_kind` ENUM('EC') NOT NULL,
    `client_kind` ENUM('CUSTOMER', 'STORE') NOT NULL,
    `account_id` INTEGER NULL,
    `account_kind` ENUM('APP') NULL,
    `kind` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `myca_item_id` INTEGER NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contract` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `status` ENUM('NOT_STARTED', 'STARTED', 'ERROR', 'FINISHED') NOT NULL DEFAULT 'NOT_STARTED',
    `token` VARCHAR(191) NOT NULL,
    `token_expires_at` TIMESTAMP(0) NOT NULL,
    `start_at` TIMESTAMP(0) NOT NULL,
    `main_account_monthly_fee` INTEGER NOT NULL,
    `corporation_management_account_fee` INTEGER NOT NULL,
    `mobile_device_connection_fee` INTEGER NOT NULL,
    `initial_fee` INTEGER NOT NULL,
    `initial_payment_price` INTEGER NOT NULL,
    `monthly_payment_price` INTEGER NOT NULL,
    `corporation_id` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `gmo_customer_id` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `next_payment_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `Contract_corporation_id_key`(`corporation_id` ASC),
    UNIQUE INDEX `Contract_token_key`(`token` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contract_Payment` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `contract_id` INTEGER UNSIGNED NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'ERROR') NOT NULL,
    `kind` ENUM('INITIAL_FEE', 'MONTHLY_FEE') NOT NULL,
    `card_id` INTEGER UNSIGNED NOT NULL,
    `total_price` INTEGER NOT NULL,
    `type` ENUM('pay', 'refund') NOT NULL DEFAULT 'pay',
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `finished_at` DATETIME(3) NULL,
    `gmo_access_id` VARCHAR(191) NULL,
    `target_month` INTEGER NULL,

    INDEX `Contract_Payment_card_id_fkey`(`card_id` ASC),
    INDEX `Contract_Payment_contract_id_fkey`(`contract_id` ASC),
    UNIQUE INDEX `Contract_Payment_gmo_access_id_key`(`gmo_access_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Corporation` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `ceo_name` VARCHAR(191) NULL,
    `head_office_address` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `kobutsusho_koan_iinkai` VARCHAR(191) NULL,
    `kobutsusho_number` VARCHAR(191) NULL,
    `square_access_token` VARCHAR(191) NULL,
    `square_available` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `square_refresh_token` VARCHAR(191) NULL,
    `square_access_token_expires_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `invoice_number` VARCHAR(191) NULL,
    `zip_code` VARCHAR(191) NULL,
    `price_adjustment_round_rank` INTEGER NOT NULL DEFAULT 1,
    `price_adjustment_round_rule` ENUM('UP', 'DOWN', 'ROUND') NOT NULL DEFAULT 'UP',
    `tax_mode` ENUM('INCLUDE', 'EXCLUDE') NOT NULL DEFAULT 'INCLUDE',
    `use_wholesale_price_order_column` ENUM('unit_price', 'arrived_at') NOT NULL DEFAULT 'unit_price',
    `use_wholesale_price_order_rule` ENUM('desc', 'asc') NOT NULL DEFAULT 'desc',
    `wholesale_price_keep_rule` ENUM('individual', 'average') NOT NULL DEFAULT 'individual',
    `enabled_staff_account` TINYINT UNSIGNED NOT NULL DEFAULT 1,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `email` VARCHAR(191) NULL,
    `myca_user_id` INTEGER NULL,
    `birthday` DATE NULL,
    `registration_date` DATE NULL,
    `owned_point` INTEGER NOT NULL DEFAULT 0,
    `point_exp` DATE NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `address` VARCHAR(191) NULL,
    `career` VARCHAR(191) NULL,
    `full_name` VARCHAR(191) NULL,
    `full_name_ruby` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `address2` VARCHAR(191) NULL,
    `building` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `prefecture` VARCHAR(191) NULL,
    `zip_code` VARCHAR(191) NULL,
    `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `term_accepted_at` DATETIME(3) NULL,
    `memo` TEXT NULL,

    INDEX `Customer_myca_user_id_idx`(`myca_user_id` ASC),
    UNIQUE INDEX `Customer_store_id_myca_user_id_key`(`store_id` ASC, `myca_user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer_Point_History` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_account_id` INTEGER UNSIGNED NULL,
    `customer_id` INTEGER UNSIGNED NOT NULL,
    `source_kind` ENUM('TRANSACTION_USE', 'TRANSACTION_USE_RETURN', 'TRANSACTION_GET', 'TRANSACTION_GET_RETURN', 'VISIT', 'MANUAL') NOT NULL,
    `source_id` INTEGER UNSIGNED NULL,
    `change_price` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `result_point_amount` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Customer_Point_History_customer_id_fkey`(`customer_id` ASC),
    INDEX `Customer_Point_History_staff_account_id_fkey`(`staff_account_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `display_name` VARCHAR(191) NULL,
    `parent_department_id` INTEGER UNSIGNED NULL,
    `description` TEXT NULL,
    `is_auto_registered` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `auto_update` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `hidden` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `staff_account_id` INTEGER UNSIGNED NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `handle` VARCHAR(191) NULL,
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `Department_parent_department_id_fkey`(`parent_department_id` ASC),
    INDEX `Department_staff_account_id_fkey`(`staff_account_id` ASC),
    UNIQUE INDEX `Department_store_id_handle_key`(`store_id` ASC, `handle` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Discount` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `display_name` VARCHAR(191) NOT NULL,
    `discount_amount` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ec_Banner` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `order_number` INTEGER NOT NULL DEFAULT 0,
    `url` VARCHAR(191) NULL,
    `place` ENUM('TOP', 'BOTTOM') NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ec_Order` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `status` ENUM('DRAFT', 'UNPAID', 'PAID', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
    `payment_method` ENUM('CARD', 'PAYPAY', 'CASH_ON_DELIVERY', 'CONVENIENCE_STORE', 'BANK') NULL,
    `myca_user_id` INTEGER NULL,
    `shipping_address` VARCHAR(100) NULL,
    `shipping_total_fee` INTEGER NOT NULL DEFAULT 0,
    `total_price` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `customer_email` VARCHAR(191) NULL,
    `customer_name` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `ordered_at` TIMESTAMP(0) NULL,
    `shipping_address_prefecture` VARCHAR(20) NULL,
    `code` VARCHAR(32) NOT NULL,
    `payment_info` LONGTEXT NULL,
    `platform` ENUM('MYCALINKS', 'OCHANOKO', 'SHOPIFY') NOT NULL DEFAULT 'MYCALINKS',
    `customer_name_ruby` VARCHAR(191) NULL,
    `customer_phone` VARCHAR(191) NULL,
    `payment_method_display_name` VARCHAR(191) NULL,
    `external_ec_id` VARCHAR(191) NULL,

    UNIQUE INDEX `Ec_Order_code_key`(`code` ASC),
    INDEX `Ec_Order_myca_user_id_idx`(`myca_user_id` ASC),
    INDEX `Ec_Order_platform_external_ec_id_idx`(`platform` ASC, `external_ec_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ec_Order_Cart_Store` (
    `order_id` INTEGER UNSIGNED NOT NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `shipping_method_id` INTEGER UNSIGNED NULL,
    `shipping_tracking_code` VARCHAR(191) NULL,
    `shipping_fee` INTEGER NOT NULL DEFAULT 0,
    `total_price` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `read` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `shipping_company` ENUM('SAGAWA', 'KURONEKO', 'YUBIN') NULL,
    `status` ENUM('DRAFT', 'UNPAID', 'PREPARE_FOR_SHIPPING', 'WAIT_FOR_SHIPPING', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'DRAFT',
    `code` VARCHAR(30) NOT NULL,
    `shipping_company_display_name` VARCHAR(191) NULL,
    `shipping_method_display_name` VARCHAR(191) NULL,

    UNIQUE INDEX `Ec_Order_Cart_Store_code_key`(`code` ASC),
    INDEX `Ec_Order_Cart_Store_shipping_method_id_fkey`(`shipping_method_id` ASC),
    INDEX `Ec_Order_Cart_Store_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`order_id` ASC, `store_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ec_Order_Cart_Store_Contact` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER UNSIGNED NOT NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `myca_user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `myca_user_last_read_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `last_sent_at` TIMESTAMP(0) NULL,
    `status` ENUM('UNREAD', 'ADDRESSING', 'SOLVED') NOT NULL DEFAULT 'UNREAD',

    UNIQUE INDEX `Ec_Order_Cart_Store_Contact_order_id_store_id_key`(`order_id` ASC, `store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ec_Order_Cart_Store_Contact_Message` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `ec_order_contact_id` INTEGER UNSIGNED NOT NULL,
    `myca_user_id` INTEGER NULL,
    `staff_account_id` INTEGER UNSIGNED NULL,
    `content` TEXT NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Ec_Order_Cart_Store_Contact_Message_ec_order_contact_id_fkey`(`ec_order_contact_id` ASC),
    INDEX `Ec_Order_Cart_Store_Contact_Message_staff_account_id_fkey`(`staff_account_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ec_Order_Cart_Store_Product` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER UNSIGNED NOT NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `total_unit_price` INTEGER NOT NULL,
    `item_count` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `original_item_count` INTEGER NOT NULL,

    INDEX `Ec_Order_Cart_Store_Product_order_id_store_id_fkey`(`order_id` ASC, `store_id` ASC),
    INDEX `Ec_Order_Cart_Store_Product_product_id_fkey`(`product_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ec_Order_Payment` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER UNSIGNED NOT NULL,
    `store_id` INTEGER UNSIGNED NULL,
    `mode` ENUM('pay', 'refund') NOT NULL DEFAULT 'pay',
    `service` ENUM('GMO', 'ORIGINAL', 'OCHANOKO', 'SHOPIFY') NOT NULL,
    `method` VARCHAR(191) NULL,
    `source_event_json` LONGTEXT NULL,
    `source_id` VARCHAR(191) NULL,
    `total_amount` INTEGER NOT NULL,
    `card__card_brand` VARCHAR(191) NULL,
    `card__card_type` VARCHAR(191) NULL,
    `card__exp_month` INTEGER NULL,
    `card__exp_year` INTEGER NULL,
    `card__last_4` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `payment_info_json` LONGTEXT NULL,
    `status` ENUM('PAYING', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'PAYING',

    INDEX `Ec_Order_Payment_mode_service_status_source_id_order_id_idx`(`mode` ASC, `service` ASC, `status` ASC, `source_id` ASC, `order_id` ASC),
    INDEX `Ec_Order_Payment_order_id_store_id_fkey`(`order_id` ASC, `store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ec_Setting` (
    `store_id` INTEGER UNSIGNED NOT NULL,
    `auto_listing` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `auto_stocking` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `auto_sell_price_adjustment` INTEGER NOT NULL DEFAULT 100,
    `price_adjustment_round_rank` INTEGER NOT NULL DEFAULT 1,
    `price_adjustment_round_rule` ENUM('UP', 'DOWN', 'ROUND') NOT NULL DEFAULT 'UP',
    `reserved_stock_number` INTEGER NOT NULL DEFAULT 0,
    `enable_same_day_shipping` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `same_day_limit_hour` INTEGER NULL,
    `shipping_days` INTEGER NULL,
    `closed_day` VARCHAR(191) NOT NULL DEFAULT '土,日',
    `free_shipping_price` INTEGER NULL,
    `delayed_payment_method` VARCHAR(191) NOT NULL DEFAULT 'CONVENIENCE_STORE,BANK,CASH_ON_DELIVERY',
    `order_change_request_deadline_days_when_missing_item` INTEGER NULL,
    `ochanoko_account_id` VARCHAR(191) NULL,
    `ochanoko_api_token` TEXT NULL,
    `ochanoko_email` VARCHAR(191) NULL,
    `ochanoko_password` VARCHAR(191) NULL,

    UNIQUE INDEX `Ec_Setting_ochanoko_account_id_key`(`ochanoko_account_id` ASC),
    UNIQUE INDEX `Ec_Setting_ochanoko_email_key`(`ochanoko_email` ASC),
    UNIQUE INDEX `Ec_Setting_store_id_key`(`store_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fact_Daily_Product` (
    `store_id` INTEGER UNSIGNED NOT NULL,
    `target_day` DATE NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `product_display_name` VARCHAR(191) NOT NULL,
    `condition_option_id` INTEGER UNSIGNED NOT NULL,
    `condition_option_display_name` VARCHAR(191) NOT NULL,
    `stock_number` INTEGER NOT NULL,
    `actual_sell_price` INTEGER NOT NULL,
    `actual_buy_price` INTEGER NOT NULL,
    `total_wholesale_price` BIGINT NOT NULL,
    `total_sale_price` BIGINT NOT NULL,
    `average_wholesale_price` INTEGER NOT NULL,
    `minimum_wholesale_price` INTEGER NOT NULL,
    `maximum_wholesale_price` INTEGER NOT NULL,
    `item_id` INTEGER UNSIGNED NOT NULL,
    `myca_item_id` INTEGER NULL,
    `category_id` INTEGER UNSIGNED NOT NULL,
    `category_display_name` VARCHAR(191) NOT NULL,
    `genre_id` INTEGER UNSIGNED NULL,
    `genre_display_name` VARCHAR(191) NULL,
    `expansion` VARCHAR(191) NULL,
    `rarity` VARCHAR(191) NULL,
    `cardnumber` VARCHAR(191) NULL,

    INDEX `Fact_Daily_Product_actual_buy_price_idx`(`actual_buy_price` ASC),
    INDEX `Fact_Daily_Product_actual_sell_price_idx`(`actual_sell_price` ASC),
    INDEX `Fact_Daily_Product_category_display_name_idx`(`category_display_name` ASC),
    INDEX `Fact_Daily_Product_category_id_idx`(`category_id` ASC),
    INDEX `Fact_Daily_Product_condition_option_display_name_idx`(`condition_option_display_name` ASC),
    INDEX `Fact_Daily_Product_condition_option_id_idx`(`condition_option_id` ASC),
    INDEX `Fact_Daily_Product_genre_display_name_idx`(`genre_display_name` ASC),
    INDEX `Fact_Daily_Product_genre_id_idx`(`genre_id` ASC),
    INDEX `Fact_Daily_Product_stock_number_idx`(`stock_number` ASC),
    INDEX `Fact_Daily_Product_store_id_idx`(`store_id` ASC),
    PRIMARY KEY (`store_id` ASC, `target_day` ASC, `product_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fact_Transaction_Product` (
    `store_id` INTEGER UNSIGNED NOT NULL,
    `transaction_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `cart_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,
    `sale_id` INTEGER UNSIGNED NULL,
    `sale_display_name` VARCHAR(191) NULL,
    `sale_discount_price` INTEGER NULL,
    `original_unit_price` INTEGER NULL,
    `unit_price` INTEGER NOT NULL,
    `wholesale_total_price` INTEGER NULL,
    `discount_price` INTEGER NULL,
    `total_discount_price` INTEGER NULL,
    `total_unit_price` INTEGER NULL,
    `product_display_name` VARCHAR(191) NOT NULL,
    `condition_option_id` INTEGER UNSIGNED NOT NULL,
    `condition_option_display_name` VARCHAR(191) NOT NULL,
    `item_id` INTEGER UNSIGNED NOT NULL,
    `myca_item_id` INTEGER NULL,
    `category_id` INTEGER UNSIGNED NOT NULL,
    `category_display_name` VARCHAR(191) NOT NULL,
    `genre_id` INTEGER UNSIGNED NULL,
    `genre_display_name` VARCHAR(191) NULL,
    `expansion` VARCHAR(191) NULL,
    `rarity` VARCHAR(191) NULL,
    `cardnumber` VARCHAR(191) NULL,
    `transaction_kind` ENUM('SELL', 'BUY') NOT NULL,
    `tax_kind` VARCHAR(191) NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `transaction_created_at` TIMESTAMP(0) NOT NULL,
    `transaction_finished_at` TIMESTAMP(0) NOT NULL,
    `target_day` DATE NOT NULL,

    INDEX `Fact_Transaction_Product_category_display_name_idx`(`category_display_name` ASC),
    INDEX `Fact_Transaction_Product_category_id_idx`(`category_id` ASC),
    INDEX `Fact_Transaction_Product_condition_option_display_name_idx`(`condition_option_display_name` ASC),
    INDEX `Fact_Transaction_Product_condition_option_id_idx`(`condition_option_id` ASC),
    INDEX `Fact_Transaction_Product_genre_display_name_idx`(`genre_display_name` ASC),
    INDEX `Fact_Transaction_Product_genre_id_idx`(`genre_id` ASC),
    INDEX `Fact_Transaction_Product_store_id_idx`(`store_id` ASC),
    INDEX `Fact_Transaction_Product_transaction_id_product_id_idx`(`transaction_id` ASC, `product_id` ASC),
    INDEX `Fact_Transaction_Product_transaction_kind_idx`(`transaction_kind` ASC),
    PRIMARY KEY (`store_id` ASC, `target_day` ASC, `cart_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gmo_Credit_Card` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_id` VARCHAR(191) NOT NULL,
    `card_id` VARCHAR(191) NOT NULL,
    `masked_card_number` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `expire_month` VARCHAR(191) NOT NULL,
    `expire_year` VARCHAR(191) NOT NULL,
    `issue_code` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `is_primary` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `contract_id` INTEGER UNSIGNED NULL,
    `app_user_id` INTEGER NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Gmo_Credit_Card_app_user_id_fkey`(`app_user_id` ASC),
    INDEX `Gmo_Credit_Card_contract_id_fkey`(`contract_id` ASC),
    UNIQUE INDEX `Gmo_Credit_Card_customer_id_card_id_key`(`customer_id` ASC, `card_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `department_id` INTEGER UNSIGNED NULL,
    `total_item_count` INTEGER NULL,
    `total_item_sell_price` BIGINT NULL,
    `total_stock_number` INTEGER NULL,
    `total_stock_sell_price` BIGINT NULL,
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'FINISHED') NOT NULL DEFAULT 'DRAFT',
    `finished_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `item_category_id` INTEGER UNSIGNED NULL,
    `item_genre_id` INTEGER UNSIGNED NULL,
    `adjusted` TINYINT UNSIGNED NULL,
    `title` VARCHAR(100) NULL,

    INDEX `Inventory_department_id_fkey`(`department_id` ASC),
    INDEX `Inventory_item_category_id_fkey`(`item_category_id` ASC),
    INDEX `Inventory_item_genre_id_fkey`(`item_genre_id` ASC),
    INDEX `Inventory_staff_account_id_fkey`(`staff_account_id` ASC),
    INDEX `Inventory_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory_Category` (
    `inventory_id` INTEGER UNSIGNED NOT NULL,
    `item_category_id` INTEGER UNSIGNED NOT NULL,

    INDEX `Inventory_Category_item_category_id_fkey`(`item_category_id` ASC),
    PRIMARY KEY (`inventory_id` ASC, `item_category_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory_Genre` (
    `inventory_id` INTEGER UNSIGNED NOT NULL,
    `item_genre_id` INTEGER UNSIGNED NOT NULL,

    INDEX `Inventory_Genre_item_genre_id_fkey`(`item_genre_id` ASC),
    PRIMARY KEY (`inventory_id` ASC, `item_genre_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory_Products` (
    `inventory_id` INTEGER UNSIGNED NOT NULL,
    `shelf_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,
    `unit_price` INTEGER NULL,
    `current_stock_number` INTEGER NULL,
    `shelf_name` VARCHAR(191) NULL,
    `staff_account_id` INTEGER UNSIGNED NOT NULL,

    INDEX `Inventory_Products_product_id_fkey`(`product_id` ASC),
    INDEX `Inventory_Products_shelf_id_fkey`(`shelf_id` ASC),
    INDEX `Inventory_Products_staff_account_id_fkey`(`staff_account_id` ASC),
    PRIMARY KEY (`inventory_id` ASC, `staff_account_id` ASC, `shelf_id` ASC, `product_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory_Shelf` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `order_number` INTEGER NULL,

    INDEX `Inventory_Shelf_is_deleted_idx`(`is_deleted` ASC),
    INDEX `Inventory_Shelf_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `myca_item_id` INTEGER NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `department_id` INTEGER UNSIGNED NULL,
    `description` TEXT NULL,
    `display_name` VARCHAR(191) NULL,
    `display_name_ruby` VARCHAR(191) NULL,
    `image_url` TEXT NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `buy_price` INTEGER NOT NULL DEFAULT 0,
    `sell_price` INTEGER NOT NULL DEFAULT 0,
    `pack_name` VARCHAR(100) NULL,
    `rarity` VARCHAR(30) NULL,
    `cardnumber` VARCHAR(30) NULL,
    `expansion` VARCHAR(20) NULL,
    `keyword` VARCHAR(500) NULL,
    `jan_code` BIGINT NULL,
    `is_buy_only` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `order_number` INTEGER NOT NULL DEFAULT 0,
    `readonly_product_code` VARCHAR(191) NULL,
    `jan_code_as_product_code` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `products_stock_number` INTEGER NOT NULL DEFAULT 0,
    `myca_pack_id` INTEGER NULL,
    `init_stock_number` INTEGER NULL,
    `type` ENUM('NORMAL', 'ORIGINAL_PACK', 'BUNDLE') NOT NULL DEFAULT 'NORMAL',
    `expire_at` DATE NULL,
    `status` ENUM('DRAFT', 'PUBLISH', 'HIDDEN', 'DELETED') NOT NULL DEFAULT 'PUBLISH',
    `category_id` INTEGER UNSIGNED NOT NULL,
    `genre_id` INTEGER UNSIGNED NULL,
    `group_id` INTEGER UNSIGNED NULL,
    `card_type` VARCHAR(30) NULL,
    `cardseries` VARCHAR(100) NULL,
    `option1` VARCHAR(100) NULL,
    `option2` VARCHAR(100) NULL,
    `option3` VARCHAR(100) NULL,
    `option4` INTEGER NULL,
    `option5` VARCHAR(500) NULL,
    `option6` VARCHAR(200) NULL,
    `release_date` VARCHAR(191) NULL,
    `displaytype1` VARCHAR(20) NULL,
    `displaytype2` VARCHAR(20) NULL,
    `allow_auto_print_label` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `allow_round` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `hidden_products` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `infinite_stock` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `start_at` DATE NULL,
    `weight` INTEGER NOT NULL DEFAULT 0,
    `tablet_allowed` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `market_price` INTEGER NULL,
    `market_price_updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `previous_market_price` INTEGER NULL,
    `market_price_gap_rate` INTEGER NULL,
    `search_keyword` VARCHAR(500) NULL,

    INDEX `Item_card_type_idx`(`card_type` ASC),
    INDEX `Item_cardnumber_idx`(`cardnumber` ASC),
    INDEX `Item_cardseries_idx`(`cardseries` ASC),
    INDEX `Item_category_id_fkey`(`category_id` ASC),
    INDEX `Item_department_id_fkey`(`department_id` ASC),
    INDEX `Item_expansion_idx`(`expansion` ASC),
    INDEX `Item_genre_id_fkey`(`genre_id` ASC),
    INDEX `Item_group_id_fkey`(`group_id` ASC),
    INDEX `Item_market_price_idx`(`market_price` ASC),
    INDEX `Item_myca_item_id_fkey`(`myca_item_id` ASC),
    INDEX `Item_option1_idx`(`option1` ASC),
    INDEX `Item_option2_idx`(`option2` ASC),
    INDEX `Item_option3_idx`(`option3` ASC),
    INDEX `Item_option4_idx`(`option4` ASC),
    INDEX `Item_option5_idx`(`option5` ASC),
    INDEX `Item_option6_idx`(`option6` ASC),
    INDEX `Item_rarity_idx`(`rarity` ASC),
    INDEX `Item_status_category_id_genre_id_idx`(`status` ASC, `category_id` ASC, `genre_id` ASC),
    INDEX `Item_status_myca_item_id_idx`(`status` ASC, `myca_item_id` ASC),
    UNIQUE INDEX `Item_store_id_myca_item_id_key`(`store_id` ASC, `myca_item_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item_Calculate_History` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `kind` ENUM('BUNDLE') NOT NULL,
    `log_text` TEXT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item_Category` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `display_name` VARCHAR(191) NOT NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `handle` ENUM('CARD', 'BOX', 'ORIGINAL_PACK', 'LUCKY_BAG', 'DECK', 'BUNDLE', 'STORAGE', 'PURCHASE_GUARANTEE', 'OTHER') NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `hidden` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `Item_Category_deleted_hidden_idx`(`deleted` ASC, `hidden` ASC),
    UNIQUE INDEX `Item_Category_store_id_display_name_key`(`store_id` ASC, `display_name` ASC),
    UNIQUE INDEX `Item_Category_store_id_handle_key`(`store_id` ASC, `handle` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item_Category_Condition_Option` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `item_category_id` INTEGER UNSIGNED NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `handle` ENUM('O1_S', 'O2_A', 'O3_A_MINUS', 'O4_B', 'O5_C', 'O6_D', 'O1_BRAND_NEW', 'O2_LIKE_NEW', 'O3_USED') NULL,
    `description` VARCHAR(191) NULL,
    `deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `order_number` INTEGER NOT NULL DEFAULT 0,

    INDEX `Item_Category_Condition_Option_item_category_id_deleted_idx`(`item_category_id` ASC, `deleted` ASC),
    UNIQUE INDEX `Item_Category_Condition_Option_item_category_id_handle_key`(`item_category_id` ASC, `handle` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item_Genre` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `handle` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `auto_update` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `hidden` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Item_Genre_deleted_hidden_idx`(`deleted` ASC, `hidden` ASC),
    UNIQUE INDEX `Item_Genre_store_id_display_name_key`(`store_id` ASC, `display_name` ASC),
    UNIQUE INDEX `Item_Genre_store_id_handle_key`(`store_id` ASC, `handle` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item_Group` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `item_category_id` INTEGER UNSIGNED NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Item_Group_item_category_id_fkey`(`item_category_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Loss` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `datetime` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `reason` TEXT NULL,
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `loss_genre_id` INTEGER UNSIGNED NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `total_item_count` INTEGER NULL,
    `total_sell_price` INTEGER NULL,

    INDEX `Loss_loss_genre_id_fkey`(`loss_genre_id` ASC),
    INDEX `Loss_staff_account_id_fkey`(`staff_account_id` ASC),
    INDEX `Loss_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Loss_Genre` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `display_name` VARCHAR(191) NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `Loss_Genre_is_deleted_idx`(`is_deleted` ASC),
    INDEX `Loss_Genre_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Loss_Product` (
    `loss_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,
    `sell_price` INTEGER NULL,

    INDEX `Loss_Product_product_id_fkey`(`product_id` ASC),
    PRIMARY KEY (`loss_id` ASC, `product_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Memo` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Memo_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Myca_Item` (
    `myca_item_id` INTEGER NOT NULL,
    `market_price_updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `market_price` INTEGER NULL,
    `previous_market_price` INTEGER NULL,
    `market_price_gap_rate` INTEGER NULL,

    INDEX `Myca_Item_market_price_idx`(`market_price` ASC),
    INDEX `Myca_Item_market_price_updated_at_idx`(`market_price_updated_at` ASC),
    PRIMARY KEY (`myca_item_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Original_Pack_Product` (
    `item_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,
    `wholesale_price` INTEGER NULL,
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `process_id` VARCHAR(20) NOT NULL DEFAULT 'original',

    INDEX `Original_Pack_Product_product_id_fkey`(`product_id` ASC),
    INDEX `Original_Pack_Product_staff_account_id_fkey`(`staff_account_id` ASC),
    PRIMARY KEY (`item_id` ASC, `process_id` ASC, `staff_account_id` ASC, `product_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Outbox_Ec_Product_Stock_History` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,
    `source_kind` ENUM('mycalinks_ec_sell_return', 'auto_stocking', 'publish', 'recalculate', 'mycalinks_ec_sell', 'shopify_ec_sell', 'ochanoko_ec_sell') NOT NULL,
    `source_id` INTEGER UNSIGNED NULL,
    `result_stock_number` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `ochanoko_product_id` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Outbox_Product` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `actual_ec_sell_price` INTEGER NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `ochanoko_product_id` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pack_Open_History` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `from_product_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NULL,
    `item_count_per_pack` INTEGER NULL,
    `unregister_item_count` INTEGER NOT NULL DEFAULT 0,
    `wholesale_price` INTEGER NULL,
    `unregister_product_id` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `status` ENUM('DRAFT', 'FINISHED') NOT NULL DEFAULT 'FINISHED',
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `unregister_product_wholesale_price` INTEGER NULL,
    `margin_wholesale_price` INTEGER NULL,

    INDEX `Pack_Open_History_from_product_id_fkey`(`from_product_id` ASC),
    INDEX `Pack_Open_History_staff_account_id_fkey`(`staff_account_id` ASC),
    INDEX `Pack_Open_History_unregister_product_id_fkey`(`unregister_product_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pack_Open_Products` (
    `pack_open_history_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,
    `wholesale_price` INTEGER NULL,
    `staff_account_id` INTEGER UNSIGNED NOT NULL,

    INDEX `Pack_Open_Products_product_id_fkey`(`product_id` ASC),
    INDEX `Pack_Open_Products_staff_account_id_fkey`(`staff_account_id` ASC),
    PRIMARY KEY (`pack_open_history_id` ASC, `staff_account_id` ASC, `product_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `transaction_id` INTEGER UNSIGNED NOT NULL,
    `mode` ENUM('pay', 'refund') NULL,
    `service` ENUM('square', 'original') NULL,
    `method` VARCHAR(191) NULL,
    `source_event_json` LONGTEXT NULL,
    `source_id` VARCHAR(191) NULL,
    `total_amount` INTEGER NOT NULL,
    `card__card_brand` VARCHAR(191) NULL,
    `card__card_type` VARCHAR(191) NULL,
    `card__exp_month` INTEGER NULL,
    `card__exp_year` INTEGER NULL,
    `card__last_4` VARCHAR(191) NULL,
    `cash__recieved_price` INTEGER NULL,
    `cash__change_price` INTEGER NULL,
    `bank__info` TEXT NULL,
    `bank__checked` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `Payment_transaction_id_key`(`transaction_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER UNSIGNED NOT NULL,
    `retail_price` INTEGER NULL,
    `stock_number` INTEGER NOT NULL DEFAULT 0,
    `display_name` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `buy_price` INTEGER NULL,
    `sell_price` INTEGER NULL,
    `specific_buy_price` INTEGER NULL,
    `specific_sell_price` INTEGER NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `is_buy_only` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `readonly_product_code` VARCHAR(191) NULL,
    `arrow_auto_price_adjustment` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `allowed_point` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `condition_option_id` INTEGER UNSIGNED NULL,
    `actual_buy_price` INTEGER NULL,
    `actual_sell_price` INTEGER NULL,
    `buy_price_updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `sell_price_updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `force_no_price_label` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `is_special_price_product` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `specific_auto_sell_price_adjustment` VARCHAR(191) NULL,
    `ec_sell_price` INTEGER NULL,
    `specific_ec_sell_price` INTEGER NULL,
    `mycalinks_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `pos_reserved_stock_number` INTEGER NULL,
    `actual_ec_sell_price` INTEGER NULL,
    `ec_stock_number` INTEGER NOT NULL DEFAULT 0,
    `disable_ec_auto_stocking` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `tablet_allowed` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `average_wholesale_price` INTEGER NULL,
    `maximum_wholesale_price` INTEGER NULL,
    `minimum_wholesale_price` INTEGER NULL,
    `ec_pos_stock_gap` INTEGER NULL,
    `specific_ec_publishable_stock_number` INTEGER NULL,
    `ochanoko_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `shopify_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `ochanoko_product_id` INTEGER UNSIGNED NULL,
    `management_number` VARCHAR(40) NULL,
    `specialty_id` INTEGER UNSIGNED NULL,

    INDEX `Product_condition_option_id_fkey`(`condition_option_id` ASC),
    INDEX `Product_ec_pos_stock_gap_idx`(`ec_pos_stock_gap` ASC),
    INDEX `Product_item_id_deleted_mycalinks_ec_enabled_actual_ec_sell__idx`(`item_id` ASC, `deleted` ASC, `mycalinks_ec_enabled` ASC, `actual_ec_sell_price` ASC, `condition_option_id` ASC, `ec_stock_number` ASC),
    INDEX `Product_specialty_id_fkey`(`specialty_id` ASC),
    INDEX `Product_store_id_actual_sell_price_idx`(`store_id` ASC, `actual_sell_price` ASC),
    INDEX `Product_store_id_deleted_is_active_item_id_idx`(`store_id` ASC, `deleted` ASC, `is_active` ASC, `item_id` ASC),
    INDEX `Product_store_id_deleted_is_buy_only_idx`(`store_id` ASC, `deleted` ASC, `is_buy_only` ASC),
    INDEX `Product_store_id_deleted_item_id_idx`(`store_id` ASC, `deleted` ASC, `item_id` ASC),
    INDEX `Product_store_id_idx`(`store_id` ASC),
    UNIQUE INDEX `Product_store_id_management_number_key`(`store_id` ASC, `management_number` ASC),
    UNIQUE INDEX `Product_store_id_ochanoko_product_id_key`(`store_id` ASC, `ochanoko_product_id` ASC),
    INDEX `Product_store_id_readonly_product_code_idx`(`store_id` ASC, `readonly_product_code` ASC),
    INDEX `Product_store_id_specialty_id_idx`(`store_id` ASC, `specialty_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product_Ec_Stock_History` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `staff_account_id` INTEGER UNSIGNED NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `source_kind` ENUM('mycalinks_ec_sell_return', 'auto_stocking', 'publish', 'recalculate', 'mycalinks_ec_sell', 'shopify_ec_sell', 'ochanoko_ec_sell') NOT NULL,
    `source_id` INTEGER UNSIGNED NULL,
    `item_count` INTEGER NOT NULL,
    `unit_price` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `result_ec_stock_number` INTEGER NOT NULL,
    `datetime` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Product_Ec_Stock_History_product_id_source_kind_idx`(`product_id` ASC, `source_kind` ASC),
    INDEX `Product_Ec_Stock_History_staff_account_id_fkey`(`staff_account_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product_Price` (
    `product_id` INTEGER UNSIGNED NOT NULL,
    `kind` ENUM('buy', 'sell', 'ec') NOT NULL,
    `date` DATE NOT NULL DEFAULT (curdate()),
    `price` INTEGER NOT NULL,

    PRIMARY KEY (`product_id` ASC, `kind` ASC, `date` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product_Stock_History` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `source_kind` ENUM('product', 'transaction_sell', 'transaction_buy', 'transaction_sell_return', 'transaction_buy_return', 'stocking', 'loss', 'bundle', 'bundle_release', 'original_pack', 'original_pack_release', 'pack_opening', 'pack_opening_unregister', 'appraisal_create', 'appraisal_return', 'transfer', 'ec_sell', 'ec_sell_return') NOT NULL,
    `source_id` INTEGER UNSIGNED NULL,
    `item_count` INTEGER NOT NULL,
    `unit_price` INTEGER NOT NULL,
    `result_stock_number` INTEGER NULL,
    `datetime` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `description` VARCHAR(191) NULL,
    `staff_account_id` INTEGER UNSIGNED NULL,
    `type` ENUM('create', 'update', 'delete') NOT NULL DEFAULT 'update',

    INDEX `Product_Stock_History_product_id_source_kind_idx`(`product_id` ASC, `source_kind` ASC),
    INDEX `Product_Stock_History_staff_account_id_fkey`(`staff_account_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product_Wholesale_Price_History` (
    `product_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,
    `unit_price` INTEGER NOT NULL,
    `arrived_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `order_num` INTEGER NOT NULL DEFAULT 0,
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `resource_type` ENUM('PRODUCT', 'BUNDLE', 'ORIGINAL_PACK', 'TRANSACTION', 'EC_ORDER', 'LOSS', 'APPRAISAL', 'CHILD') NOT NULL DEFAULT 'PRODUCT',
    `resource_id` INTEGER UNSIGNED NOT NULL,
    `is_exact` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `parent_id` INTEGER UNSIGNED NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Product_Wholesale_Price_History_parent_id_idx`(`parent_id` ASC),
    INDEX `Product_Wholesale_Price_History_product_id_idx`(`product_id` ASC),
    INDEX `Product_Wholesale_Price_History_resource_type_idx`(`resource_type` ASC),
    INDEX `Product_Wholesale_Price_History_resource_type_resource_id_pr_idx`(`resource_type` ASC, `resource_id` ASC, `product_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Purchase_Table` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `format` ENUM('HORIZONTAL_8', 'HORIZONTAL_18', 'HORIZONTAL_36', 'VERTICAL_4', 'VERTICAL_9', 'VERTICAL_16', 'VERTICAL_25', 'SQUARE_2', 'SQUARE_6', 'MONITOR_3', 'MONITOR_12', 'ENHANCED_1', 'ENHANCED_2') NOT NULL,
    `order` ENUM('PRICE_DESC', 'PRICE_ASC', 'CUSTOM') NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `custom_template_image_url` VARCHAR(191) NULL,
    `comment` VARCHAR(150) NULL,
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `show_store_name` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `background_text_color` VARCHAR(191) NULL,
    `cardname_and_price_text_color` VARCHAR(191) NULL,

    INDEX `Purchase_Table_staff_account_id_fkey`(`staff_account_id` ASC),
    INDEX `Purchase_Table_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Purchase_Table_Generated_Image` (
    `purchase_table_id` INTEGER UNSIGNED NOT NULL,
    `order_number` INTEGER NOT NULL,
    `image_url` VARCHAR(300) NOT NULL,

    PRIMARY KEY (`purchase_table_id` ASC, `order_number` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Purchase_Table_Item` (
    `purchase_table_id` INTEGER UNSIGNED NOT NULL,
    `item_id` INTEGER UNSIGNED NOT NULL,
    `order_number` INTEGER NOT NULL,
    `display_price` INTEGER UNSIGNED NOT NULL,
    `any_model_number` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `Purchase_Table_Item_item_id_fkey`(`item_id` ASC),
    PRIMARY KEY (`purchase_table_id` ASC, `item_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Register` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `display_name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `total_cash_price` INTEGER NOT NULL DEFAULT 0,
    `square_device_id` VARCHAR(191) NULL,
    `square_device_code` VARCHAR(191) NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `cash_reset_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `cash_reset_price` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `cash_reset_timing` ENUM('AFTER_CLOSED', 'MANUAL') NOT NULL DEFAULT 'AFTER_CLOSED',
    `square_device_name` VARCHAR(191) NULL,
    `deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `square_device_code_expires_at` TIMESTAMP(0) NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'CLOSED',
    `buy_payment_method` VARCHAR(191) NOT NULL DEFAULT 'cash,bank',
    `cash_check_timing` ENUM('BEFORE_OPEN', 'BEFORE_CLOSE', 'BOTH', 'MANUAL') NOT NULL DEFAULT 'BEFORE_CLOSE',
    `sell_payment_method` VARCHAR(191) NOT NULL DEFAULT 'cash,bank,square,paypay,felica',
    `auto_print_receipt_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `is_primary` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `Register_deleted_idx`(`deleted` ASC),
    UNIQUE INDEX `Register_store_id_square_device_code_key`(`store_id` ASC, `square_device_code` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Register_Cash_History` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `staff_account_id` INTEGER UNSIGNED NULL,
    `source_kind` ENUM('transaction_buy', 'transaction_buy_return', 'transaction_sell', 'transaction_sell_return', 'import', 'export', 'adjust', 'sales') NOT NULL,
    `source_id` INTEGER UNSIGNED NULL,
    `change_price` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `result_cash_price` INTEGER NULL,
    `datetime` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `register_id` INTEGER UNSIGNED NOT NULL,
    `result_register_cash_price` INTEGER NULL,

    INDEX `Register_Cash_History_register_id_source_kind_datetime_idx`(`register_id` ASC, `source_kind` ASC, `datetime` ASC),
    INDEX `Register_Cash_History_staff_account_id_fkey`(`staff_account_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Register_Settlement` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `difference_price` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `actual_cash_price` INTEGER NOT NULL,
    `ideal_cash_price` INTEGER NOT NULL,
    `export_total` INTEGER NOT NULL,
    `import_total` INTEGER NOT NULL,
    `transaction_buy_return_total` INTEGER NOT NULL,
    `transaction_buy_total` INTEGER NOT NULL,
    `transaction_sell_return_total` INTEGER NOT NULL,
    `transaction_sell_total` INTEGER NOT NULL,
    `tomorrow_start_cash_price` INTEGER NOT NULL DEFAULT 0,
    `data_end_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `data_start_at` TIMESTAMP(0) NOT NULL,
    `register_id` INTEGER UNSIGNED NULL,
    `kind` ENUM('OPEN', 'MIDDLE', 'CLOSE') NOT NULL DEFAULT 'CLOSE',
    `store_id` INTEGER UNSIGNED NULL,
    `init_cash_price` INTEGER NOT NULL DEFAULT 0,

    INDEX `Register_Settlement_register_id_fkey`(`register_id` ASC),
    INDEX `Register_Settlement_staff_account_id_fkey`(`staff_account_id` ASC),
    INDEX `Register_Settlement_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Register_Settlement_Drawer` (
    `register_settlement_id` INTEGER UNSIGNED NOT NULL,
    `denomination` INTEGER NOT NULL,
    `item_count` INTEGER NOT NULL,

    PRIMARY KEY (`register_settlement_id` ASC, `denomination` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Register_Settlement_Sales` (
    `register_settlement_id` INTEGER UNSIGNED NOT NULL,
    `kind` ENUM('sell', 'buy', 'sell_return', 'buy_return') NOT NULL,
    `payment_method` ENUM('cash', 'bank', 'square', 'paypay', 'felica') NOT NULL,
    `total_price` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`register_settlement_id` ASC, `kind` ASC, `payment_method` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Register_Status_History` (
    `register_id` INTEGER UNSIGNED NOT NULL,
    `setting_value` ENUM('OPEN', 'CLOSED') NOT NULL,
    `run_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`register_id` ASC, `run_at` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reservation` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deposit_price` INTEGER NOT NULL,
    `description` VARCHAR(300) NULL,
    `end_at` DATE NOT NULL,
    `limit_count` INTEGER NOT NULL,
    `limit_count_per_user` INTEGER NOT NULL,
    `remaining_price` INTEGER NOT NULL,
    `start_at` DATE NOT NULL,
    `status` ENUM('NOT_STARTED', 'OPEN', 'CLOSED', 'FINISHED') NOT NULL DEFAULT 'NOT_STARTED',

    INDEX `Reservation_product_id_fkey`(`product_id` ASC),
    INDEX `Reservation_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reservation_Reception` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER UNSIGNED NOT NULL,
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Reservation_Reception_customer_id_fkey`(`customer_id` ASC),
    INDEX `Reservation_Reception_staff_account_id_fkey`(`staff_account_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reservation_Reception_Product` (
    `reservation_reception_id` INTEGER UNSIGNED NOT NULL,
    `reservation_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,
    `deposit_transaction_id` INTEGER UNSIGNED NULL,
    `received_transaction_id` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `status` ENUM('CREATED', 'DEPOSITED', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'CREATED',
    `customer_id` INTEGER UNSIGNED NOT NULL,

    INDEX `Reservation_Reception_Product_customer_id_fkey`(`customer_id` ASC),
    UNIQUE INDEX `Reservation_Reception_Product_deposit_transaction_id_reserva_key`(`deposit_transaction_id` ASC, `reservation_id` ASC),
    UNIQUE INDEX `Reservation_Reception_Product_received_transaction_id_reserv_key`(`received_transaction_id` ASC, `reservation_id` ASC),
    INDEX `Reservation_Reception_Product_reservation_id_fkey`(`reservation_id` ASC),
    UNIQUE INDEX `Reservation_Reception_Product_reservation_reception_id_reser_key`(`reservation_reception_id` ASC, `reservation_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sale` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `start_datetime` TIMESTAMP(0) NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `discount_amount` VARCHAR(191) NULL,
    `end__datetime` TIMESTAMP(0) NULL,
    `end__total_item_count` INTEGER NULL,
    `end__unit_item_count` INTEGER NULL,
    `on_pause` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `repeat_cron_rule` VARCHAR(191) NULL,
    `status` ENUM('NOT_HELD', 'ON_HELD', 'FINISHED') NOT NULL DEFAULT 'NOT_HELD',
    `transaction_kind` ENUM('sell', 'buy') NOT NULL DEFAULT 'sell',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `sale_end_datetime` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Sale_status_idx`(`status` ASC),
    INDEX `Sale_store_id_status_transaction_kind_idx`(`store_id` ASC, `status` ASC, `transaction_kind` ASC),
    INDEX `Sale_transaction_kind_idx`(`transaction_kind` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sale_Calculate_History` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` ENUM('OK', 'ERROR') NOT NULL DEFAULT 'OK',
    `log_text` TEXT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sale_Department` (
    `sale_id` INTEGER UNSIGNED NOT NULL,
    `department_id` INTEGER UNSIGNED NULL,
    `rule` ENUM('include', 'exclude') NOT NULL,
    `item_category_id` INTEGER UNSIGNED NULL,
    `item_genre_id` INTEGER UNSIGNED NULL,
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,

    INDEX `Sale_Department_department_id_fkey`(`department_id` ASC),
    INDEX `Sale_Department_item_category_id_fkey`(`item_category_id` ASC),
    INDEX `Sale_Department_item_genre_id_fkey`(`item_genre_id` ASC),
    UNIQUE INDEX `Sale_Department_sale_id_item_genre_id_item_category_id_key`(`sale_id` ASC, `item_genre_id` ASC, `item_category_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sale_Product` (
    `sale_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `rule` ENUM('include', 'exclude') NOT NULL,

    INDEX `Sale_Product_product_id_fkey`(`product_id` ASC),
    PRIMARY KEY (`sale_id` ASC, `product_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sale_Product_History` (
    `sale_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `total_item_count` INTEGER NOT NULL,
    `total_price` INTEGER NULL,

    INDEX `Sale_Product_History_product_id_fkey`(`product_id` ASC),
    PRIMARY KEY (`sale_id` ASC, `product_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Set_Deal` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `store_id` INTEGER UNSIGNED NOT NULL,
    `discount_amount` VARCHAR(191) NOT NULL,
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `expire_at` DATE NULL,
    `start_at` DATE NULL,
    `status` ENUM('DRAFT', 'PUBLISH', 'DELETED') NOT NULL DEFAULT 'DRAFT',
    `image_url` VARCHAR(191) NULL,

    INDEX `Set_Deal_staff_account_id_fkey`(`staff_account_id` ASC),
    INDEX `Set_Deal_status_store_id_idx`(`status` ASC, `store_id` ASC),
    INDEX `Set_Deal_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Set_Deal_Product` (
    `set_deal_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,

    INDEX `Set_Deal_Product_product_id_fkey`(`product_id` ASC),
    PRIMARY KEY (`set_deal_id` ASC, `product_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shipping_Method` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `enabled_tracking` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `is_all_in_one_fee` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `description` VARCHAR(191) NULL,
    `enabled_cash_on_delivery` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `Shipping_Method_deleted_idx`(`deleted` ASC),
    INDEX `Shipping_Method_store_id_fkey`(`store_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shipping_Region` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipping_id` INTEGER UNSIGNED NOT NULL,
    `shipping_weight_id` INTEGER UNSIGNED NULL,
    `region_handle` VARCHAR(191) NOT NULL,
    `fee` INTEGER UNSIGNED NOT NULL,

    INDEX `Shipping_Region_region_handle_idx`(`region_handle` ASC),
    UNIQUE INDEX `Shipping_Region_shipping_id_shipping_weight_id_region_handle_key`(`shipping_id` ASC, `shipping_weight_id` ASC, `region_handle` ASC),
    INDEX `Shipping_Region_shipping_weight_id_fkey`(`shipping_weight_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shipping_Weight` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipping_id` INTEGER UNSIGNED NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `weight_gte` INTEGER NOT NULL,
    `weight_lte` INTEGER NOT NULL,

    INDEX `Shipping_Weight_shipping_id_fkey`(`shipping_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Specialty` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `handle` VARCHAR(191) NULL,
    `kind` ENUM('NORMAL', 'APPRAISAL') NOT NULL DEFAULT 'NORMAL',
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Specialty_store_id_display_name_key`(`store_id` ASC, `display_name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stocking` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `supplier_id` INTEGER UNSIGNED NOT NULL,
    `staff_account_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `store_id` INTEGER UNSIGNED NOT NULL,
    `actual_date` DATE NULL,
    `expected_sales` INTEGER NULL,
    `planned_date` DATE NOT NULL,
    `status` ENUM('NOT_YET', 'FINISHED', 'CANCELED') NOT NULL DEFAULT 'NOT_YET',
    `total_wholesale_price` INTEGER NULL,
    `total_item_count` INTEGER NULL,

    INDEX `Stocking_staff_account_id_fkey`(`staff_account_id` ASC),
    INDEX `Stocking_store_id_status_idx`(`store_id` ASC, `status` ASC),
    INDEX `Stocking_supplier_id_fkey`(`supplier_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stocking_Product` (
    `stocking_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `actual_item_count` INTEGER NULL,
    `planned_item_count` INTEGER NOT NULL,
    `unit_price` INTEGER NULL,
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `unit_price_without_tax` INTEGER NULL,

    INDEX `Stocking_Product_product_id_fkey`(`product_id` ASC),
    INDEX `Stocking_Product_stocking_id_fkey`(`stocking_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Store` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `display_name` VARCHAR(191) NULL,
    `opened` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `total_cash_price` INTEGER NOT NULL DEFAULT 0,
    `full_address` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `receipt_logo_url` VARCHAR(191) NULL,
    `zip_code` VARCHAR(191) NULL,
    `qr_iv` VARCHAR(191) NOT NULL,
    `square_location_id` VARCHAR(191) NULL,
    `invoice_number` VARCHAR(191) NULL,
    `buy_term` TEXT NULL,
    `status_message` VARCHAR(191) NULL,
    `status_message_updated_at` TIMESTAMP(0) NULL,
    `auto_print_receipt` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `return_wholesale_price_order_column` ENUM('unit_price', 'arrived_at') NOT NULL DEFAULT 'unit_price',
    `return_wholesale_price_order_rule` ENUM('desc', 'asc') NOT NULL DEFAULT 'asc',
    `use_wholesale_price_order_column` ENUM('unit_price', 'arrived_at') NOT NULL DEFAULT 'unit_price',
    `use_wholesale_price_order_rule` ENUM('desc', 'asc') NOT NULL DEFAULT 'desc',
    `wholesale_price_keep_rule` ENUM('individual', 'average') NOT NULL DEFAULT 'individual',
    `product_name_meta_order` VARCHAR(191) NOT NULL DEFAULT 'expansion,cardnumber,rarity',
    `buy_point_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `buy_point_limit_amount` INTEGER NOT NULL DEFAULT 10,
    `buy_point_limit_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `buy_point_limit_per` ENUM('transaction', 'visit') NOT NULL DEFAULT 'transaction',
    `buy_point_per` INTEGER NOT NULL DEFAULT 100,
    `point_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `point_expire_day` INTEGER NOT NULL DEFAULT 10,
    `point_expire_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `point_rate` INTEGER NOT NULL DEFAULT 10,
    `point_spend_limit_amount` INTEGER NOT NULL DEFAULT 10,
    `point_spend_limit_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `point_spend_limit_per` ENUM('transaction', 'visit') NOT NULL DEFAULT 'transaction',
    `sell_point_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `sell_point_limit_amount` INTEGER NOT NULL DEFAULT 10,
    `sell_point_limit_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `sell_point_limit_per` ENUM('transaction', 'visit') NOT NULL DEFAULT 'transaction',
    `sell_point_per` INTEGER NOT NULL DEFAULT 100,
    `visit_point_amount` INTEGER NOT NULL DEFAULT 10,
    `visit_point_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `visit_point_per` ENUM('transaction', 'visit') NOT NULL DEFAULT 'transaction',
    `allow_duty_free` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `include_tax` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `tax_rate` FLOAT NOT NULL DEFAULT 0.1,
    `payment_service` ENUM('square', 'original') NOT NULL DEFAULT 'original',
    `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `code` VARCHAR(32) NOT NULL,
    `price_adjustment_round_rank` INTEGER NOT NULL DEFAULT 1,
    `price_adjustment_round_rule` ENUM('UP', 'DOWN', 'ROUND') NOT NULL DEFAULT 'UP',
    `tax_mode` ENUM('INCLUDE', 'EXCLUDE') NOT NULL DEFAULT 'INCLUDE',
    `leader_name` VARCHAR(191) NULL,
    `register_cash_check_timing` ENUM('BEFORE_OPEN', 'BEFORE_CLOSE', 'BOTH', 'MANUAL') NOT NULL DEFAULT 'BEFORE_CLOSE',
    `register_cash_manage_by_separately` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `register_cash_reset_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `mycalinks_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `mycalinks_ec_terms_accepted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `hide_no_sell_price_product_on_tablet` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `hide_no_stock_product_on_tablet` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `hide_non_mycalinks_item_on_tablet` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `allow_print_no_price_label` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `sell_point_payment_method` VARCHAR(191) NOT NULL DEFAULT 'cash,square,paypay,felica,bank',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `buy_point_payment_method` VARCHAR(191) NOT NULL DEFAULT 'cash,bank',
    `staff_barcode_timeout_minutes` INTEGER NOT NULL DEFAULT 60,
    `ochanoko_ec_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `Store_code_key`(`code` ASC),
    INDEX `Store_mycalinks_ec_enabled_idx`(`mycalinks_ec_enabled` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Store_History` (
    `store_id` INTEGER UNSIGNED NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `setting_value` TEXT NULL,
    `run_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`store_id` ASC, `kind` ASC, `run_at` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Summary_Daily_Product` (
    `target_day` DATE NOT NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `total_wholesale_price` BIGINT NOT NULL,
    `total_sell_price` BIGINT NOT NULL,
    `total_stock_number` INTEGER NOT NULL,

    INDEX `Summary_Daily_Product_store_id_idx`(`store_id` ASC),
    PRIMARY KEY (`store_id` ASC, `target_day` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Summary_Daily_Transaction` (
    `store_id` INTEGER UNSIGNED NOT NULL,
    `kind` ENUM('SELL', 'BUY') NOT NULL,
    `target_day` DATE NOT NULL,
    `price` INTEGER NOT NULL,
    `count` INTEGER NOT NULL,
    `return_price` INTEGER NOT NULL,
    `return_count` INTEGER NOT NULL,
    `item_count` INTEGER NOT NULL,
    `given_point` INTEGER NOT NULL,
    `used_point` INTEGER NOT NULL,
    `sale_discount_price` INTEGER NOT NULL,
    `discount_price` INTEGER NOT NULL,
    `product_discount_price` INTEGER NOT NULL,
    `product_total_discount_price` INTEGER NOT NULL,
    `set_deal_discount_price` INTEGER NOT NULL,
    `total_discount_price` INTEGER NOT NULL,
    `wholesale_price` INTEGER NOT NULL,
    `buy_assessed_price` INTEGER NOT NULL,

    INDEX `Summary_Daily_Transaction_store_id_idx`(`store_id` ASC),
    PRIMARY KEY (`store_id` ASC, `target_day` ASC, `kind` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `fax_number` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `address2` VARCHAR(191) NULL,
    `building` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `order_number` INTEGER NULL,
    `prefecture` VARCHAR(191) NULL,
    `staff_name` VARCHAR(191) NULL,
    `zip_code` VARCHAR(191) NULL,
    `order_method` VARCHAR(191) NULL,
    `deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `Supplier_deleted_idx`(`deleted` ASC),
    UNIQUE INDEX `Supplier_store_id_display_name_key`(`store_id` ASC, `display_name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `System_Log` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `domain` ENUM('TRANSACTION') NOT NULL,
    `resource_id` INTEGER UNSIGNED NULL,
    `resource_kind` ENUM('TRANSACTION') NULL,
    `title` VARCHAR(191) NULL,
    `log_text` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `System_Log_resource_id_resource_kind_idx`(`resource_id` ASC, `resource_kind` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tablet_Allowed_Genre_Category` (
    `store_id` INTEGER UNSIGNED NOT NULL,
    `item_category_id` INTEGER UNSIGNED NOT NULL,
    `item_genre_id` INTEGER UNSIGNED NOT NULL,
    `condition_option_id` INTEGER UNSIGNED NULL,
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,

    INDEX `Tablet_Allowed_Genre_Category_condition_option_id_fkey`(`condition_option_id` ASC),
    INDEX `Tablet_Allowed_Genre_Category_item_category_id_fkey`(`item_category_id` ASC),
    INDEX `Tablet_Allowed_Genre_Category_item_genre_id_fkey`(`item_genre_id` ASC),
    UNIQUE INDEX `Tablet_Allowed_Genre_Category_store_id_item_category_id_item_key`(`store_id` ASC, `item_category_id` ASC, `item_genre_id` ASC, `condition_option_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `process_id` VARCHAR(191) NOT NULL,
    `target_worker` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `status` ENUM('QUEUED', 'PROCESSING', 'FINISHED', 'ERRORED') NOT NULL DEFAULT 'QUEUED',
    `process_description` VARCHAR(191) NULL,
    `status_description` VARCHAR(191) NULL,
    `requested_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `started_at` TIMESTAMP(0) NULL,
    `finished_at` TIMESTAMP(0) NULL,
    `total_queued_task_count` INTEGER NOT NULL,
    `total_processed_task_count` INTEGER NOT NULL,
    `corporation_id` INTEGER UNSIGNED NULL,
    `store_id` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `errored_at` TIMESTAMP(0) NULL,
    `md5` VARCHAR(191) NULL,

    INDEX `Task_corporation_id_fkey`(`corporation_id` ASC),
    INDEX `Task_store_id_fkey`(`store_id` ASC),
    INDEX `Task_target_worker_kind_idx`(`target_worker` ASC, `kind` ASC),
    PRIMARY KEY (`process_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task_Item` (
    `process_id` VARCHAR(191) NOT NULL,
    `chunk_id` INTEGER NOT NULL,
    `task_item_id` INTEGER NOT NULL,
    `status` ENUM('ERRORED', 'FINISHED') NOT NULL DEFAULT 'FINISHED',
    `status_description` VARCHAR(191) NULL,
    `process_time` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Task_Item_process_id_chunk_id_status_idx`(`process_id` ASC, `chunk_id` ASC, `status` ASC),
    PRIMARY KEY (`process_id` ASC, `task_item_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `staff_account_id` INTEGER UNSIGNED NULL,
    `store_id` INTEGER UNSIGNED NOT NULL,
    `customer_id` INTEGER UNSIGNED NULL,
    `transaction_kind` ENUM('sell', 'buy') NOT NULL,
    `total_price` INTEGER NOT NULL,
    `subtotal_price` INTEGER NULL,
    `tax` INTEGER NULL,
    `discount_price` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` ENUM('canceled', 'completed', 'paying', 'draft') NULL,
    `payment_method` ENUM('cash', 'bank', 'square', 'paypay', 'felica') NULL,
    `point_amount` INTEGER NULL,
    `total_point_amount` INTEGER NULL,
    `description` VARCHAR(191) NULL,
    `id_kind` VARCHAR(191) NULL,
    `id_number` VARCHAR(191) NULL,
    `parental_consent_image_url` VARCHAR(191) NULL,
    `reception_number` INTEGER NULL,
    `buy__is_assessed` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `signature_image_url` VARCHAR(191) NULL,
    `finished_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `terminal_checkout_id` VARCHAR(191) NULL,
    `term_accepted_at` DATETIME(3) NULL,
    `wholesale_total_price` INTEGER NULL,
    `total_discount_price` INTEGER NULL,
    `point_discount_price` INTEGER NOT NULL DEFAULT 0,
    `register_id` INTEGER UNSIGNED NULL,
    `parental_contact` VARCHAR(191) NULL,
    `tax_kind` ENUM('INCLUDE_TAX', 'EXCLUDE_TAX', 'DUTY_FREE') NULL,
    `can_create_signature` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `input_staff_account_id` INTEGER UNSIGNED NULL,
    `reception_staff_account_id` INTEGER UNSIGNED NULL,
    `buy__assessed_total_price` INTEGER NULL,
    `is_return` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `set_deal_discount_price` INTEGER NOT NULL DEFAULT 0,
    `total_reservation_price` INTEGER NOT NULL DEFAULT 0,
    `total_sale_price` INTEGER NULL,
    `hidden` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `original_transaction_id` INTEGER UNSIGNED NULL,

    INDEX `Transaction_customer_id_store_id_status_idx`(`customer_id` ASC, `store_id` ASC, `status` ASC),
    INDEX `Transaction_finished_at_idx`(`finished_at` ASC),
    INDEX `Transaction_input_staff_account_id_fkey`(`input_staff_account_id` ASC),
    INDEX `Transaction_is_return_store_id_transaction_kind_status_idx`(`is_return` ASC, `store_id` ASC, `transaction_kind` ASC, `status` ASC),
    INDEX `Transaction_original_transaction_id_fkey`(`original_transaction_id` ASC),
    INDEX `Transaction_payment_method_idx`(`payment_method` ASC),
    INDEX `Transaction_reception_number_idx`(`reception_number` ASC),
    INDEX `Transaction_reception_staff_account_id_fkey`(`reception_staff_account_id` ASC),
    INDEX `Transaction_register_id_store_id_status_idx`(`register_id` ASC, `store_id` ASC, `status` ASC),
    INDEX `Transaction_staff_account_id_fkey`(`staff_account_id` ASC),
    INDEX `Transaction_status_idx`(`status` ASC),
    INDEX `Transaction_store_id_fkey`(`store_id` ASC),
    INDEX `Transaction_transaction_kind_idx`(`transaction_kind` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction_Cart` (
    `transaction_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `item_count` INTEGER NOT NULL,
    `unit_price` INTEGER NOT NULL,
    `discount_price` INTEGER NOT NULL DEFAULT 0,
    `sale_discount_price` INTEGER NOT NULL DEFAULT 0,
    `sale_id` INTEGER UNSIGNED NULL,
    `total_discount_price` INTEGER NULL,
    `total_unit_price` INTEGER NULL,
    `original_unit_price` INTEGER NULL,
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_number` INTEGER NULL,
    `wholesale_total_price` INTEGER NOT NULL DEFAULT 0,
    `original_item_count` INTEGER NULL,
    `reservation_price` INTEGER NOT NULL DEFAULT 0,
    `total_sale_unit_price` INTEGER NULL,

    INDEX `Transaction_Cart_product_id_fkey`(`product_id` ASC),
    INDEX `Transaction_Cart_sale_id_fkey`(`sale_id` ASC),
    INDEX `Transaction_Cart_transaction_id_product_id_idx`(`transaction_id` ASC, `product_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction_Customer_Cart` (
    `transaction_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `unit_price` INTEGER NOT NULL,
    `item_count` INTEGER NOT NULL,
    `discount_price` INTEGER NULL,
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `original_item_count` INTEGER NULL,

    INDEX `Transaction_Customer_Cart_product_id_idx`(`product_id` ASC),
    INDEX `Transaction_Customer_Cart_transaction_id_idx`(`transaction_id` ASC),
    INDEX `Transaction_Customer_Cart_transaction_id_product_id_idx`(`transaction_id` ASC, `product_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction_Set_Deal` (
    `transaction_id` INTEGER UNSIGNED NOT NULL,
    `set_deal_id` INTEGER UNSIGNED NOT NULL,
    `apply_count` INTEGER NOT NULL,
    `total_discount_price` INTEGER NOT NULL,

    INDEX `Transaction_Set_Deal_set_deal_id_fkey`(`set_deal_id` ASC),
    PRIMARY KEY (`transaction_id` ASC, `set_deal_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Account_Group`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_linked_corporation_id_fkey` FOREIGN KEY (`linked_corporation_id`) REFERENCES `Corporation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account_Group` ADD CONSTRAINT `Account_Group_corporation_id_fkey` FOREIGN KEY (`corporation_id`) REFERENCES `Corporation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account_Store` ADD CONSTRAINT `Account_Store_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account_Store` ADD CONSTRAINT `Account_Store_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `App_Advertisement` ADD CONSTRAINT `App_Advertisement_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `App_Advertisement` ADD CONSTRAINT `App_Advertisement_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `App_Advertisement_Image` ADD CONSTRAINT `App_Advertisement_Image_advertisement_id_fkey` FOREIGN KEY (`advertisement_id`) REFERENCES `App_Advertisement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appraisal` ADD CONSTRAINT `Appraisal_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appraisal` ADD CONSTRAINT `Appraisal_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appraisal_Product` ADD CONSTRAINT `Appraisal_Product_appraisal_id_fkey` FOREIGN KEY (`appraisal_id`) REFERENCES `Appraisal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appraisal_Product` ADD CONSTRAINT `Appraisal_Product_condition_option_id_fkey` FOREIGN KEY (`condition_option_id`) REFERENCES `Item_Category_Condition_Option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appraisal_Product` ADD CONSTRAINT `Appraisal_Product_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appraisal_Product` ADD CONSTRAINT `Appraisal_Product_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `Specialty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appraisal_Product` ADD CONSTRAINT `Appraisal_Product_to_product_id_fkey` FOREIGN KEY (`to_product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bundle_Item_Product` ADD CONSTRAINT `Bundle_Item_Product_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bundle_Item_Product` ADD CONSTRAINT `Bundle_Item_Product_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Condition_Option_Rate` ADD CONSTRAINT `Condition_Option_Rate_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `Item_Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Condition_Option_Rate` ADD CONSTRAINT `Condition_Option_Rate_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Item_Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Condition_Option_Rate` ADD CONSTRAINT `Condition_Option_Rate_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `Item_Category_Condition_Option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract` ADD CONSTRAINT `Contract_corporation_id_fkey` FOREIGN KEY (`corporation_id`) REFERENCES `Corporation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract_Payment` ADD CONSTRAINT `Contract_Payment_card_id_fkey` FOREIGN KEY (`card_id`) REFERENCES `Gmo_Credit_Card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract_Payment` ADD CONSTRAINT `Contract_Payment_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `Contract`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer_Point_History` ADD CONSTRAINT `Customer_Point_History_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer_Point_History` ADD CONSTRAINT `Customer_Point_History_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_parent_department_id_fkey` FOREIGN KEY (`parent_department_id`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ec_Order_Cart_Store` ADD CONSTRAINT `Ec_Order_Cart_Store_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Ec_Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ec_Order_Cart_Store` ADD CONSTRAINT `Ec_Order_Cart_Store_shipping_method_id_fkey` FOREIGN KEY (`shipping_method_id`) REFERENCES `Shipping_Method`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ec_Order_Cart_Store` ADD CONSTRAINT `Ec_Order_Cart_Store_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ec_Order_Cart_Store_Contact` ADD CONSTRAINT `Ec_Order_Cart_Store_Contact_order_id_store_id_fkey` FOREIGN KEY (`order_id`, `store_id`) REFERENCES `Ec_Order_Cart_Store`(`order_id`, `store_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ec_Order_Cart_Store_Contact_Message` ADD CONSTRAINT `Ec_Order_Cart_Store_Contact_Message_ec_order_contact_id_fkey` FOREIGN KEY (`ec_order_contact_id`) REFERENCES `Ec_Order_Cart_Store_Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ec_Order_Cart_Store_Contact_Message` ADD CONSTRAINT `Ec_Order_Cart_Store_Contact_Message_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ec_Order_Cart_Store_Product` ADD CONSTRAINT `Ec_Order_Cart_Store_Product_order_id_store_id_fkey` FOREIGN KEY (`order_id`, `store_id`) REFERENCES `Ec_Order_Cart_Store`(`order_id`, `store_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ec_Order_Cart_Store_Product` ADD CONSTRAINT `Ec_Order_Cart_Store_Product_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ec_Order_Payment` ADD CONSTRAINT `Ec_Order_Payment_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Ec_Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ec_Order_Payment` ADD CONSTRAINT `Ec_Order_Payment_order_id_store_id_fkey` FOREIGN KEY (`order_id`, `store_id`) REFERENCES `Ec_Order_Cart_Store`(`order_id`, `store_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ec_Setting` ADD CONSTRAINT `Ec_Setting_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gmo_Credit_Card` ADD CONSTRAINT `Gmo_Credit_Card_app_user_id_fkey` FOREIGN KEY (`app_user_id`) REFERENCES `App_User`(`app_user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gmo_Credit_Card` ADD CONSTRAINT `Gmo_Credit_Card_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `Contract`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `Item_Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_item_genre_id_fkey` FOREIGN KEY (`item_genre_id`) REFERENCES `Item_Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory_Category` ADD CONSTRAINT `Inventory_Category_inventory_id_fkey` FOREIGN KEY (`inventory_id`) REFERENCES `Inventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory_Category` ADD CONSTRAINT `Inventory_Category_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `Item_Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory_Genre` ADD CONSTRAINT `Inventory_Genre_inventory_id_fkey` FOREIGN KEY (`inventory_id`) REFERENCES `Inventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory_Genre` ADD CONSTRAINT `Inventory_Genre_item_genre_id_fkey` FOREIGN KEY (`item_genre_id`) REFERENCES `Item_Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory_Products` ADD CONSTRAINT `Inventory_Products_inventory_id_fkey` FOREIGN KEY (`inventory_id`) REFERENCES `Inventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory_Products` ADD CONSTRAINT `Inventory_Products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory_Products` ADD CONSTRAINT `Inventory_Products_shelf_id_fkey` FOREIGN KEY (`shelf_id`) REFERENCES `Inventory_Shelf`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory_Products` ADD CONSTRAINT `Inventory_Products_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory_Shelf` ADD CONSTRAINT `Inventory_Shelf_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Item_Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `Item_Genre`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Item_Group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_myca_item_id_fkey` FOREIGN KEY (`myca_item_id`) REFERENCES `Myca_Item`(`myca_item_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Category` ADD CONSTRAINT `Item_Category_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Category_Condition_Option` ADD CONSTRAINT `Item_Category_Condition_Option_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `Item_Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Genre` ADD CONSTRAINT `Item_Genre_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_Group` ADD CONSTRAINT `Item_Group_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `Item_Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Loss` ADD CONSTRAINT `Loss_loss_genre_id_fkey` FOREIGN KEY (`loss_genre_id`) REFERENCES `Loss_Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Loss` ADD CONSTRAINT `Loss_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Loss` ADD CONSTRAINT `Loss_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Loss_Genre` ADD CONSTRAINT `Loss_Genre_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Loss_Product` ADD CONSTRAINT `Loss_Product_loss_id_fkey` FOREIGN KEY (`loss_id`) REFERENCES `Loss`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Loss_Product` ADD CONSTRAINT `Loss_Product_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Memo` ADD CONSTRAINT `Memo_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Original_Pack_Product` ADD CONSTRAINT `Original_Pack_Product_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Original_Pack_Product` ADD CONSTRAINT `Original_Pack_Product_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Original_Pack_Product` ADD CONSTRAINT `Original_Pack_Product_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pack_Open_History` ADD CONSTRAINT `Pack_Open_History_from_product_id_fkey` FOREIGN KEY (`from_product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pack_Open_History` ADD CONSTRAINT `Pack_Open_History_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pack_Open_History` ADD CONSTRAINT `Pack_Open_History_unregister_product_id_fkey` FOREIGN KEY (`unregister_product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pack_Open_Products` ADD CONSTRAINT `Pack_Open_Products_pack_open_history_id_fkey` FOREIGN KEY (`pack_open_history_id`) REFERENCES `Pack_Open_History`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pack_Open_Products` ADD CONSTRAINT `Pack_Open_Products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pack_Open_Products` ADD CONSTRAINT `Pack_Open_Products_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_condition_option_id_fkey` FOREIGN KEY (`condition_option_id`) REFERENCES `Item_Category_Condition_Option`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `Specialty`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Ec_Stock_History` ADD CONSTRAINT `Product_Ec_Stock_History_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Ec_Stock_History` ADD CONSTRAINT `Product_Ec_Stock_History_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Price` ADD CONSTRAINT `Product_Price_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Stock_History` ADD CONSTRAINT `Product_Stock_History_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Stock_History` ADD CONSTRAINT `Product_Stock_History_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Wholesale_Price_History` ADD CONSTRAINT `Product_Wholesale_Price_History_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Product_Wholesale_Price_History`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Wholesale_Price_History` ADD CONSTRAINT `Product_Wholesale_Price_History_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase_Table` ADD CONSTRAINT `Purchase_Table_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase_Table` ADD CONSTRAINT `Purchase_Table_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase_Table_Generated_Image` ADD CONSTRAINT `Purchase_Table_Generated_Image_purchase_table_id_fkey` FOREIGN KEY (`purchase_table_id`) REFERENCES `Purchase_Table`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase_Table_Item` ADD CONSTRAINT `Purchase_Table_Item_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase_Table_Item` ADD CONSTRAINT `Purchase_Table_Item_purchase_table_id_fkey` FOREIGN KEY (`purchase_table_id`) REFERENCES `Purchase_Table`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Register` ADD CONSTRAINT `Register_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Register_Cash_History` ADD CONSTRAINT `Register_Cash_History_register_id_fkey` FOREIGN KEY (`register_id`) REFERENCES `Register`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Register_Cash_History` ADD CONSTRAINT `Register_Cash_History_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Register_Settlement` ADD CONSTRAINT `Register_Settlement_register_id_fkey` FOREIGN KEY (`register_id`) REFERENCES `Register`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Register_Settlement` ADD CONSTRAINT `Register_Settlement_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Register_Settlement` ADD CONSTRAINT `Register_Settlement_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Register_Settlement_Drawer` ADD CONSTRAINT `Register_Settlement_Drawer_register_settlement_id_fkey` FOREIGN KEY (`register_settlement_id`) REFERENCES `Register_Settlement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Register_Settlement_Sales` ADD CONSTRAINT `Register_Settlement_Sales_register_settlement_id_fkey` FOREIGN KEY (`register_settlement_id`) REFERENCES `Register_Settlement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Register_Status_History` ADD CONSTRAINT `Register_Status_History_register_id_fkey` FOREIGN KEY (`register_id`) REFERENCES `Register`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation_Reception` ADD CONSTRAINT `Reservation_Reception_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation_Reception` ADD CONSTRAINT `Reservation_Reception_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation_Reception_Product` ADD CONSTRAINT `Reservation_Reception_Product_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation_Reception_Product` ADD CONSTRAINT `Reservation_Reception_Product_deposit_transaction_id_fkey` FOREIGN KEY (`deposit_transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation_Reception_Product` ADD CONSTRAINT `Reservation_Reception_Product_received_transaction_id_fkey` FOREIGN KEY (`received_transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation_Reception_Product` ADD CONSTRAINT `Reservation_Reception_Product_reservation_id_fkey` FOREIGN KEY (`reservation_id`) REFERENCES `Reservation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation_Reception_Product` ADD CONSTRAINT `Reservation_Reception_Product_reservation_reception_id_fkey` FOREIGN KEY (`reservation_reception_id`) REFERENCES `Reservation_Reception`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale_Department` ADD CONSTRAINT `Sale_Department_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale_Department` ADD CONSTRAINT `Sale_Department_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `Item_Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale_Department` ADD CONSTRAINT `Sale_Department_item_genre_id_fkey` FOREIGN KEY (`item_genre_id`) REFERENCES `Item_Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale_Department` ADD CONSTRAINT `Sale_Department_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `Sale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale_Product` ADD CONSTRAINT `Sale_Product_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale_Product` ADD CONSTRAINT `Sale_Product_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `Sale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale_Product_History` ADD CONSTRAINT `Sale_Product_History_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale_Product_History` ADD CONSTRAINT `Sale_Product_History_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `Sale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Set_Deal` ADD CONSTRAINT `Set_Deal_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Set_Deal` ADD CONSTRAINT `Set_Deal_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Set_Deal_Product` ADD CONSTRAINT `Set_Deal_Product_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Set_Deal_Product` ADD CONSTRAINT `Set_Deal_Product_set_deal_id_fkey` FOREIGN KEY (`set_deal_id`) REFERENCES `Set_Deal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipping_Method` ADD CONSTRAINT `Shipping_Method_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipping_Region` ADD CONSTRAINT `Shipping_Region_shipping_id_fkey` FOREIGN KEY (`shipping_id`) REFERENCES `Shipping_Method`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipping_Region` ADD CONSTRAINT `Shipping_Region_shipping_weight_id_fkey` FOREIGN KEY (`shipping_weight_id`) REFERENCES `Shipping_Weight`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipping_Weight` ADD CONSTRAINT `Shipping_Weight_shipping_id_fkey` FOREIGN KEY (`shipping_id`) REFERENCES `Shipping_Method`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Specialty` ADD CONSTRAINT `Specialty_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stocking` ADD CONSTRAINT `Stocking_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stocking` ADD CONSTRAINT `Stocking_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stocking` ADD CONSTRAINT `Stocking_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stocking_Product` ADD CONSTRAINT `Stocking_Product_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stocking_Product` ADD CONSTRAINT `Stocking_Product_stocking_id_fkey` FOREIGN KEY (`stocking_id`) REFERENCES `Stocking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store_History` ADD CONSTRAINT `Store_History_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tablet_Allowed_Genre_Category` ADD CONSTRAINT `Tablet_Allowed_Genre_Category_condition_option_id_fkey` FOREIGN KEY (`condition_option_id`) REFERENCES `Item_Category_Condition_Option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tablet_Allowed_Genre_Category` ADD CONSTRAINT `Tablet_Allowed_Genre_Category_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `Item_Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tablet_Allowed_Genre_Category` ADD CONSTRAINT `Tablet_Allowed_Genre_Category_item_genre_id_fkey` FOREIGN KEY (`item_genre_id`) REFERENCES `Item_Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tablet_Allowed_Genre_Category` ADD CONSTRAINT `Tablet_Allowed_Genre_Category_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_corporation_id_fkey` FOREIGN KEY (`corporation_id`) REFERENCES `Corporation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task_Item` ADD CONSTRAINT `Task_Item_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `Task`(`process_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_input_staff_account_id_fkey` FOREIGN KEY (`input_staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_original_transaction_id_fkey` FOREIGN KEY (`original_transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_reception_staff_account_id_fkey` FOREIGN KEY (`reception_staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_register_id_fkey` FOREIGN KEY (`register_id`) REFERENCES `Register`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_staff_account_id_fkey` FOREIGN KEY (`staff_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction_Cart` ADD CONSTRAINT `Transaction_Cart_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction_Cart` ADD CONSTRAINT `Transaction_Cart_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `Sale`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction_Cart` ADD CONSTRAINT `Transaction_Cart_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction_Customer_Cart` ADD CONSTRAINT `Transaction_Customer_Cart_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction_Customer_Cart` ADD CONSTRAINT `Transaction_Customer_Cart_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction_Set_Deal` ADD CONSTRAINT `Transaction_Set_Deal_set_deal_id_fkey` FOREIGN KEY (`set_deal_id`) REFERENCES `Set_Deal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction_Set_Deal` ADD CONSTRAINT `Transaction_Set_Deal_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

