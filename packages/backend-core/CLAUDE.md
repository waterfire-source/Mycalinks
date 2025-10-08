# packages/backend-core/CLAUDE.md

## 🎯 目的・役割

MycaLinks POSシステムのバックエンドコア - データベースアクセス、ビジネスロジック、外部サービス連携、非同期処理を一元管理するNode.jsバックエンドパッケージ。

## 🏗️ 技術構成

- **フレームワーク**: Node.js + TypeScript
- **ORM**: Prisma 6.6.0（MySQL対応）
- **データベース**: MySQL 8.0 + Redis
- **主要技術**: 
  - AWS SDK（S3, SQS, SES, CloudWatch, SNS）
  - Zod（バリデーション）
  - ioredis（Redis クライアント）
- **依存関係**: 
  - `@mycalinks/common`（共通ユーティリティ）
  - 決済系（GMO, Square）
  - 外部EC（おちゃのこネット, Shopify）

## 📁 ディレクトリ構造

```
packages/backend-core/
├── prisma/              # データベース関連
│   ├── schema/          # Prismaスキーマファイル（9ファイル分割）
│   │   ├── account.prisma    # アカウント・権限・組織
│   │   ├── customer.prisma   # 顧客・ポイント
│   │   ├── item.prisma      # 商品マスタ・部門
│   │   ├── product.prisma   # 在庫・タグ・仕入れ
│   │   ├── transaction.prisma # 取引・割引
│   │   ├── ec.prisma        # EC注文・カート
│   │   ├── admin.prisma     # 管理機能
│   │   ├── app.prisma       # アプリ設定
│   │   └── dwh.prisma       # データウェアハウス
│   ├── stored/          # ストアドプロシージャ
│   ├── triggers/        # トリガー
│   └── admin-view/      # 管理画面用ビュー
└── src/
    ├── db/              # データベースアクセス層
    │   ├── prisma.ts    # Prismaクライアント設定
    │   └── dao/         # データアクセスオブジェクト
    ├── services/        # ビジネスロジック層
    │   ├── internal/    # 内部サービス（15+）
    │   └── external/    # 外部連携サービス（8+）
    ├── task/            # 非同期タスク定義（SQS）
    ├── job/             # 定期ジョブモジュール
    ├── event/           # イベント処理
    ├── error/           # カスタムエラー定義
    └── redis/           # Redis pub/sub
```

## 🔧 主要機能

### 内部サービス（services/internal/）
- **customer**: 顧客管理、ポイント計算
- **item**: 商品マスタ管理、バンドル商品処理
- **product**: 在庫管理、在庫履歴、卸売価格計算
- **transaction**: 販売・買取取引処理
- **ec**: EC注文処理、決済連携
- **reservation**: 予約管理、スケジューリング
- **register**: レジ管理、シフト管理
- **store**: 店舗設定、営業時間管理
- **sale**: 売上集計、統計処理
- **csv**: データインポート/エクスポート

### 外部サービス（services/external/）
- **aws**: S3ファイル管理、SESメール送信
- **gmo**: GMO決済ゲートウェイ（OpenAPIクライアント）
- **square**: Square決済API
- **ochanoko**: おちゃのこネットEC連携
- **expo**: プッシュ通知送信
- **pythonApi**: Python側API連携（購入テーブル等）

## 💡 使用パターン

### サービス利用例
```typescript
import { productService } from '@mycalinks/backend-core/services';

// 在庫更新
await productService.updateStock({
  product_id: 123,
  quantity: 5,
  store_id: 1
});
```

### タスク定義例
```typescript
import { createTask } from '@mycalinks/backend-core/task';

// 非同期タスク作成
await createTask({
  type: 'TRANSACTION_PROCESS',
  payload: { transaction_id: 456 }
});
```

## 🗄️ データベース設計

### 主要テーブル群
- **組織系**: Account, Store, Corporation, Permission
- **商品系**: Item, Product, Product_Stock_History
- **取引系**: Transaction, Transaction_Detail, Payment
- **顧客系**: Customer, Point_History
- **EC系**: EC_Order, EC_Cart, EC_Shipment

### 特徴
- マルチテナント対応（store_id による分離）
- 論理削除対応（deleted フラグ）
- 履歴管理（Stock_History, Point_History等）
- イベントソーシング（Outbox パターン）

## 🔗 関連ディレクトリ

- [共通ライブラリ](../common/)
- [APIジェネレーター](../api-generator/)
- [Webアプリケーション](../web-app/)
- [ワーカー群](../../workers/)
- [ジョブ群](../../jobs/)

## 📝 開発メモ

### パフォーマンス考慮事項
- Prisma の N+1 問題回避（include の適切な使用）
- Redis によるクエリ結果キャッシュ
- バッチ処理による大量データ更新
- インデックス設計の最適化

### セキュリティ注意点
- store_id による厳密なデータ分離
- Zod によるバリデーション必須
- 環境変数による機密情報管理
- SQLインジェクション対策（Prisma使用）

### ベストプラクティス
- サービス層でのトランザクション管理
- エラーハンドリングの統一（カスタムエラークラス）
- 非同期処理はタスクキューへ委譲
- ログ出力の構造化（CloudWatch対応）

---
*Backend-Agent作成: 2025-01-24*