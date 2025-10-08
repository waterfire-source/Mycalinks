export interface TransactionInfo {
  id: number | null; // 取引ID
  buy__is_assessed: boolean; // 査定が完了しているかどうか
  customer_id: number; // 顧客ID
  store__display_name: string; // 店舗名
  reception_number: number; // 受付番号
  transaction_carts: TransactionCart[];
  total_price: number; // 合計査定金額
  updated_at: Date;
  transaction_kind: 'sell' | 'buy';
}

export interface TransactionCart {
  product__display_name: string; // 商品名
  product__image_url: string; // 商品画像URL
  product__specialty__display_name: string; // 特殊状態
  item_count: number; // 数量
  totalUnitPrice: number; // 合計金額
  unit_price: number; // 単価
  discount_price: number; // 割引額
  sale_discount_price: number; // セール割引額
  product__id: number; // 商品ID
  item_expansion: string; // 商品拡張情報
  item_cardnumber: string; // 商品カードナンバー
  product__condition_option__display_name: string;
}
