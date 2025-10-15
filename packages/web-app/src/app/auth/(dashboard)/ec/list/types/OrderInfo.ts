export interface OrderInfo {
  orderId: number; // 注文番号
  status: OrderStatus; // 注文ステータス
  orderDate: Date; // 注文日時
  paymentMethod: string; // 支払方法
  deliveryMethod: {
    id: number; // 配送方法ID
    displayName: string; // 配送方法名
  }; // 配送方法
  items: OrderItem[]; // 商品
  totalAmount: number; // 合計金額
  customerInfo: CustomerInfo; // 顧客情報
  addInfo: {
    isCustomerChange: boolean; // 注文変更フラグ（ひとつでも顧客変更がある場合はTRUE）
    read: boolean; // 店舗が注文を確認したかどうか
  }; // 追加情報
  shippingTrackingNumber: string;
}

export interface CustomerInfo {
  name: string; // 顧客名
  address: string; // 発送先
  email: string; // メールアドレス
  phoneNumber: string; // 電話番号
}

export interface OrderItem {
  itemId: number | undefined; // 商品ID
  productId: number; // ProductID
  imageUrl: string; // 商品画像URL
  name: string; // 商品名
  condition: string; // 商品状態
  price: number; // 商品価格
  quantity: number; // 実際の商品数量
  original_item_count: number; // 注文時の数量
  item_count: number; // 現在の数量
  shortage: number | null; // 欠品数
  addInfo: {
    isCustomerChange: boolean; // 顧客変更フラグ
    customerChangeQuantity: number | null; // 顧客変更数量
  }; // 追加情報
}

export enum OrderStatus {
  UNPAID = 'UNPAID',
  PREPARE_FOR_SHIPPING = 'PREPARE_FOR_SHIPPING',
  PROCESSING_MISSING_ITEM = 'PROCESSING_MISSING_ITEM',
  WAIT_FOR_SHIPPING = 'WAIT_FOR_SHIPPING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  [OrderStatus.UNPAID]: '未入金',
  [OrderStatus.PREPARE_FOR_SHIPPING]: '発送準備待ち',
  [OrderStatus.PROCESSING_MISSING_ITEM]: '欠品連絡中',
  [OrderStatus.WAIT_FOR_SHIPPING]: '発送待機中',
  [OrderStatus.COMPLETED]: '発送完了',
  [OrderStatus.CANCELED]: 'キャンセル済み',
};
