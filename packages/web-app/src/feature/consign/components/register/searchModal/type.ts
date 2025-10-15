import { Item } from '@prisma/client';
// TODO:かなりカオスなので修正したい
// item取得用のapiとproduct取得用apiのapiの両方を使うため、統一の型を定義してこの型にresponseを変換する。
export interface ConsignmentItemType {
  id: number;
  store_id: number;
  rarity: string | null;
  pack_name: string | null;
  expansion: string | null;
  cardnumber: string | null;
  display_name: string | null;
  display_name_ruby: string | null;
  sell_price: number | null;
  buy_price: Item['buy_price'] | null;
  description: Item['description'] | null;
  myca_item_id: Item['myca_item_id'] | null;
  image_url: Item['image_url'] | null;
  created_at: Item['created_at'];
  updated_at: Item['updated_at'];
  products: Array<ConsignmentProductSearchType>;
  // 委託用
  consignment_count?: number; // 委託数量
  consignment_price?: number; // 委託価格
}

export interface ConsignmentProductSearchType {
  customId: string;
  id: number;
  item_id?: number; // 商品マスタID
  display_name: string;
  displayNameWithMeta: string;
  retail_price: number;
  sell_price: number;
  buy_price: number;
  stock_number: number;
  is_active: boolean;
  is_buy_only: boolean;
  image_url: string | null;
  product_code: string;
  description: string;
  created_at: string;
  updated_at: string;
  specialty_id: number | null;
  management_number: string | null;
  condition_option_id: number | null;
  condition_option_display_name: string | null;
  item_infinite_stock: boolean;
  consignmentCount: number; // 委託数
  consignmentPrice: number; // 委託価格
}
