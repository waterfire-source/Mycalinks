# EC Core Constants - ECサイト定数定義

## 目的
ECサイト全体で使用される定数・設定値・マッピングを一元管理

## 実装されている定数ファイル (10個)

### 1. paths.ts (47行)
```typescript
export const BASE_PATH = '/ec';
export const PATH = {
  TOP: BASE_PATH,
  ITEMS: {
    root: `${BASE_PATH}/items`,
    genre: (genre: string) => `${BASE_PATH}/items/genre/${genre}`,
    detail: (itemId: number) => `${BASE_PATH}/items/${itemId}`,
  },
  LOGIN: `${BASE_PATH}/login`,
  CART: `${BASE_PATH}/cart`,
  ORDER: {
    root: `${BASE_PATH}/order`,
    result: (orderId: string) => `${BASE_PATH}/order/result/${orderId}`,
    history: {
      root: `${BASE_PATH}/order/history`,
      detail: (orderId: string) => `${BASE_PATH}/order/history/${orderId}`,
    },
    contact: (orderId: string) => `${BASE_PATH}/order/contact/${orderId}`,
    contactConfirm: (orderId: string) => `${BASE_PATH}/order/contact/${orderId}/confirm`,
    contactResult: (orderId: string) => `${BASE_PATH}/order/contact/${orderId}/result`,
  },
  PAYMENT_METHODS: `${BASE_PATH}/payment-method`,
  ADDRESSES: `${BASE_PATH}/addresses`,
  MESSAGE_CENTER: {
    root: `${BASE_PATH}/message-center`,
    detail: (messageId: string) => `${BASE_PATH}/message-center/${messageId}`,
  },
  ACCOUNT: {
    edit: `${BASE_PATH}/account/edit`,
    editConfirm: `${BASE_PATH}/account/edit/confirm`,
    signup: `${BASE_PATH}/account/signup`,
    signupConfirm: `${BASE_PATH}/account/signup/confirm`,
  },
  FORGET_PASSWORD: {
    root: `${BASE_PATH}/forget-password`,
    signIn: `${BASE_PATH}/forget-password/sign-in`,
    changePassword: `${BASE_PATH}/forget-password/change-password`,
  },
};

// EC関連の外部リンク
export const EC_EXTERNAL_PATH = {
  specialCommercialLaw: 'https://mycalinks-mall.com/scl/',
};
```

### 2. orderStatus.ts (71行)
```typescript
import { $Enums } from '@prisma/client';

// ECオーダーのステータス
export const ecOrderStatus = [
  { label: '下書き', value: $Enums.EcOrderStatus.DRAFT },
  { label: '未入金', value: $Enums.EcOrderStatus.UNPAID },
  { label: '入金済み', value: $Enums.EcOrderStatus.PAID },
  { label: '発送完了', value: $Enums.EcOrderStatus.COMPLETED },
];

// ECオーダーステータスのマッピング
export const EC_ORDER_STATUS_MAP: Record<$Enums.EcOrderStatus, string> = {
  DRAFT: '下書き',
  UNPAID: '未入金',
  PAID: '入金済み',
  COMPLETED: '発送完了',
};

// ECオーダーカートストアのステータス
export const ecOrderCartStoreStatus = [
  { label: '下書き', value: $Enums.EcOrderCartStoreStatus.DRAFT },
  { label: '未入金', value: $Enums.EcOrderCartStoreStatus.UNPAID },
  { label: '発送準備待ち', value: $Enums.EcOrderCartStoreStatus.PREPARE_FOR_SHIPPING },
  { label: '発送待機中', value: $Enums.EcOrderCartStoreStatus.WAIT_FOR_SHIPPING },
  { label: '発送完了', value: $Enums.EcOrderCartStoreStatus.COMPLETED },
  { label: 'キャンセル済み', value: $Enums.EcOrderCartStoreStatus.CANCELED },
];

// ECオーダーカートストアステータスのマッピング
export const EC_ORDER_CART_STORE_STATUS_MAP: Record<
  $Enums.EcOrderCartStoreStatus,
  string
> = {
  DRAFT: '下書き',
  UNPAID: '未入金',
  PREPARE_FOR_SHIPPING: '発送準備待ち',
  WAIT_FOR_SHIPPING: '発送待機中',
  COMPLETED: '発送完了',
  CANCELED: 'キャンセル済み',
};
```

### 3. paymentMethod.ts (34行)
```typescript
import { $Enums } from '@prisma/client';

export const ecPaymentMethodOptions = [
  { label: 'クレジットカード', value: $Enums.EcPaymentMethod.CARD },
  { label: 'PayPay', value: $Enums.EcPaymentMethod.PAYPAY },
  { label: '代金引換', value: $Enums.EcPaymentMethod.CASH_ON_DELIVERY },
  { label: 'コンビニ決済', value: $Enums.EcPaymentMethod.CONVENIENCE_STORE },
  { label: '銀行振込', value: $Enums.EcPaymentMethod.BANK },
];

// 支払い方法の日本語マッピング
export const EC_PAYMENT_METHOD_MAP: Record<$Enums.EcPaymentMethod, string> = {
  CARD: 'クレジットカード',
  PAYPAY: 'PayPay',
  CASH_ON_DELIVERY: '代金引換',
  CONVENIENCE_STORE: 'コンビニ決済',
  BANK: '銀行振込',
};
```

### 4. condition.ts (38行)
```typescript
import { ConditionOptionHandle } from '@prisma/client';

// カード状態
export const cardCondition = [
  { label: '状態A', value: ConditionOptionHandle.O2_A },
  { label: '状態B', value: ConditionOptionHandle.O4_B },
  { label: '状態C', value: ConditionOptionHandle.O5_C },
  { label: '状態D', value: ConditionOptionHandle.O6_D },
];

// ボックス状態
export const boxCondition = [
  { label: '新品', value: ConditionOptionHandle.O1_BRAND_NEW },
  { label: '未使用', value: ConditionOptionHandle.O2_LIKE_NEW },
  { label: '中古', value: ConditionOptionHandle.O3_USED },
];
```

### 5. mallData.ts (66行)
```typescript
// 16種類のトレーディングカードジャンル
export const genreCards = [
  { id: 1, title: 'ポケモンカードゲーム', image: '/sample.png' },
  { id: 2, title: '遊戯王', image: '/sample.png' },
  { id: 3, title: 'デュエルマスターズ', image: '/sample.png' },
  { id: 4, title: 'ヴァイスシュバルツ', image: '/sample.png' },
  { id: 5, title: 'ワンピースカードゲーム', image: '/sample.png' },
  { id: 6, title: 'デジモンカードゲーム', image: '/sample.png' },
  { id: 7, title: 'ヴァンガード', image: '/sample.png' },
  { id: 8, title: 'シャドウバースエボルブ', image: '/sample.png' },
  { id: 9, title: 'RUSHデュエル', image: '/sample.png' },
  { id: 10, title: 'バトルスピリッツ', image: '/sample.png' },
  { id: 11, title: '名探偵コナンカードゲーム', image: '/sample.png' },
  { id: 12, title: 'ユニオンアリーナ', image: '/sample.png' },
  { id: 13, title: 'プロ野球ドリームオーダー', image: '/sample.png' },
  { id: 14, title: 'ヴァイスシュバルツブロウ', image: '/sample.png' },
  { id: 15, title: 'Z/X', image: '/sample.png' },
  { id: 16, title: 'ドラゴンボール超カードゲーム', image: '/sample.png' },
];

// カルーセルバナー（3つ）
export const carouselItems = [
  {
    id: 1,
    image: '/sample.png',
    title: '短期納品！ゲーム風バナー',
    description: '第1回の文無制限',
  },
  {
    id: 2,
    image: '/images/ec/vs_new_banner.png',
    title: '短期納品！ゲーム風バナー',
    description: '第2回の文無制限',
  },
  {
    id: 3,
    image: '/images/dangerous_icon.png',
    title: '短期納品！ゲーム風バナー',
    description: '第3回の文無制限',
  },
];

// ボトムバナー（4つ）
export const bottomBannerItems = [
  {
    id: 1,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
  {
    id: 2,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
  {
    id: 3,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
  {
    id: 4,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
];
```

### 6. orderKind.ts (33行)
- **並び替え種別**: 価格・状態による並び替え定数
- **ORDER_KIND_VALUE**: 価格昇順・降順、状態昇順・降順

### 7. payment.ts (21行)
- **決済関連**: 決済処理に関する定数
- **決済状態**: 決済ステータスの定義

### 8. orderContactKind.ts (22行)
- **問い合わせ種別**: 注文に関する問い合わせ分類
- **連絡方法**: 問い合わせ手段の定義

### 9. itemCategory.ts (14行)
- **商品カテゴリ**: 商品分類の定義
- **カテゴリ階層**: 商品カテゴリの階層構造

### 10. convenience.ts (16行)
- **コンビニ決済**: コンビニエンスストア決済関連
- **店舗種別**: 対応コンビニ店舗の定義

## 主要な定数カテゴリ

### パス管理 (paths.ts)
- **BASE_PATH**: `/ec` をベースとした全パス
- **動的パス**: genre(id), detail(itemId) など関数型パス
- **階層構造**: ORDER.history.detail など深い階層
- **外部リンク**: 特定商取引法ページなど

### ステータス管理 (orderStatus.ts)
- **ECオーダー**: 4段階（下書き→未入金→入金済み→発送完了）
- **カートストア**: 6段階（下書き→未入金→発送準備→発送待機→発送完了→キャンセル）
- **日本語マッピング**: Enum値と日本語の対応

### 決済方法 (paymentMethod.ts)
- **5種類の決済**: クレジットカード、PayPay、代金引換、コンビニ決済、銀行振込
- **Prisma連携**: $Enums.EcPaymentMethod との型安全な連携

### 商品状態 (condition.ts)
- **カード状態**: A〜D の4段階評価
- **ボックス状態**: 新品・未使用・中古の3段階
- **ConditionOptionHandle**: Prisma enum との連携

### モールデータ (mallData.ts)
- **16種類のTCG**: ポケモン、遊戯王、デュエマなど主要TCG
- **カルーセルバナー**: 3つの自動スライドバナー
- **ボトムバナー**: 4つの下部プロモーションバナー

## 技術実装の特徴

### 型安全性
```typescript
// Prisma enum との連携
import { $Enums } from '@prisma/client';

export const EC_ORDER_STATUS_MAP: Record<$Enums.EcOrderStatus, string> = {
  DRAFT: '下書き',
  UNPAID: '未入金',
  PAID: '入金済み',
  COMPLETED: '発送完了',
};
```

### 関数型パス
```typescript
// 動的パス生成
export const PATH = {
  ITEMS: {
    genre: (genre: string) => `${BASE_PATH}/items/genre/${genre}`,
    detail: (itemId: number) => `${BASE_PATH}/items/${itemId}`,
  },
  ORDER: {
    result: (orderId: string) => `${BASE_PATH}/order/result/${orderId}`,
  },
};
```

### 選択肢配列
```typescript
// UI コンポーネント用の選択肢
export const ecPaymentMethodOptions = [
  { label: 'クレジットカード', value: $Enums.EcPaymentMethod.CARD },
  { label: 'PayPay', value: $Enums.EcPaymentMethod.PAYPAY },
  // ...
];
```

## 使用パターン
1. **パス生成**: `PATH.ITEMS.genre('1')` → `/ec/items/genre/1`
2. **ステータス表示**: `EC_ORDER_STATUS_MAP[status]` → 日本語ステータス
3. **選択肢表示**: `ecPaymentMethodOptions.map()` → UI選択肢
4. **条件分岐**: `cardCondition.find()` → 状態判定

## 関連ディレクトリ
- `../`: ECサイトコア機能
- `../components/`: 定数を使用するコンポーネント
- `../../`: ECサイトメイン（定数の利用者）
- `/prisma/`: データベーススキーマ（enum定義）

## 開発ノート
- **一元管理**: 全ての定数を constants/ 配下に集約
- **型安全性**: Prisma enum との連携による型安全性
- **国際化対応**: 日本語マッピングによる表示文字列管理
- **関数型パス**: 動的パス生成による柔軟なルーティング
- **UI連携**: コンポーネントで直接使用可能な選択肢配列

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 