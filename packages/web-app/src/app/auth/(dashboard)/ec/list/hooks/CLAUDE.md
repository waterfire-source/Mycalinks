# リスト操作フック

## 目的
商品リスト操作に関するカスタムフック群

## 機能概要
- **データ取得**: 商品一覧の取得・キャッシュ
- **検索・フィルタ**: 検索・フィルタリング機能
- **選択管理**: 商品選択状態の管理
- **CRUD操作**: 商品の作成・更新・削除

## 内容概要
```
packages/web-app/src/app/auth/(dashboard)/ec/list/hooks/
├── useProductList.ts           # 商品一覧取得・操作
├── useProductSearch.ts         # 検索・フィルタ機能
├── useProductSelection.ts      # 商品選択管理
└── useProductCrud.ts           # CRUD操作
```

## 重要ファイル
- `useProductList.ts`: 商品一覧の取得・管理
- `useProductSearch.ts`: 検索・フィルタ機能
- `useProductSelection.ts`: 選択状態管理
- `useProductCrud.ts`: CRUD操作

## 使用パターン
```typescript
// 商品一覧取得
const { products, loading, error, refetch } = useProductList({
  page: 1,
  limit: 50,
  sortBy: 'name',
  sortOrder: 'asc'
});

// 検索・フィルタ
const { 
  searchQuery, 
  setSearchQuery, 
  filteredProducts,
  filters,
  setFilters
} = useProductSearch(products);

// 選択管理
const {
  selectedIds,
  isAllSelected,
  handleSelect,
  handleSelectAll,
  clearSelection
} = useProductSelection(products);

// CRUD操作
const {
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdate,
  bulkDelete
} = useProductCrud();
```

## 技術実装
- **React Query**: データ取得・キャッシュ管理
- **Debounce**: 検索パフォーマンス最適化
- **Optimistic Updates**: 楽観的更新
- **Error Handling**: エラーハンドリング

## 関連ディレクトリ
- `../components/` - リスト表示コンポーネント
- `../types/` - 型定義
- `../../stock/hooks/` - 在庫管理フック

## 開発メモ
- データ取得の最適化
- 検索パフォーマンスの向上
- 選択状態の永続化
- エラーハンドリングの統一

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 