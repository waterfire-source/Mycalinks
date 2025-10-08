import { Item, Product } from '@prisma/client';

// item取得用のapiとproduct取得用apiのapiの両方を使うため、統一の型を定義してこの型にresponseを変換する。
export interface ArrivalItemType {
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
  products: Array<ArrivalProductSearchType>;
  // 入荷用
  arrival_count?: number; // 入荷数量
  arrival_price?: number; // 仕入れ値
}

export interface ArrivalProductSearchType {
  //nullの場合は管理番号が追加された新規商品
  id: Product['id'] | null;
  display_name: Product['display_name'];
  displayNameWithMeta: string;
  retail_price: Product['retail_price'];
  sell_price: Product['sell_price'];
  buy_price: Product['buy_price'];
  stock_number: Product['stock_number'];
  is_active: Product['is_active'];
  is_buy_only: Product['is_buy_only'];
  image_url: Product['image_url'];
  item_id: Product['item_id'];
  product_code: Product['product_code'];
  description: Product['description'];
  created_at: Date;
  updated_at: Date;
  specialty_id: Product['specialty_id'];
  condition_option_id: Product['condition_option_id'];
  management_number: Product['management_number'];
  // 入荷用
  arrivalCount?: number; // 入荷数量
  arrivalPrice?: number; // 仕入れ値
  condition_option_display_name: string;
  item_infinite_stock: boolean;
}
