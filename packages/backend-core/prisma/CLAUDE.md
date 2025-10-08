# packages/backend-core/prisma/CLAUDE.md

## 🎯 目的・役割

Prismaデータベース設計層 - MySQL 8.0データベースのスキーマ定義、マイグレーション管理、ストアドプロシージャ/トリガー実装。マルチテナント対応の大規模POSシステムデータベース。

## 🏗️ 技術構成

- **フレームワーク**: Prisma 6.6.0
- **ORM**: Prisma Client + Zod連携
- **データベース**: MySQL 8.0
- **主要技術**: 
  - マルチスキーマ構成（9ファイル分割）
  - 論理削除パターン
  - ストアドプロシージャ/トリガー
  - パーティショニング（DWH）
- **依存関係**: 
  - zod-prisma-types（Zod型生成）
  - MySQL固有機能（JSON型、Generated Columns）

## 📁 ディレクトリ構造

```
prisma/
├── schema/              # Prismaスキーマファイル群
│   ├── schema.prisma    # ジェネレータ・DB接続設定
│   ├── account.prisma   # 組織・権限管理（15テーブル）
│   ├── customer.prisma  # 顧客・ポイント（9テーブル）
│   ├── item.prisma      # 商品マスタ（14テーブル）
│   ├── product.prisma   # 在庫管理（25テーブル）
│   ├── transaction.prisma # 取引管理（16テーブル）
│   ├── ec.prisma        # EC機能（19テーブル）
│   ├── admin.prisma     # 管理機能（10テーブル）
│   ├── app.prisma       # アプリ連携（12テーブル）
│   ├── dwh.prisma       # データウェアハウス（5テーブル）
│   ├── migrations/      # マイグレーション履歴
│   └── readme.md        # 命名規則ドキュメント
├── stored/              # ストアドプロシージャ
│   └── procedure.mjs    # 価格計算・UUID生成等
├── triggers/            # トリガー定義
│   └── trigger.mjs      # 自動更新・整合性保持
├── admin-view/          # 管理画面用ビュー
│   └── product.sql      # phpMyAdmin用SQL
└── partition/           # パーティション設定
    └── dwh.sql          # DWH月次パーティション
```

## 🗄️ データベース設計

### スキーマ分割構成

#### 1. **account.prisma** - 組織・権限管理
- **Account**: ユーザーアカウント（店舗スタッフ）
- **Corporation**: 法人（マルチ法人対応）
- **Store**: 店舗（マルチテナントの基本単位）
- **Permission/Role**: RBAC権限管理
- **Register**: レジ端末管理

#### 2. **customer.prisma** - 顧客管理
- **Customer**: 顧客基本情報
- **Point_History**: ポイント履歴
- **Customer_Shipping_Address**: 配送先管理
- **Membership**: 会員ランク

#### 3. **item.prisma** - 商品マスタ
- **Item**: 商品基本情報（JAN/ISBN対応）
- **Item_Category/Genre**: 階層カテゴリ
- **Item_Condition**: コンディション選択肢
- **Item_Department**: 部門管理
- **Item_Bundle**: バンドル商品定義

#### 4. **product.prisma** - 在庫管理（最大・25テーブル）
- **Product**: 在庫商品（Item×コンディション×店舗）
- **Product_Stock_History**: 在庫変動履歴
- **Product_Tag**: 商品タグ（セール等）
- **Supplier**: 仕入先管理
- **Stocktaking**: 棚卸管理
- **Loss**: ロス管理

#### 5. **transaction.prisma** - 取引管理
- **Transaction**: 取引ヘッダ（販売/買取）
- **Transaction_Detail**: 取引明細
- **Payment**: 決済情報
- **Discount**: 割引管理
- **Transaction_Log**: 監査ログ

#### 6. **ec.prisma** - EC機能
- **EC_Order**: EC注文
- **EC_Cart**: カート管理
- **EC_Shipment**: 配送管理
- **Ochanoko_Product**: おちゃのこ連携

#### 7. **admin.prisma** - 管理機能
- **Contract**: 契約管理
- **Task**: タスク管理
- **System_Log**: システムログ
- **Outbox**: イベントソーシング

#### 8. **app.prisma** - Mycaアプリ連携
- **App_Advertisement**: アプリ広告
- **App_Launch**: 起動情報
- **Expo_Token**: プッシュ通知

#### 9. **dwh.prisma** - データウェアハウス
- **Dwh_Transaction_Daily**: 日次集計
- **Dwh_Product_Daily**: 在庫日次
- パーティション対応（月単位）

### 命名規則

```prisma
// テーブル名: PascalCase
model Product_Stock_History { ... }

// カラム名: snake_case
created_at DateTime
customer_id Int

// Enum名: PascalCase
enum TransactionKind { ... }

// Enum値: 大文字スネークケース
SALE
PURCHASE
```

### 特殊カラム規則
- 時刻: `*_at`（created_at, updated_at）
- 種類: `kind`（transaction_kind）
- 状態: `status`（order_status）
- 論理削除: `deleted`（Boolean）
- UUID: `id`（一部テーブルでUUID採用）

## 🔧 主要機能

### マルチテナント設計
```prisma
// 全テーブルにstore_id
model Product {
  store_id Int
  store Store @relation(...)
  @@index([store_id])
}
```

### 論理削除対応
```prisma
// deletedフラグで論理削除
model Item {
  deleted Boolean @default(false)
  @@index([deleted])
}
```

### ストアドプロシージャ
- `calculate_wholesale_price`: 卸売価格計算
- `generate_product_code`: 商品コード生成
- `update_inventory_status`: 在庫ステータス更新

### トリガー
- 商品価格自動更新
- 在庫数量整合性チェック
- ポイント残高自動計算
- 取引ステータス連動更新

## 💡 使用パターン

### マイグレーション実行
```bash
# 開発環境
pnpm run migrate:dev

# 本番環境（自動実行）
# production ブランチマージ時に自動

# ストアドプロシージャ更新
pnpm run migrateFunctions
```

### スキーマ変更フロー
1. 該当の`.prisma`ファイルを編集
2. `pnpm run prisma:generate`で型生成
3. `pnpm run migrate:dev`でマイグレーション作成
4. アプリケーションコードを更新
5. PRでレビュー→本番自動適用

## 🔗 関連ディレクトリ

- [ソースコード](../src/)
- [DAO実装](../src/db/dao/)
- [サービス層](../src/services/)
- [APIエンドポイント](../../web-app/src/app/api/)

## 📝 開発メモ

### パフォーマンス考慮事項
- 適切なインデックス設計（複合インデックス活用）
- パーティショニングによる大量データ対応
- Generated Columnsによる計算負荷軽減
- ビューによる複雑クエリの最適化

### セキュリティ注意点
- store_idによる完全なデータ分離
- 権限テーブルによるRBAC実装
- 監査ログの自動記録
- 論理削除によるデータ保護

### ベストプラクティス
- スキーマファイル分割による管理性向上
- 命名規則の厳格な遵守
- リレーション設計の正規化
- マイグレーションの段階的適用

### 注意事項
- 本番でのカラム削除は原則禁止
- 大規模テーブル変更は営業時間外実施
- インデックス追加は影響を事前検証
- ストアドプロシージャ変更は別途デプロイ

---
*Backend-Agent作成: 2025-01-24*