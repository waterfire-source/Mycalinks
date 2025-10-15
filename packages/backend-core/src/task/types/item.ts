import { ProductService } from '@/services/internal/product/main';
import { ItemCreateData, ItemUpdateData } from '@/services/internal/item/main';
import {
  Account,
  Item,
  Item_Category_Condition_Option,
  Myca_Item,
  Product,
  Supplier,
} from '@prisma/client';

//タスクではなるべくフィールドごとに定義したい

/**
 * 商品マスタ登録タスク
 */
export type CreateItemData = ItemCreateData;

/**
 * 状態選択肢追加データ
 */
export type AddConditionOptionData = {
  item_id: Item['id'];
  condition_option_id: Item_Category_Condition_Option['id'];
};

/**
 * 商品マスタ更新データ
 */
export type UpdateItemData = ItemUpdateData & {
  id: Item['id'];
};

/**
 * 在庫更新
 */
export type UpdateProductData = ProductService.UpdateData & {
  id: Product['id'];
};

/**
 * 仕入れ
 */
export type Stocking = {
  id: Product['id'];
  stocking_item_count: number;
  stocking_wholesale_price: number;
  supplier_id: Supplier['id'];
  staff_account_id: Account['id'];
};

/**
 * EC出品
 */

/**
 * Mycaアイテム
 */
export type UpdateMycaItemData = {
  myca_item_id: Myca_Item['myca_item_id'];
  market_price?: Myca_Item['market_price'];
  previous_market_price?: Myca_Item['previous_market_price'];
  market_price_updated_at?: Myca_Item['market_price_updated_at'];
};
