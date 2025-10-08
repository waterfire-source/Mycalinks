# リスト関連型定義

## 目的
商品リスト機能で使用する型定義・インターフェース

## 機能概要
- **商品型**: 商品データの型定義
- **リスト型**: 一覧表示用の型定義
- **検索型**: 検索・フィルタ用の型定義
- **操作型**: CRUD操作用の型定義

## 内容概要
```
packages/web-app/src/app/auth/(dashboard)/ec/list/types/
├── product.ts                  # 商品関連型定義
├── list.ts                     # リスト表示型定義
├── search.ts                   # 検索・フィルタ型定義
└── operations.ts               # 操作・API型定義
```

## 重要ファイル
- `product.ts`: 商品データ型定義
- `list.ts`: リスト表示・操作型定義
- `search.ts`: 検索・フィルタ型定義
- `operations.ts`: CRUD操作型定義

## 使用パターン
```typescript
// 商品型定義
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

// リスト表示型
interface ProductListProps {
  products: Product[];
  loading: boolean;
  error?: string;
  onSelect: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

// 検索・フィルタ型
interface SearchFilters {
  query: string;
  category?: string;
  priceRange?: [number, number];
  status?: ProductStatus[];
  sortBy: SortField;
  sortOrder: SortOrder;
}

// 操作型
interface ProductOperations {
  create: (data: CreateProductData) => Promise<Product>;
  update: (id: string, data: UpdateProductData) => Promise<Product>;
  delete: (id: string) => Promise<void>;
  bulkUpdate: (ids: string[], data: BulkUpdateData) => Promise<void>;
}
```

## 技術実装
- **TypeScript**: 厳密な型定義
- **Zod**: ランタイム型検証
- **Utility Types**: 型の再利用・変換
- **Generic Types**: 汎用的な型定義

## 関連ディレクトリ
- `../hooks/` - フック内での型利用
- `../components/` - コンポーネント内での型利用
- `../../stock/types/` - 在庫管理型定義

## 開発メモ
- 型の一貫性確保
- APIレスポンスとの整合性
- 型の拡張性・保守性
- バリデーションとの連携

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 