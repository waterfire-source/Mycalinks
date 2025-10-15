# リスト表示コンポーネント

## 目的
商品リスト表示に特化したUIコンポーネント群

## 機能概要
- **テーブル表示**: 商品一覧のテーブル表示
- **モーダル操作**: 商品編集・削除モーダル
- **検索・フィルタ**: 検索バー・フィルタ機能
- **一括操作**: 複数商品の一括操作

## 内容概要
```
packages/web-app/src/app/auth/(dashboard)/ec/list/components/
├── modal/                      # モーダル関連
│   ├── EditProductModal.tsx    # 商品編集モーダル
│   ├── DeleteConfirmModal.tsx  # 削除確認モーダル
│   └── BulkEditModal.tsx       # 一括編集モーダル
└── table/                      # テーブル関連
    ├── ProductTable.tsx        # 商品一覧テーブル
    ├── SearchBar.tsx           # 検索バー
    └── FilterPanel.tsx         # フィルタパネル
```

## 重要ファイル
- `modal/`: 商品操作モーダル群
- `table/`: テーブル表示・操作コンポーネント群

## 使用パターン
```typescript
// 商品テーブル
<ProductTable 
  products={products}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onSelect={handleSelect}
/>

// 検索・フィルタ
<SearchBar 
  value={searchQuery}
  onChange={handleSearch}
  placeholder="商品名で検索"
/>

// 編集モーダル
<EditProductModal 
  product={selectedProduct}
  open={isEditModalOpen}
  onSave={handleSave}
  onClose={handleCloseModal}
/>
```

## 技術実装
- **MUI DataGrid**: 高性能テーブル表示
- **React Hook Form**: フォーム管理
- **Debounce**: 検索パフォーマンス最適化
- **Virtual Scrolling**: 大量データ対応

## 関連ディレクトリ
- `../hooks/` - リスト操作フック
- `../types/` - 型定義
- `../../stock/components/` - 在庫管理コンポーネント

## 開発メモ
- テーブルパフォーマンスの最適化
- モーダル状態管理の統一
- 検索・フィルタ機能の拡張性

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 