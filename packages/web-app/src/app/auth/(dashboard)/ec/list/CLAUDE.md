# EC注文一覧管理

## 目的
ECサイトからの注文を一覧表示し、ステータス管理・検索・詳細確認を行うページ

## 実装されている機能

### メインページ (page.tsx - 13行)
- **シンプルな構造**: ContainerLayoutとECOrderTableのみで構成
- **タイトル**: 「注文一覧」として表示

### 注文テーブル (EcOrderTable.tsx - 144行)
- **タブ切り替え**: 注文ステータス別の表示（すべて・未入金・発送準備待ち・発送待機中・発送完了・キャンセル済み）
- **検索機能**: 注文番号・支払方法・配送方法での絞り込み
- **並び替え**: 受注日時の昇順・降順切り替え
- **リアルタイム更新**: 検索条件変更時の自動データ取得

### 検索フォーム (OrderSearchForm.tsx - 126行)
- **注文番号検索**: テキスト入力（Enterキー対応）
- **支払方法フィルタ**: クレジットカード・PayPay・代引き・コンビニ決済・銀行振込
- **配送方法フィルタ**: 動的に取得された配送方法リスト
- **並び替え**: 受注日時の早い順・遅い順

## ファイル構成
```
list/
├── page.tsx                      # メインページ（13行）
├── components/
│   ├── EcOrderTable.tsx         # 注文テーブル（144行）
│   ├── OrderSearchForm.tsx      # 検索フォーム（126行）
│   ├── OrderModals.tsx          # 注文モーダル（121行）
│   ├── modal/                   # モーダル関連コンポーネント
│   └── table/                   # テーブル関連コンポーネント
├── hooks/
│   ├── useOrderInfo.ts          # 注文情報取得（168行）
│   ├── useOrderCancel.ts        # 注文キャンセル（54行）
│   ├── useOrderComplete.ts      # 注文完了（67行）
│   ├── useOrderPrepare.ts       # 発送準備（47行）
│   ├── useOrderRead.ts          # 注文確認（48行）
│   ├── useOrderShortage.ts      # 欠品処理（60行）
│   ├── useProduct.ts            # 商品情報（55行）
│   └── useGetShippingMethod.ts  # 配送方法取得（60行）
└── types/
    └── OrderInfo.ts             # 注文情報型定義（58行）
```

## 技術実装詳細

### 注文ステータス管理
```typescript
// 注文ステータス定義
export enum OrderStatus {
  UNPAID = 'UNPAID',                        // 未入金
  PREPARE_FOR_SHIPPING = 'PREPARE_FOR_SHIPPING', // 発送準備待ち
  PROCESSING_MISSING_ITEM = 'PROCESSING_MISSING_ITEM', // 欠品連絡中
  WAIT_FOR_SHIPPING = 'WAIT_FOR_SHIPPING',   // 発送待機中
  COMPLETED = 'COMPLETED',                   // 発送完了
  CANCELED = 'CANCELED',                     // キャンセル済み
}

// タブ定義
const ORDER_STATUS_TABS = [
  { key: 'all', value: 'すべて' },
  { key: 'UNPAID', value: ORDER_STATUS_MAP.UNPAID },
  { key: 'PREPARE_FOR_SHIPPING', value: ORDER_STATUS_MAP.PREPARE_FOR_SHIPPING },
  { key: 'WAIT_FOR_SHIPPING', value: ORDER_STATUS_MAP.WAIT_FOR_SHIPPING },
  { key: 'COMPLETED', value: ORDER_STATUS_MAP.COMPLETED },
  { key: 'CANCELED', value: ORDER_STATUS_MAP.CANCELED },
];
```

### 支払方法マッピング
```typescript
// 支払い方法の表示用マッピング
export const PAYMENT_METHOD_MAP: Record<EcPaymentMethod, string> = {
  [EcPaymentMethod.CARD]: 'クレジットカード',
  [EcPaymentMethod.PAYPAY]: 'PayPay',
  [EcPaymentMethod.CASH_ON_DELIVERY]: '代引き',
  [EcPaymentMethod.CONVENIENCE_STORE]: 'コンビニ決済',
  [EcPaymentMethod.BANK]: '銀行振込',
};
```

### 注文情報データ構造
```typescript
export interface OrderInfo {
  orderId: number;              // 注文番号
  status: OrderStatus;          // 注文ステータス
  orderDate: Date;              // 注文日時
  paymentMethod: string;        // 支払方法
  deliveryMethod: {             // 配送方法
    id: number;
    displayName: string;
  };
  items: OrderItem[];           // 商品リスト
  totalAmount: number;          // 合計金額
  customerInfo: CustomerInfo;   // 顧客情報
  addInfo: {                    // 追加情報
    isCustomerChange: boolean;  // 顧客変更フラグ
    read: boolean;              // 店舗確認フラグ
  };
}
```

### データ取得・処理
```typescript
// 注文情報取得API
const response = await apiClient.current.ec.getEcOrderByStore({
  storeId: storeId,
  status: params?.status,
  shippingMethodId: params?.shippingMethodId,
  orderPaymentMethod: params?.orderPaymentMethod,
  orderBy: params?.orderBy,
  id: params?.id,
  platform: 'MYCALINKS',
});

// 商品情報の一括取得・マッピング
const allProductIds = Array.from(new Set(
  response.storeOrders.flatMap((o) =>
    o.products.map((p: any) => p.product.id)
  )
));
const batchProductsResponse = await api.current.product.listProducts({
  storeID: storeId,
  id: allProductIds,
  includesSummary: true,
});
```

## 使用パターン
1. **注文一覧確認**: ステータス別タブで注文を確認
2. **検索・フィルタ**: 注文番号・支払方法・配送方法での絞り込み
3. **並び替え**: 受注日時での並び替え
4. **詳細確認**: 注文行クリックで詳細モーダル表示
5. **ステータス変更**: 発送準備・発送完了・キャンセル等の処理

## 関連する主要フック
- **useOrderInfo**: 注文情報の取得・管理
- **useGetShippingMethod**: 配送方法の取得
- **useOrderCancel**: 注文キャンセル処理
- **useOrderComplete**: 注文完了処理
- **useOrderPrepare**: 発送準備処理
- **useOrderShortage**: 欠品処理

## 関連ディレクトリ
- `components/modal/`: 注文詳細モーダル
- `components/table/`: 注文テーブル表示
- `../stock/`: 在庫管理との連携
- `../transaction/`: 取引管理との連携
- `/contexts/`: StoreContext、AlertContext

## 開発ノート
- **Prisma連携**: EcOrderCartStoreStatus、EcPaymentMethodによる型安全性
- **パフォーマンス**: 商品情報の一括取得による効率化
- **エラーハンドリング**: CustomErrorによる詳細なエラー処理
- **リアルタイム更新**: 検索条件変更時の自動データ取得
- **ユーザビリティ**: タブ切り替え・検索・並び替えによる効率的な注文管理 