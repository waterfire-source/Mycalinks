# product/CLAUDE.md

## 🎯 目的・役割

店舗別製品管理API - 在庫商品の管理、入荷・出荷処理、ロット管理、製品ライフサイクル管理を提供する店舗固有のAPIエンドポイント。商品マスタ(item)と実在庫(product)を分離管理する。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14 API Routes
- **認証**: NextAuth.js (店舗別アクセス制御)
- **バリデーション**: Zod スキーマ
- **データベース**: Prisma ORM + MySQL
- **キャッシュ**: Redis (在庫状況)
- **イベント**: SQS (在庫変動通知)
- **依存関係**: backend-core/services/product

## 📁 ディレクトリ構造

```
product/
├── route.ts                    # メインAPIルート
├── [product_id]/
│   ├── route.ts               # 個別製品操作
│   ├── history/
│   │   └── route.ts           # 在庫履歴
│   └── transfer/
│       └── route.ts           # 店舗間移動
├── batch/
│   └── route.ts               # バッチ処理
├── arrival/
│   └── route.ts               # 入荷処理
└── inventory/
    └── route.ts               # 棚卸し
```

## 🔧 主要機能

### 製品CRUD操作
- **POST /api/store/[store_id]/product**: 新規製品登録
- **GET /api/store/[store_id]/product**: 製品一覧取得
- **PUT /api/store/[store_id]/product/[product_id]**: 製品情報更新
- **DELETE /api/store/[store_id]/product/[product_id]**: 製品削除

### 在庫管理
- **POST /api/store/[store_id]/product/arrival**: 入荷処理
- **PUT /api/store/[store_id]/product/[product_id]/transfer**: 店舗間移動
- **GET /api/store/[store_id]/product/[product_id]/history**: 在庫履歴

### 棚卸し・バッチ処理
- **POST /api/store/[store_id]/product/inventory**: 棚卸し実行
- **POST /api/store/[store_id]/product/batch**: バッチ更新

## 💡 使用パターン

### 入荷処理
```typescript
// POST /api/store/123/product/arrival
const arrivalData = {
  item_id: 456,
  quantity: 10,
  cost: 800,
  supplier_id: 1,
  lot_number: "LOT20250124",
  expiry_date: "2025-12-31"
}
```

### 在庫移動
```typescript
// PUT /api/store/123/product/789/transfer
const transferData = {
  to_store_id: 124,
  quantity: 5,
  reason: "店舗間補充",
  memo: "売れ筋商品の補充"
}
```

## 🗺️ プロジェクト内での位置づけ

- **上位層**: 店舗API統括
- **同位層**: 商品API、取引API
- **下位層**: 在庫履歴、移動履歴
- **連携先**: backend-core/services/product

## 🔗 関連ディレクトリ

- [../](../) - 店舗API統括
- [../item/](../item/) - 商品管理API
- [../inventory/](../inventory/) - 在庫管理API
- [../../../../feature/products/](../../../../feature/products/) - 製品管理UI

## 📝 開発メモ

### パフォーマンス考慮事項
- 在庫状況のリアルタイム更新
- 大量入荷データの分割処理
- 履歴データの効率的な取得

### セキュリティ注意点
- 店舗間移動の権限チェック
- 在庫調整の承認フロー
- ロット番号の一意性保証

---
*Backend-Agent作成: 2025-01-24* 