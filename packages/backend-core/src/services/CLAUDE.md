# services/CLAUDE.md

## 🎯 目的・役割

バックエンドコアのビジネスロジック層 - ドメイン固有のビジネスルール、データ処理、外部サービス連携を管理するサービス層。Clean Architectureのアプリケーション層に相当する。

## 🏗️ 技術構成

- **フレームワーク**: Node.js + TypeScript
- **ORM**: Prisma Client
- **バリデーション**: Zod
- **エラーハンドリング**: カスタムエラークラス
- **ログ**: 構造化ログ (CloudWatch対応)
- **依存関係**: ../db/dao/, ../redis/, ../event/

## 📁 ディレクトリ構造

```
services/
├── internal/                   # 内部ビジネスロジック
│   ├── customer/              # 顧客管理サービス
│   ├── item/                  # 商品管理サービス
│   ├── product/               # 在庫管理サービス
│   ├── transaction/           # 取引処理サービス
│   ├── ec/                    # EC注文処理サービス
│   ├── reservation/           # 予約管理サービス
│   ├── register/              # レジ管理サービス
│   ├── store/                 # 店舗設定サービス
│   ├── sale/                  # 売上集計サービス
│   ├── csv/                   # データI/Oサービス
│   ├── auth/                  # 認証・認可サービス
│   ├── notification/          # 通知サービス
│   ├── report/                # レポート生成サービス
│   ├── inventory/             # 棚卸しサービス
│   └── analytics/             # 分析サービス
└── external/                  # 外部サービス連携
    ├── aws/                   # AWS SDK ラッパー
    ├── gmo/                   # GMO決済ゲートウェイ
    ├── square/                # Square決済API
    ├── ochanoko/              # おちゃのこネットEC
    ├── shopify/               # Shopify EC
    ├── expo/                  # プッシュ通知
    ├── pythonApi/             # Python側API連携
    └── printer/               # プリンター制御
```

## 🔧 主要機能

### 内部サービス (internal/)

#### 顧客管理 (customer/)
- 顧客情報CRUD、ポイント計算、購入履歴管理
- 顧客セグメンテーション、ロイヤリティ管理

#### 商品管理 (item/)
- 商品マスタ管理、カテゴリ管理、価格設定
- バンドル商品、セット商品処理

#### 在庫管理 (product/)
- 在庫数管理、入荷・出荷処理、ロット管理
- 店舗間移動、在庫履歴、自動発注

#### 取引処理 (transaction/)
- 販売・買取取引、決済処理、割引適用
- 返品・交換、取引履歴管理

#### EC連携 (ec/)
- EC注文処理、在庫同期、配送管理
- 外部ECプラットフォーム連携

### 外部サービス (external/)

#### 決済連携
- **GMO**: クレジットカード決済、分割払い
- **Square**: 店頭決済、オンライン決済

#### EC連携
- **おちゃのこネット**: 商品同期、注文取込
- **Shopify**: 在庫同期、注文管理

#### インフラ連携
- **AWS**: S3ファイル管理、SESメール送信
- **Expo**: モバイルプッシュ通知

## 💡 使用パターン

### サービス呼び出し
```typescript
import { customerService } from '@mycalinks/backend-core/services';

// 顧客ポイント加算
await customerService.addPoints({
  customer_id: 123,
  points: 100,
  reason: "購入特典",
  store_id: 1
});
```

### トランザクション処理
```typescript
import { transactionService } from '@mycalinks/backend-core/services';

// 販売取引処理
const result = await transactionService.processSale({
  store_id: 1,
  customer_id: 123,
  items: [
    { item_id: 456, quantity: 2, price: 1000 }
  ],
  payment_method: "cash",
  discount_rate: 0.1
});
```

### 外部サービス連携
```typescript
import { gmoService } from '@mycalinks/backend-core/services/external';

// GMO決済処理
const paymentResult = await gmoService.processPayment({
  amount: 5000,
  card_token: "token_123",
  order_id: "ORD_456"
});
```

## 🗺️ プロジェクト内での位置づけ

- **上位層**: API Routes (web-app/src/app/api/)
- **同位層**: タスク処理 (../task/), ジョブ処理 (../job/)
- **下位層**: データアクセス (../db/), Redis (../redis/)
- **外部連携**: 各種外部サービス、決済ゲートウェイ

## 🔗 関連ディレクトリ

- [../db/](../db/) - データアクセス層
- [../task/](../task/) - 非同期タスク
- [../job/](../job/) - 定期ジョブ
- [../event/](../event/) - イベント処理
- [../../../web-app/src/app/api/](../../../web-app/src/app/api/) - API Routes

## 📚 ドキュメント・リソース

- Clean Architecture 設計原則
- ドメイン駆動設計 (DDD) パターン
- サービス層設計ガイドライン
- エラーハンドリング標準

## 📝 開発メモ

### 設計原則
- **単一責任**: 各サービスは単一のドメインを担当
- **依存性逆転**: インターフェースに依存、実装に依存しない
- **疎結合**: サービス間の直接依存を最小化
- **テスタビリティ**: 単体テスト可能な設計

### エラーハンドリング
```typescript
// カスタムエラークラス使用
throw new BusinessLogicError(
  "在庫不足",
  { item_id: 123, requested: 5, available: 2 }
);
```

### ログ出力
```typescript
// 構造化ログ
logger.info("取引処理完了", {
  transaction_id: result.id,
  amount: result.total_amount,
  store_id: params.store_id,
  duration_ms: Date.now() - startTime
});
```

### パフォーマンス考慮事項
- データベースクエリの最適化 (N+1問題回避)
- Redis キャッシュの効果的活用
- 非同期処理の適切な使用
- バッチ処理による大量データ操作

### セキュリティ注意点
- 入力値の厳格なバリデーション
- 店舗別データ分離の徹底
- 機密情報の適切な暗号化
- 監査ログの確実な記録

### テスト戦略
- 単体テスト: 各サービスメソッドの独立テスト
- 統合テスト: データベース連携テスト
- モックテスト: 外部サービス連携テスト
- パフォーマンステスト: 負荷テスト

---
*Backend-Agent作成: 2025-01-24* 