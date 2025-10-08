# packages/web-app/src/app/api/store/[store_id]/CLAUDE.md

## 🎯 目的・役割

店舗固有のAPI機能を提供するディレクトリ。店舗IDをパラメータとして受け取り、マルチテナント型のPOSシステムにおける店舗別データ管理・操作を実現する。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14 App Router + TypeScript
- **ORM**: Prisma 6.6.0
- **データベース**: MySQL + Redis (キャッシュ)
- **主要技術**: 
  - RESTful API設計
  - マルチテナント分離機構
  - Server-Side Events (SSE)
  - ファイルアップロード処理
- **依存関係**: 
  - packages/backend-core (ビジネスロジック)
  - packages/common (共通ユーティリティ)
  - packages/api-generator (型生成)

## 📁 ディレクトリ構造

```
[store_id]/
├── CLAUDE.md
├── route.ts                              # 店舗基本情報API
├── appraisal/                           # 査定管理
│   ├── [appraisal_id]/
│   │   └── result/
│   ├── readme.md
│   └── route.ts
├── customer/                            # 顧客管理
│   ├── [customer_id]/
│   │   ├── addable-point/
│   │   ├── point/
│   │   └── route.ts
│   ├── reservation-reception/
│   └── route.ts
├── ec/                                  # EC連携
│   ├── README.md
│   ├── order/                           # EC注文処理
│   ├── shipping-method/
│   └── publish-all-products/
├── functions/                           # 汎用機能
│   ├── upload-image/
│   └── readme.md
├── inventory/                           # 棚卸管理
│   ├── [inventory_id]/
│   ├── shelf/
│   └── route.ts
├── item/                               # 商品マスタ管理 (最重要)
│   ├── [item_id]/
│   ├── bundle/
│   ├── category/
│   ├── csv/
│   ├── department/
│   ├── genre/
│   ├── market-price/
│   └── route.ts                        # 26KB, 840行の重要API
├── loss/                               # ロス管理
├── product/                            # 在庫商品管理
│   ├── [product_id]/
│   ├── csv/
│   ├── set-deal/
│   ├── specialty/
│   ├── tag/
│   └── route.ts
├── purchase-table/                     # 買取テーブル
├── register/                           # レジスター管理
│   ├── [register_id]/
│   ├── cash-history/
│   └── settlement/
├── reservation/                        # 予約管理
├── sale/                              # 売上管理
├── stats/                             # 統計・分析
│   ├── product/
│   └── transaction/
├── stocking/                          # 入荷管理
├── subscribe-event/                   # リアルタイム更新
├── template/                          # テンプレート管理
└── transaction/                       # 取引管理
    ├── [transaction_id]/
    ├── csv/
    └── estimate/
```

## 📡 API仕様

- **エンドポイント**: `/api/store/[store_id]/*`
- **メソッド**: GET, POST, PUT, DELETE
- **リクエスト形式**: 
  - JSON形式
  - マルチパート（ファイルアップロード）
  - Server-Sent Events (購読系)
- **レスポンス形式**: 
  - JSON API仕様準拠
  - エラー統一フォーマット
  - ページネーション対応

### 主要エンドポイント群

1. **商品管理** (`/item`) - 最重要API (26KB)
2. **在庫管理** (`/product`) - 在庫操作・履歴
3. **取引管理** (`/transaction`) - POS取引処理
4. **顧客管理** (`/customer`) - 顧客情報・ポイント
5. **EC連携** (`/ec`) - オンラインストア統合
6. **統計** (`/stats`) - ダッシュボード・レポート

## 🔧 主要機能

### マルチテナント分離
- 店舗IDによるデータ分離
- 認証・認可によるアクセス制御
- 店舗固有設定の管理

### 商品・在庫管理
- 商品マスタ作成・編集
- 在庫追跡・履歴管理
- バンドル商品・パック開封
- コンディション別在庫管理

### POS取引処理
- 販売取引作成・処理
- 返品・キャンセル対応
- 複数決済方法対応
- レシート生成

### EC統合
- 外部ECプラットフォーム連携
- 在庫同期・注文処理
- 配送方法管理

### リアルタイム更新
- Server-Sent Events
- 在庫変動の即座反映
- 取引状況のライブ更新

## 💡 使用パターン

### 基本的なCRUD操作
```typescript
// GET /api/store/1/item - 商品一覧取得
// POST /api/store/1/item - 新規商品作成
// PUT /api/store/1/item/123 - 商品更新
// DELETE /api/store/1/item/123 - 商品削除
```

### 複雑な業務処理
```typescript
// POST /api/store/1/product/123/open-pack - パック開封
// POST /api/store/1/transaction/456/return - 返品処理
// GET /api/store/1/stats/product/by-genre - ジャンル別統計
```

### リアルタイム購読
```typescript
// GET /api/store/1/subscribe-event - SSE接続
// GET /api/store/1/item/123/subscribe - 商品変更購読
```

## 🗄️ データベース設計

### 主要テーブル関連
- **Store**: 店舗マスタ
- **Item**: 商品マスタ（カテゴリ・ジャンル含む）
- **Product**: 在庫商品（コンディション・価格）
- **Transaction**: 取引（販売・買取）
- **Customer**: 顧客（ポイント・履歴）
- **EC_Order**: EC注文
- **Register**: レジスター・決済

### 主要フィールド
- **store_id**: 店舗識別子（全テーブル共通）
- **item_id**: 商品マスタID
- **product_id**: 在庫商品ID
- **transaction_id**: 取引ID
- **customer_id**: 顧客ID

### インデックス設計
- 店舗ID + エンティティIDの複合インデックス
- 検索用フィールドの個別インデックス
- 履歴テーブルの時系列インデックス

## 🔗 関連ディレクトリ

- [バックエンドコア](../../../../../../../backend-core/) - ビジネスロジック
- [共通ライブラリ](../../../../../../../common/) - ユーティリティ
- [API生成器](../../../../../../../api-generator/) - 型定義
- [店舗APIルート](../) - 上位ディレクトリ
- [認証API](../../auth/) - 認証機能

## 📝 開発メモ

### パフォーマンス考慮事項
- 店舗IDによるデータ分離でクエリ最適化
- Redisキャッシュによる頻繁アクセスデータの高速化
- ページネーションによる大量データ制御
- インデックス設計による検索性能向上

### セキュリティ注意点
- 店舗ID検証による不正アクセス防止
- 認証トークンの店舗スコープ確認
- SQLインジェクション対策（Prisma ORM）
- ファイルアップロード時の検証・サニタイズ

### ベストプラクティス
- マルチテナント分離の徹底
- エラーハンドリングの統一
- ログ出力による操作追跡
- API仕様の一貫性維持
- レスポンス時間の監視

### 特別重点項目
- **item API**: 最も複雑で重要（26KB, 840行）
- **transaction API**: 決済・POS処理の核
- **product API**: 在庫管理の中核
- **subscribe-event**: リアルタイム性の要

---
*Backend-Agent作成: 2025-01-24*