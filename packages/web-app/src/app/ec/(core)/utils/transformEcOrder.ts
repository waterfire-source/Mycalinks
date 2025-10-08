import { payEcOrderDef } from '@/app/api/ec/def';
import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import {
  $Enums,
  Ec_Order_Cart_Store,
  Ec_Order_Cart_Store_Product,
  Item,
  Item_Category_Condition_Option,
  Product,
  Shipping_Method,
  Store,
  Prisma,
  Specialty,
} from '@prisma/client';

type ecOrderRes = typeof payEcOrderDef.response & {
  insufficientProducts?: Array<{
    product_id: Ec_Order_Cart_Store_Product['product_id']; //在庫ID
    insufficient_count: number; //不足している個数
  }>;
};
// カートストアの型定義
type CartStoreRes = {
  store_id: Ec_Order_Cart_Store['store_id'];
  store: {
    display_name: Store['display_name']; // ストア名
  };
  total_price: Ec_Order_Cart_Store['total_price']; // ストアごとの合計金額（送料も含める）
  shipping_method_id: Ec_Order_Cart_Store['shipping_method_id'];
  shipping_method: {
    display_name: Shipping_Method['display_name']; // 配送方法名
  } | null;
  shipping_fee: Ec_Order_Cart_Store['shipping_fee']; // 配送料
  status: Ec_Order_Cart_Store['status']; // ステータス
  code: Ec_Order_Cart_Store['code']; // オーダーコード（ストアごと）
  products: Array<CartStoreProductRes>;
  receipt_customer_name?: Ec_Order_Cart_Store['receipt_customer_name'];
  shipping_tracking_code?: Ec_Order_Cart_Store['shipping_tracking_code']; // 追跡番号
  shipping_company?: Ec_Order_Cart_Store['shipping_company']; // 運送会社
};

// カート内商品の型定義
type CartStoreProductRes = {
  product_id: Ec_Order_Cart_Store_Product['product_id']; // 在庫ID
  total_unit_price: Ec_Order_Cart_Store_Product['total_unit_price']; // 単価
  original_item_count: Ec_Order_Cart_Store_Product['original_item_count']; // 希望個数
  item_count: Ec_Order_Cart_Store_Product['item_count']; // 実際の個数
  product: {
    ec_stock_number: Product['ec_stock_number']; // EC在庫数
    condition_option: {
      handle: Item_Category_Condition_Option['handle']; // 状態ハンドル
    };
    specialty: {
      handle: Specialty['handle']; // 特殊状態ハンドル
    } | null;
    item: {
      myca_item_id: Item['myca_item_id']; // Myca上のアイテムID
    };
    mycaItem: {
      id: mycaItem['id']; // MycaアイテムID
      cardname: mycaItem['cardname']; // カード名
      rarity: mycaItem['rarity']; // レアリティ
      expansion: mycaItem['expansion']; // エキスパンション
      cardnumber: mycaItem['cardnumber']; // 型番
      full_image_url: mycaItem['full_image_url']; // 画像URL
    }; // Mycaアイテム情報
  };
};

type TransformedEcOrderItem = {
  id: string | number;
  name: string;
  cardnumber: string;
  expansion: string | null;
  rarity: string | null;
  condition: string;
  specialty?: string | null;
  price: number;
  quantity: number;
  original_item_count: number;
  item_count: number;
  imageUrl: string | null;
};

export type TransformedEcOrder = {
  id: string | number;
  shopName: string;
  customerName: string;
  shippingAddress: string;
  paymentMethod: $Enums.EcPaymentMethod;
  paymentInfo: Prisma.JsonValue | null;
  shippingMethod: string;
  orderDate: Date | null;
  orderNumber: string;
  status: $Enums.EcOrderStatus;
  totalPrice: number | null;
  items: TransformedEcOrderItem[];
  subtotal: number;
  shippingFee: number;
  // 店舗ごとの情報を追加
  storeId: number;
  storeOrderCode: string;
  storeStatus: $Enums.EcOrderCartStoreStatus;
  receiptCustomerName: string | null;
  // 配送追跡情報を追加
  shippingTrackingCode: string | null;
  shippingCompany: $Enums.EcShippingCompany | null;
};

/**
 * 注文データを変換する（店舗ごとに分割）
 * @param orderData 注文データ
 * @returns 変換された注文データの配列（店舗ごと）
 */
export const transformEcOrder = (orderData: {
  orders?: ecOrderRes[];
}): TransformedEcOrder[] => {
  if (!orderData || !orderData.orders || orderData.orders.length === 0) {
    return [];
  }

  // 各注文の各店舗ごとにデータを作成
  return orderData.orders.flatMap((order: ecOrderRes) => {
    return order.cart_stores.map((store: CartStoreRes) => {
      const items = store.products.map((product: CartStoreProductRes) => {
        return {
          id: product.product_id,
          name: product.product.mycaItem.cardname,
          cardnumber: product.product?.mycaItem.cardnumber?.toString() ?? '',
          rarity: product.product.mycaItem.rarity,
          expansion: product.product.mycaItem.expansion,
          condition: product.product?.condition_option?.handle ?? '',
          specialty: product.product?.specialty?.handle ?? '',
          price: product.total_unit_price || 0,
          quantity: product.item_count,
          original_item_count: product.original_item_count,
          item_count: product.item_count,
          imageUrl: product.product.mycaItem.full_image_url,
          subtotal: product.total_unit_price * product.item_count,
        };
      });

      // 店舗ごとの商品小計
      const itemsSubtotal = items.reduce(
        (total, item) => total + (item.subtotal || 0),
        0,
      );

      return {
        id: order.id,
        shopName: store.store?.display_name || 'カードショップ',
        customerName: order.customer_name || '注文者',
        shippingAddress: order.shipping_address || '住所',
        paymentMethod: order.payment_method || 'CARD',
        paymentInfo: order.payment_info || null,
        shippingMethod: store.shipping_method?.display_name || '配送方法',
        orderDate: order.ordered_at,
        orderNumber: `${order.id.toString().padStart(6, '0')}`,
        status: order.status,
        totalPrice: store.total_price, // 店舗ごとの合計金額
        items,
        subtotal: itemsSubtotal,
        shippingFee: store.shipping_fee || 0,
        // 店舗固有の情報
        storeId: store.store_id,
        storeOrderCode: store.code,
        storeStatus: store.status,
        receiptCustomerName: store.receipt_customer_name ?? null,
        // 配送追跡情報
        shippingTrackingCode: store.shipping_tracking_code ?? null,
        shippingCompany: store.shipping_company ?? null,
      };
    });
  });
};

/**
 * 特定の注文IDの注文データを取得する
 * @param orderData 注文データ
 * @param orderId 取得したい注文ID
 * @returns 指定されたIDの注文データ、見つからない場合はundefined
 */
export const getEcOrderById = (
  orderData: { orders?: ecOrderRes[] },
  orderId: string | number,
): TransformedEcOrder | undefined => {
  if (!orderData || !orderData.orders || orderData.orders.length === 0) {
    return undefined;
  }

  const transformedOrders = transformEcOrder(orderData);
  return transformedOrders.find(
    (order) => order.id.toString() === orderId.toString(),
  );
};

/**
 * 店舗注文番号で注文データを取得する
 * @param orderData 注文データ
 * @param storeOrderCode 取得したい店舗注文番号
 * @returns 指定された店舗注文番号の注文データ、見つからない場合はundefined
 */
export const getEcOrderByStoreOrderCode = (
  orderData: { orders?: ecOrderRes[] },
  storeOrderCode: string,
): TransformedEcOrder | undefined => {
  if (!orderData || !orderData.orders || orderData.orders.length === 0) {
    return undefined;
  }

  const transformedOrders = transformEcOrder(orderData);
  return transformedOrders.find(
    (order) => order.storeOrderCode === storeOrderCode,
  );
};
