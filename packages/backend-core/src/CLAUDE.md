# packages/backend-core/src/CLAUDE.md

## 🎯 目的・役割

バックエンドコアのソースコードディレクトリ - ビジネスロジック、データアクセス、外部連携、非同期処理の実装層。イベント駆動アーキテクチャとマイクロサービス設計の中核。

## 🏗️ 技術構成

- **フレームワーク**: Node.js + TypeScript
- **ORM**: Prisma 6.6.0（論理削除拡張付き）
- **データベース**: MySQL + Redis（Pub/Sub & キャッシュ）
- **主要技術**: 
  - イベント駆動（Redis Pub/Sub）
  - 非同期処理（AWS SQS）
  - リトライ機能（デコレータパターン）
- **依存関係**: 
  - Prismaクライアント
  - AWS SDK
  - 各種外部API

## 📁 ディレクトリ構造

```
src/
├── index.ts          # エクスポートエントリーポイント
├── db/               # データベースアクセス層
│   ├── prisma.ts     # Prismaクライアント設定
│   └── dao/          # データアクセスオブジェクト
│       ├── main.ts   # 論理削除対応Prisma拡張
│       ├── account.ts
│       ├── item.ts
│       ├── product.ts
│       └── register.ts
├── error/            # エラーハンドリング
│   └── main.ts       # カスタムエラー & リトライデコレータ
├── event/            # イベント処理
│   ├── main.ts       # Redis Pub/Subイベント配信
│   └── eventObj.ts   # イベントオブジェクト定義
├── redis/            # Redis管理
│   └── index.ts      # 接続管理 & 一時ストレージ
├── services/         # ビジネスロジック層
│   ├── index.ts      # サービスエクスポート
│   ├── internal/     # 内部サービス（15種類）
│   └── external/     # 外部連携サービス（8種類）
├── task/             # 非同期タスク管理
│   ├── main.ts       # タスク基盤 & ユーティリティ
│   ├── def.ts        # タスク型定義
│   └── types/        # ワーカー別タスク定義
└── job/              # 定期ジョブ基盤
    └── main.ts       # ジョブ実行ヘルパー
```

## 🔧 主要機能

### データベースアクセス層（db/）
- **論理削除対応**: `deleted: false`を自動付与
- **拡張メソッド**: findUniqueExists, findFirstExists, findManyExists
- **特殊DAO**: アカウント権限、商品在庫、レジ管理

### エラーハンドリング（error/）
```typescript
// カスタムエラー（内部/外部メッセージ分離）
throw new BackendCoreError({
  internalMessage: "DB connection failed",
  externalMessage: "システムエラーが発生しました"
});

// リトライデコレータ（指数バックオフ）
@RetryOnFailure(3, [TemporaryError])
async processPayment() { ... }
```

### イベント駆動（event/）
```typescript
// イベント発行
await ApiEvent.publish({
  type: 'PRODUCT_UPDATED',
  payload: { product_id: 123 }
});

// イベント購読
ApiEvent.subscribe('PRODUCT_UPDATED', handler);
```

### 内部サービス（services/internal/）
- **customer**: 顧客・ポイント管理
- **item**: 商品マスタ・バンドル処理
- **product**: 在庫・履歴・卸売価格
- **transaction**: 売買取引処理
- **ec**: EC注文・決済管理
- **reservation**: 予約スケジューリング
- **register**: レジ・シフト管理
- **store**: 店舗設定・営業時間
- **department**: 部門管理
- **sale**: 売上集計・統計
- **setDeal**: セット商品管理
- **csv**: インポート/エクスポート
- **log**: システムログ管理
- **ochanoko**: おちゃのこ在庫同期

### 外部サービス（services/external/）
- **aws**: S3/SES/CloudWatch連携
- **gmo**: GMO決済（OpenAPIクライアント）
- **square**: Square決済API
- **ochanoko**: おちゃのこネットAPI
- **expo**: プッシュ通知
- **gcp**: Google Cloud連携
- **mycaApp**: Mycaアプリ連携
- **pythonApi**: Python側API（購入テーブル）

### 非同期タスク（task/）
```typescript
// タスク定義（6種類のワーカー）
- ITEM_*: 商品関連処理
- PRODUCT_*: 在庫関連処理
- TRANSACTION_*: 取引関連処理
- EC_ORDER_*: EC注文処理
- EXTERNAL_EC_*: 外部EC連携
- SCHEDULED_*: スケジュール処理
- NOTIFICATION_*: 通知処理

// チャンク分割処理
await createTasksInChunks(items, 'PRODUCT_UPDATE', 100);
```

## 💡 使用パターン

### サービス利用
```typescript
import { customerService, productService } from '@mycalinks/backend-core';

// ポイント付与
await customerService.addPoints(customerId, points, reason);

// 在庫更新（履歴自動記録）
await productService.updateStock(productId, quantity, storeId);
```

### イベント連携
```typescript
// 商品更新イベント
await ApiEvent.publish({
  type: 'PRODUCT_UPDATED',
  storeId: 1,
  payload: { productIds: [1, 2, 3] }
});
```

### エラーハンドリング
```typescript
try {
  await processTransaction();
} catch (error) {
  if (error instanceof BackendCoreError) {
    logger.error(error.internalMessage);
    return res.status(500).json({ 
      error: error.externalMessage 
    });
  }
}
```

## 🗄️ データベース設計

### DAO実装の特徴
- **論理削除**: 全テーブルで`deleted`フラグ管理
- **マルチテナント**: store_idによるデータ分離
- **トランザクション**: Prismaトランザクション活用
- **履歴管理**: 在庫・ポイント変更履歴を自動記録

## 🔗 関連ディレクトリ

- [Prismaスキーマ](../prisma/)
- [APIエンドポイント](../../web-app/src/app/api/)
- [ワーカー実装](../../../workers/)
- [ジョブ実装](../../../jobs/)

## 📝 開発メモ

### パフォーマンス考慮事項
- Redisキャッシュの活用（TemporaryStorage）
- バッチ処理によるDB負荷軽減
- 非同期タスクの適切な分割（チャンクサイズ）
- イベント駆動による疎結合設計

### セキュリティ注意点
- エラーメッセージの内部/外部分離
- store_idによる厳密なアクセス制御
- 環境変数による機密情報管理
- SQLインジェクション対策（Prisma使用）

### ベストプラクティス
- サービス層でのビジネスロジック集約
- リトライ可能なエラーの適切な分類
- イベント発行による副作用の分離
- タスクの冪等性保証

---
*Backend-Agent作成: 2025-01-24*