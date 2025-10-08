# products/CLAUDE.md

## 🎯 目的・役割

商品（Product）ドメインに関する機能を提供するフィーチャーモジュール。在庫商品の検索、詳細表示、価格管理、在庫調整、ロス処理など、店舗スタッフが日常的に行う商品管理業務のUIコンポーネントとビジネスロジックを集約している。

## 🏗️ 技術構成

- **UIフレームワーク**: React 18 + TypeScript
- **コンポーネントライブラリ**: Material-UI (MUI)
- **状態管理**: React Hooks (カスタムフック)
- **データフェッチ**: SWR / React Query パターン
- **フォーム**: React Hook Form
- **バリデーション**: Zod

## 📁 ディレクトリ構造

```
products/
├── components/              # UIコンポーネント
│   ├── searchTable/        # 検索テーブル関連
│   └── *.tsx              # 各種商品関連コンポーネント
├── hooks/                  # カスタムフック（データ取得・更新）
├── loss/                   # ロス処理サブドメイン
│   ├── components/
│   └── hooks/
└── utils/                  # ユーティリティ関数
```

## 🔧 主要機能

### 商品検索・表示機能
- **ProductSearch**: 商品検索UI（バーコード、キーワード、カテゴリ）
- **ProductDetail**: 商品詳細情報表示
- **ProductDetailCard**: 商品情報カード表示
- **ConditionChip**: 商品コンディション表示チップ

### 在庫管理機能
- **在庫調整**: 在庫数の手動調整
- **振替処理**: 通常商品から特価商品への振替
- **複数商品処理**: バッチ処理による一括操作
- **スキャン機能**: バーコードスキャンによる商品追加

### 価格管理機能
- **ProductArrivalPriceSelect**: 仕入価格選択
- **卸売価格管理**: 卸売価格の設定・更新
- **価格履歴**: 価格変動履歴の追跡

### ロス処理機能
- **LossClassificationModal**: ロス分類選択モーダル
- **ロス理由管理**: ロス理由の選択・記録
- **ロス商品登録**: 破損・紛失商品の処理

### データ管理フック
- **useProducts**: 商品一覧取得
- **useProductsSearch**: 商品検索
- **useNewProductSearch**: 新規商品検索（ページネーション対応）
- **usePaginatedProductSearch**: ページング付き商品検索
- **useUpdateProduct**: 商品情報更新
- **usePostAdjustStock**: 在庫調整
- **useCreateTransfer**: 振替処理作成
- **useGetProductEcOrderHistory**: EC注文履歴取得

## 💡 使用パターン

### 商品検索の実装例
```typescript
// 商品検索フックの使用
const { products, isLoading, search } = useProductsSearch({
  storeId,
  keyword,
  categoryId
});

// 検索UIコンポーネントの配置
<ProductSearch 
  onSearch={search}
  onScanComplete={handleBarcodeScan}
/>
```

### 在庫調整の実装例
```typescript
// 在庫調整フックの使用
const { adjustStock, isLoading } = usePostAdjustStock();

// 在庫調整の実行
await adjustStock({
  productId,
  adjustmentQuantity,
  reason
});
```

## 🗺️ プロジェクト内での位置づけ

### 関連ドメインとの連携
- **Item（商品マスタ）**: 商品基本情報の参照
- **Transaction（取引）**: 販売・買取時の商品処理
- **Stock（在庫）**: 在庫数量の管理
- **EC**: オンライン販売商品の管理

### データフロー
```
[商品検索UI] → [Hooks] → [API] → [Backend] → [Database]
     ↓            ↓
[商品詳細表示] [状態更新]
```

## 🔗 関連ディレクトリ

- [../item/](../item/) - 商品マスタ管理
- [../stock/](../stock/) - 在庫管理機能
- [../sale/](../sale/) - 販売処理での商品利用
- [../purchase/](../purchase/) - 買取処理での商品評価
- [../../components/tables/](../../components/tables/) - 共通テーブルコンポーネント

## 📚 ドキュメント・リソース

### 内部仕様
- 商品IDフォーマット: `PRD-{storeId}-{sequence}`
- バーコード形式: JAN/EAN13, CODE128
- コンディション区分: 新品/中古A/中古B/中古C/ジャンク

### API連携
- `/api/store/{storeId}/product` - 商品CRUD
- `/api/store/{storeId}/product/search` - 商品検索
- `/api/store/{storeId}/product/adjust-stock` - 在庫調整

## 📝 開発メモ

### パフォーマンス考慮事項
- 商品検索は仮想スクロール実装で大量データ対応
- 画像は遅延読み込みで初期表示高速化
- 検索結果はSWRでキャッシュ管理

### ビジネスルール
- 在庫調整は理由必須（棚卸差異、破損、その他）
- ロス処理は承認者権限が必要
- 価格変更は履歴として全て記録

### 注意事項
- 商品削除は論理削除のみ（物理削除不可）
- 在庫0でも商品情報は保持
- EC連携商品は特別な更新制限あり

### 将来の拡張計画
- AI による商品画像認識
- 自動価格調整機能
- 在庫予測・発注提案
- 商品レコメンデーション

---
*Documentation-Agent作成: 2025-01-24*