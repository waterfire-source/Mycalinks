# packages/common/CLAUDE.md

## 🎯 目的・役割

MycaLinks POS共通ライブラリ - フロントエンド・バックエンド双方で使用する共通定数、ユーティリティ関数、型定義を提供。コード重複を防ぎ、一貫性を保つための基盤パッケージ。

## 🏗️ 技術構成

- **フレームワーク**: TypeScript（純粋なユーティリティライブラリ）
- **ORM**: なし
- **データベース**: なし
- **主要技術**: 
  - 暗号化・ハッシュ化（crypto）
  - 日付処理（dayjs拡張）
  - 価格計算ロジック
  - 権限定義（APIポリシー）
- **依存関係**: 
  - generate-password（パスワード生成）
  - uuid（UUID生成）
  - tsc-alias（パスエイリアス）

## 📁 ディレクトリ構造

```
packages/common/
├── src/
│   ├── index.ts         # エクスポートエントリー
│   ├── constants/       # 定数定義
│   │   ├── index.ts     
│   │   ├── common.ts    # POS共通定数
│   │   ├── policies.ts  # API権限ポリシー（122個）
│   │   └── mycaApp.ts   # アプリ定数（未使用）
│   └── utils/           # ユーティリティ関数
│       ├── crypto.ts    # 暗号化・UUID・ハッシュ
│       ├── day.ts       # 日付・時刻処理
│       ├── function.ts  # 汎用関数
│       ├── price.ts     # 価格・割引計算
│       ├── type.ts      # 型ユーティリティ
│       └── zod.ts       # Zodバリデーション（未実装）
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 主要機能

### 定数定義（constants/）

#### POS共通定数
```typescript
// 商品コードプレフィックス
PRODUCT_CODE_PREFIX: {
  SET_DEAL: "SD",      // セット商品
  SET_OPEN: "SO",      // セット開封
  PURCHASE_TABLE: "PT", // 買取テーブル
  FEE: "F",            // 手数料
  ...
}

// 表示名辞書（日本語）
DISPLAY_NAME: {
  transaction_kind: {
    SALE: "販売",
    PURCHASE: "買取",
    INVENTORY: "棚卸"
  },
  ...
}
```

#### API権限ポリシー（122個）
```typescript
apiPolicies = {
  // 管理系
  admin_all: "全ての管理権限",
  admin_contract: "契約管理",
  
  // 販売系
  sale_all: "全ての販売権限",
  sale_create: "販売作成",
  
  // 買取系
  purchase_all: "全ての買取権限",
  purchase_create: "買取作成",
  
  // 閲覧系
  view_all: "全ての閲覧権限",
  ...
}
```

### ユーティリティ関数（utils/）

#### 暗号化・セキュリティ（crypto.ts）
```typescript
// パスワード生成
CustomCrypto.generatePassword(length, options)

// UUID生成
CustomCrypto.generateUuid()

// バーコード署名
CustomCrypto.barcodeSign(barcode)

// ハッシュ化
CustomCrypto.hashWithSalt(text, salt)
```

#### 日付処理（day.ts）
```typescript
// 日付フォーマット
formatDate(date, "YYYY年MM月DD日")
formatTime(date, "HH:mm")
formatDatetime(date)

// CRON式判定
checkCronMatch(cronExpression, date)

// タイムゾーン対応
getJSTDate()
```

#### 価格計算（price.ts）
```typescript
// 割引適用
PriceUtil.applyDiscount(price, discount)
// discount: { type: "YEN", value: 100 } または
// discount: { type: "PERCENT", value: 10 }
```

## 💡 使用パターン

### フロントエンドでの使用
```typescript
import { apiPolicies, posCommonConstants } from 'common';

// 権限チェック
if (user.policies.includes('sale_create')) {
  // 販売作成可能
}

// 表示名取得
const kindName = posCommonConstants.DISPLAY_NAME
  .transaction_kind[transaction.kind];
```

### バックエンドでの使用
```typescript
import { CustomCrypto, formatDatetime } from 'common';

// ログ記録時のタイムスタンプ
const timestamp = formatDatetime(new Date());

// APIキー生成
const apiKey = CustomCrypto.generateUuid();
```

### 価格計算の例
```typescript
import { PriceUtil } from 'common';

// 10%割引
const discountedPrice = PriceUtil.applyDiscount(
  1000, 
  { type: "PERCENT", value: 10 }
); // => 900

// 100円引き
const discountedPrice2 = PriceUtil.applyDiscount(
  1000,
  { type: "YEN", value: 100 }
); // => 900
```

## 🗄️ データベース設計

該当なし（ユーティリティライブラリのため）

## 🔗 関連ディレクトリ

- [バックエンドコア](../backend-core/)
- [Webアプリケーション](../web-app/)
- [APIジェネレーター](../api-generator/)

## 📝 開発メモ

### パフォーマンス考慮事項
- 軽量なユーティリティ関数のみ実装
- 外部依存を最小限に抑える
- Tree-shakingに対応した設計

### セキュリティ注意点
- 暗号化関数は適切なソルト使用
- パスワード生成は十分な複雑性を確保
- UUID生成はcrypto.randomUUID使用

### ベストプラクティス
- 共通化すべき処理のみ実装
- パッケージ間の循環参照を避ける
- 型安全性を保つ（TypeScript厳密モード）
- テスト可能な純粋関数として実装

### 注意事項
- このパッケージにビジネスロジックは含めない
- データベース接続等の副作用は持たない
- フロント・バック共通で動作する必要がある
- 破壊的変更は全体に影響するため慎重に

---
*Backend-Agent作成: 2025-01-24*