# item/CLAUDE.md

## 🎯 目的・役割

店舗別商品管理API - 商品マスタの登録・更新・削除、在庫管理、価格設定、商品検索機能を提供する店舗固有のAPIエンドポイント。POSシステムの商品管理の中核を担う。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14 API Routes
- **認証**: NextAuth.js (店舗別アクセス制御)
- **バリデーション**: Zod スキーマ
- **データベース**: Prisma ORM + MySQL
- **キャッシュ**: Redis (商品検索結果)
- **ファイル処理**: AWS S3 (商品画像)
- **依存関係**: backend-core/services/item

## 📁 ディレクトリ構造

```
item/
├── route.ts                    # メインAPIルート (26KB, 840行)
├── [item_id]/
│   ├── route.ts               # 個別商品操作
│   ├── stock/
│   │   └── route.ts           # 在庫操作
│   ├── price/
│   │   └── route.ts           # 価格設定
│   └── images/
│       └── route.ts           # 画像管理
├── search/
│   └── route.ts               # 商品検索
├── bulk/
│   └── route.ts               # 一括操作
└── categories/
    └── route.ts               # カテゴリ別取得
```

## 🔧 主要機能

### 商品CRUD操作
- **POST /api/store/[store_id]/item**: 新規商品登録
- **GET /api/store/[store_id]/item**: 商品一覧取得
- **PUT /api/store/[store_id]/item/[item_id]**: 商品情報更新
- **DELETE /api/store/[store_id]/item/[item_id]**: 商品削除

### 在庫管理
- **POST /api/store/[store_id]/item/[item_id]/stock**: 在庫調整
- **GET /api/store/[store_id]/item/[item_id]/stock**: 在庫履歴取得
- **PUT /api/store/[store_id]/item/[item_id]/stock**: 在庫数更新

### 価格管理
- **PUT /api/store/[store_id]/item/[item_id]/price**: 価格設定
- **GET /api/store/[store_id]/item/[item_id]/price/history**: 価格履歴

### 商品検索・フィルタリング
- **GET /api/store/[store_id]/item/search**: 高度検索
- **GET /api/store/[store_id]/item/categories**: カテゴリ別取得
- **GET /api/store/[store_id]/item/bulk**: 一括操作

## 💡 使用パターン

### 商品登録
```typescript
// POST /api/store/123/item
const newItem = {
  name: "商品名",
  category_id: 1,
  price: 1000,
  cost: 800,
  stock_quantity: 10,
  description: "商品説明",
  images: ["image1.jpg", "image2.jpg"]
}
```

### 商品検索
```typescript
// GET /api/store/123/item/search?q=商品名&category=1&min_price=100&max_price=1000
const searchParams = {
  q: "検索キーワード",
  category: 1,
  min_price: 100,
  max_price: 1000,
  in_stock: true,
  page: 1,
  limit: 20
}
```

### 在庫調整
```typescript
// POST /api/store/123/item/456/stock
const stockAdjustment = {
  adjustment_type: "increase", // increase, decrease, set
  quantity: 5,
  reason: "入荷",
  memo: "定期入荷分"
}
```

## 🗺️ プロジェクト内での位置づけ

- **上位層**: 店舗API統括 (`/api/store/[store_id]/`)
- **同位層**: 取引API、顧客API、在庫API
- **下位層**: 商品詳細操作、在庫履歴、価格履歴
- **連携先**: backend-core/services/item、Redis キャッシュ

## 🔗 関連ディレクトリ

- [../](../) - 店舗API統括
- [../product/](../product/) - 製品管理API
- [../inventory/](../inventory/) - 在庫管理API
- [../transaction/](../transaction/) - 取引API
- [../../../../feature/item/](../../../../feature/item/) - 商品管理UI
- [../../../../../backend-core/src/services/item/](../../../../../backend-core/src/services/item/) - ビジネスロジック

## 📚 ドキュメント・リソース

- Prisma Item Schema 定義
- 商品管理業務フロー図
- 在庫管理ルール仕様書
- 価格設定ポリシー

## 📝 開発メモ

### パフォーマンス考慮事項
- 商品検索結果のRedisキャッシュ (TTL: 5分)
- 画像アップロードの非同期処理
- 大量商品一覧のページネーション必須
- インデックス最適化 (name, category_id, store_id)

### セキュリティ注意点
- store_id による厳密なデータ分離
- 商品画像のファイル形式・サイズ制限
- 価格情報の変更履歴記録
- 在庫調整の権限チェック

### ベストプラクティス
- 商品コードの重複チェック
- 在庫マイナス値の制御
- 価格変更時の影響範囲確認
- 商品削除時の取引履歴保持

### 注意事項
- 商品削除は論理削除のみ
- 在庫調整は必ず履歴記録
- 価格変更は即座に反映
- 画像削除時のS3クリーンアップ

### 将来の拡張計画
- バーコード/QRコード対応
- 商品レコメンデーション機能
- 自動発注機能
- 商品分析ダッシュボード

---
*Backend-Agent作成: 2025-01-24* 