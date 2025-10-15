//おちゃのこ

import { OchanokoOrderDetail } from '@/services/external/ochanoko/type';
import { Ec_Setting, Product, Store } from '@prisma/client';

/**
 * おちゃのこの取引作成・更新
 */
export type OchanokoOrder = {
  email: string; //メールアドレス
  order_id: OchanokoOrderDetail['id']; //おちゃのこの注文ID
  kind: 'ordered' | 'shipped'; //注文作成か発送完了か
};

/**
 * おちゃのこ値段変動
 */
export type OchanokoUpdatePrice = {
  store_id: Store['id']; //ストアID
  ochanoko_product_id: number; //おちゃのこの商品ID
  price: number; //値段
};

/**
 * おちゃのこ在庫変動
 */
export type OchanokoUpdateStockNumber = {
  store_id: Store['id']; //ストアID
  ochanoko_product_id: number; //おちゃのこの商品ID
  stock_number: number; //在庫
};

/**
 * Shopify注文
 */
export type ShopifyOrder = {
  shopify_shop_domain: Ec_Setting['shopify_shop_domain']; // ストアドメイン
  order_id: string; //注文GID
  kind: 'ordered' | 'shipped'; //注文作成か発送完了か
};

/**
 * Shopify在庫変動
 */
export type ShopifyUpdateStockNumber = {
  store_id: Store['id']; //ストアID
  shopify_inventory_item_id: Product['shopify_inventory_item_id']; //Shopifyの在庫ID
  stock_number: number; //在庫数
};

/**
 * Shopify値段変動
 */
export type ShopifyUpdatePrice = {
  store_id: Store['id']; //ストアID
  shopify_product_id: Product['shopify_product_id']; //Shopifyの商品ID
  shopify_product_variant_id: Product['shopify_product_variant_id']; //ShopifyのバリエーションID
  price: number; //値段
};
