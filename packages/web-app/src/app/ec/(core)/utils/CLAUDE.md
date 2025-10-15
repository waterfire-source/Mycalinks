# EC Core Utils - ECサイトユーティリティ

## 目的
ECサイト全体で使用される共通ユーティリティ関数・データ変換・ストレージ管理を提供

## 実装されているユーティリティ (9個)

### 1. transformEcOrder.ts (187行) - 最大規模
```typescript
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
          cardnumber: product.product?.mycaItem.cardnumber?.toString(),
          rarity: product.product.mycaItem.rarity,
          expansion: product.product.mycaItem.expansion,
          condition: product.product?.condition_option?.handle,
          price: product.total_unit_price || 0,
          quantity: product.original_item_count,
          imageUrl: product.product.mycaItem.full_image_url,
          subtotal: product.total_unit_price * product.original_item_count,
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
```

### 2. sessionStorage.ts (160行) - セッションストレージ管理
```typescript
/**
 * ECアプリケーション用のsessionStorage管理クラス
 */
export class EcSessionStorageManager {
  private static readonly STORAGE_KEY = 'ec';
  private static readonly EXPIRY_DURATION = 10 * 60 * 1000; // 10分

  /**
   * ECストレージからデータを取得
   */
  private static getEcStorage(): EcSessionStorage {
    try {
      const storageStr = sessionStorage.getItem(this.STORAGE_KEY);
      return storageStr ? JSON.parse(storageStr) : {};
    } catch (error) {
      console.error('Failed to get EC storage:', error);
      return {};
    }
  }

  /**
   * ECストレージにデータを保存
   */
  private static setEcStorage(data: EcSessionStorage): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to set EC storage:', error);
      // 容量オーバーの場合は一度クリアして再保存
      try {
        sessionStorage.clear();
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      } catch (clearError) {
        console.error('Failed to clear and save EC storage:', clearError);
      }
    }
  }

  /**
   * パスが /ec/items/genre/〇〇 の形式かチェック
   */
  private static isGenreItemsPath(pathname: string): boolean {
    return /^\/ec\/items\/genre\/[^/]+$/.test(pathname);
  }

  /**
   * 現在のページ状態を保存
   */
  static savePageState(
    pathname: string,
    search: string,
    scrollPosition: number,
    items: EcItem[],
  ): void {
    // /ec/items/genre/〇〇 以外では保存しない
    if (!this.isGenreItemsPath(pathname)) {
      return;
    }

    const stateKey = `${pathname}${search}`;
    const newState: EcPageState = {
      key: stateKey,
      scrollPosition,
      items,
      itemsCount: items.length,
      timestamp: Date.now(),
    };

    const ecStorage: EcSessionStorage = {
      currentState: newState,
    };

    this.setEcStorage(ecStorage);
  }

  /**
   * ページ状態を復元
   */
  static restorePageState(
    pathname: string,
    search: string,
  ): RestoredState | null {
    const currentPath = `${pathname}${search}`;
    const ecStorage = this.getEcStorage();

    if (!ecStorage.currentState || ecStorage.currentState.key !== currentPath) {
      return null;
    }

    const state = ecStorage.currentState;

    // 期限切れチェック
    if (Date.now() - state.timestamp > this.EXPIRY_DURATION) {
      return null;
    }

    return {
      items: state.items,
      page: Math.floor(state.itemsCount / 18), // ページ数を計算
      scrollPosition: state.scrollPosition,
    };
  }

  /**
   * 保存されたデータをクリア
   */
  static clear(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear EC storage:', error);
    }
  }

  /**
   * デバッグ用：現在の保存状態を取得
   */
  static getDebugInfo(): EcSessionStorage {
    return this.getEcStorage();
  }
}
```

### 3. validateUserInfo.ts (100行) - ユーザー情報バリデーション
- **バリデーション**: メール・パスワード・住所等の形式チェック
- **エラーメッセージ**: 日本語エラーメッセージの生成
- **必須項目チェック**: 必須フィールドの存在確認

### 4. transformEcOrderContact.ts (79行) - 注文問い合わせ変換
- **データ変換**: 注文問い合わせデータの変換
- **フォーマット**: 表示用フォーマットへの変換
- **型安全性**: TypeScript による型変換

### 5. appStorage.ts (43行) - アプリストレージ管理
- **localStorage管理**: アプリケーション全体のローカルストレージ
- **データ永続化**: 設定・状態の永続化
- **エラーハンドリング**: ストレージエラーの適切な処理

### 6. ecStorage.ts (34行) - ECストレージ管理
```typescript
/**
 * 在庫不足商品を保存
 */
export const saveInsufficientProducts = (
  products: Array<{
    product_id: number;
    insufficient_count: number;
  }>
): void => {
  try {
    localStorage.setItem(
      'ec_insufficient_products',
      JSON.stringify(products)
    );
  } catch (error) {
    console.error('Failed to save insufficient products:', error);
  }
};

/**
 * 在庫不足商品を取得
 */
export const getInsufficientProducts = (): Array<{
  product_id: number;
  insufficient_count: number;
}> => {
  try {
    const products = localStorage.getItem('ec_insufficient_products');
    return products ? JSON.parse(products) : [];
  } catch (error) {
    console.error('Failed to get insufficient products:', error);
    return [];
  }
};

/**
 * 在庫不足商品をクリア
 */
export const clearInsufficientProducts = (): void => {
  try {
    localStorage.removeItem('ec_insufficient_products');
  } catch (error) {
    console.error('Failed to clear insufficient products:', error);
  }
};
```

### 7. condition.ts (24行) - 商品状態管理
- **状態変換**: 商品状態の変換・表示
- **状態判定**: 商品状態の判定ロジック
- **表示名**: 状態の表示名変換

### 8. prefecture.ts (14行) - 都道府県管理
- **都道府県一覧**: 都道府県の一覧データ
- **住所管理**: 住所関連のユーティリティ

### 9. price.ts (6行) - 最小規模
```typescript
// 数値を3桁 カンマ区切りでフォーマットする
export const formatPrice = (price: number | null): string => {
  if (price === null) return '0';
  return price.toLocaleString();
};
```

## 主要な技術実装

### 複雑なデータ変換 (transformEcOrder.ts - 187行)
- **店舗別分割**: 1つの注文を店舗ごとに分割
- **商品変換**: 商品データの詳細変換
- **価格計算**: 小計・送料・合計の計算
- **型安全性**: 複雑な型変換の安全な実装

### セッションストレージ管理 (sessionStorage.ts - 160行)
- **クラス設計**: 静的メソッドによる管理
- **期限管理**: 10分間の自動期限切れ
- **パス判定**: 正規表現による対象パス判定
- **エラーハンドリング**: 容量オーバー時の自動クリア

### ストレージ管理 (ecStorage.ts - 34行)
- **在庫不足商品**: 在庫不足商品の永続化
- **エラーハンドリング**: ストレージエラーの適切な処理
- **型安全性**: 型安全なデータ保存・取得

### 価格フォーマット (price.ts - 6行)
- **シンプル実装**: 最小限の価格フォーマット
- **null対応**: null値の適切な処理
- **国際化**: toLocaleString による地域対応

## 使用パターン

### 1. 注文データ変換
```typescript
import { transformEcOrder, getEcOrderById } from './transformEcOrder';

// 注文データを店舗別に変換
const transformedOrders = transformEcOrder(orderData);

// 特定の注文を取得
const order = getEcOrderById(orderData, '123');
```

### 2. セッションストレージ管理
```typescript
import { EcSessionStorageManager } from './sessionStorage';

// ページ状態を保存
EcSessionStorageManager.savePageState(
  '/ec/items/genre/1',
  '?hasStock=true',
  1200,
  products
);

// ページ状態を復元
const restoredState = EcSessionStorageManager.restorePageState(
  '/ec/items/genre/1',
  '?hasStock=true'
);

if (restoredState) {
  setProducts(restoredState.items);
  setScrollPosition(restoredState.scrollPosition);
}
```

### 3. 在庫不足商品管理
```typescript
import { 
  saveInsufficientProducts, 
  getInsufficientProducts, 
  clearInsufficientProducts 
} from './ecStorage';

// 在庫不足商品を保存
saveInsufficientProducts([
  { product_id: 123, insufficient_count: 2 }
]);

// 在庫不足商品を取得
const insufficientProducts = getInsufficientProducts();

// 在庫不足商品をクリア
clearInsufficientProducts();
```

### 4. 価格フォーマット
```typescript
import { formatPrice } from './price';

// 価格をフォーマット
const formattedPrice = formatPrice(1000); // "1,000"
const formattedNullPrice = formatPrice(null); // "0"
```

## 関連ディレクトリ
- `../`: ECサイトコア機能
- `../hooks/`: カスタムフック（ユーティリティを使用）
- `../components/`: コンポーネント（ユーティリティを使用）
- `/types/`: 型定義（ユーティリティで使用）

## 開発ノート
- **規模の幅**: 6行（price.ts）〜 187行（transformEcOrder.ts）
- **責務分離**: 各ユーティリティは単一責務を持つ
- **エラーハンドリング**: 統一されたエラー処理パターン
- **型安全性**: TypeScript による厳密な型定義
- **パフォーマンス**: 効率的なデータ変換・ストレージ管理
- **再利用性**: 複数箇所から利用可能な汎用関数

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 