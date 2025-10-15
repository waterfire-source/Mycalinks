# packages/web-app/src/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/ProductEcOrderHistory/CLAUDE.md

## 🎯 目的・役割

商品別EC販売履歴表示コンポーネント群 - 特定商品のEC販売履歴を表示し、受注日時・単価・販売数による並び替え機能を提供する履歴管理システム。

## 🏗️ 技術構成

- **フレームワーク**: React + TypeScript
- **UI**: Material-UI 5.15.15
- **主要技術**: 
  - useProductEcOrderHistory（商品別注文履歴フック）
  - FormControl・Select（並び替え機能）
  - Stack レイアウト（履歴表示）
  - 700px固定高さ（スクロール対応）
- **依存関係**: 
  - useStore（店舗コンテキスト）
  - ProductEcOrderHistoryList（履歴一覧表示）

## 📁 ディレクトリ構造

```
packages/web-app/src/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/ProductEcOrderHistory/
├── ProductEcOrderHistory.tsx           # 履歴管理メインコンポーネント（109行）
├── ProductEcOrderHistoryList.tsx       # 履歴一覧表示コンポーネント（78行）
└── CLAUDE.md                           # 本ドキュメント
```

## 🔧 主要機能

### 1. 履歴表示システム
- **固定高さレイアウト**: 700px高さによる一定サイズ表示
- **赤色ヘッダー**: #b82a2a カラーによる視覚的な区別
- **白背景**: 明確な履歴表示エリア
- **スクロール対応**: 大量履歴データの効率的な表示

### 2. 並び替え機能
- **受注日時**: 販売日時による時系列並び替え
- **単価**: 商品単価による価格順並び替え
- **販売数**: 販売数量による数量順並び替え
- **なし**: デフォルト表示順

### 3. データ管理
- **商品別フィルタ**: 特定商品IDによる履歴絞り込み
- **サマリー情報**: includesSummary による集計情報取得
- **リアルタイム更新**: useEffect による自動データ取得

## 💡 使用パターン

### 基本的な使用方法
```typescript
// 商品別履歴表示
<ProductEcOrderHistory productId={productId} />
```

### 並び替え機能
```typescript
// 並び替え選択
<Select
  value={searchState.orderBy !== undefined ? searchState.orderBy : 'not'}
  onChange={handleOrderByChange}
  label="並び替え"
>
  <MenuItem value="not">なし</MenuItem>
  <MenuItem value={OrderByType.OrderedAt}>受注日時（販売日時）</MenuItem>
  <MenuItem value={OrderByType.TotalUnitPrice}>単価</MenuItem>
  <MenuItem value={OrderByType.ItemCount}>販売数</MenuItem>
</Select>
```

### データ取得パターン
```typescript
// 履歴データの取得
const { searchState, setSearchState, fetchEcOrderHistory } =
  useProductEcOrderHistory(productId, store.id, {
    includesSummary: true,
  });

// 初回データ取得
useEffect(() => {
  fetchEcOrderHistory();
}, [fetchEcOrderHistory]);
```

## 🎨 UI/UX設計

### レイアウト構成
```typescript
// メイン構造
<Stack mr={1}>
  <Typography fontWeight="bold">EC販売履歴</Typography>
  <Stack
    sx={{
      backgroundColor: 'white',
      flex: 1,
      borderTop: '8px solid #b82a2a',  // 赤色ヘッダー
      height: 700,                      // 固定高さ
    }}
  >
    {/* 並び替えコントロール */}
    <Stack direction="row" alignItems="center" justifyContent="flex-end">
      <FormControl size="small">
        <Select>{/* 並び替えオプション */}</Select>
      </FormControl>
    </Stack>
    
    {/* 履歴一覧 */}
    <ProductEcOrderHistoryList />
    
    {/* フッター */}
    <Stack sx={{ height: 50, borderTop: '1px solid grey.300' }} />
  </Stack>
</Stack>
```

### 並び替えオプション
```typescript
const OrderByType = {
  OrderedAt: 'ordered_at',        // 受注日時（販売日時）
  TotalUnitPrice: 'total_unit_price', // 単価
  ItemCount: 'item_count',        // 販売数
} as const;
```

## 🔗 API統合

### useProductEcOrderHistory フック
```typescript
const { searchState, setSearchState, fetchEcOrderHistory } =
  useProductEcOrderHistory(productId, store.id, {
    includesSummary: true, // サマリーを含めるかどうか
  });
```

### データ構造
```typescript
interface Props {
  productId: number;  // 商品を識別するためのID
}

// 並び替えタイプ
type OrderByType = 'ordered_at' | 'total_unit_price' | 'item_count';
```

### 状態管理
```typescript
// 並び替え変更処理
const handleOrderByChange = (event: SelectChangeEvent<string>) => {
  setSearchState((prev) => ({
    ...prev,
    orderBy: event.target.value === 'not'
      ? undefined
      : isValidOrderBy(event.target.value)
      ? (event.target.value as OrderByType)
      : undefined,
  }));
};

// バリデーション
const isValidOrderBy = (value: string): value is OrderByType => {
  const values = Object.values(OrderByType);
  return values.includes(value as OrderByType);
};
```

## 🚀 パフォーマンス最適化

### レンダリング最適化
- **固定高さ**: 700px による一定サイズでのレンダリング
- **条件付きレンダリング**: データ存在時のみ表示
- **useEffect最適化**: 依存関係の適切な管理

### データ管理効率化
- **商品別フィルタ**: 必要なデータのみ取得
- **サマリー情報**: 集計データによる効率的な表示
- **状態管理**: 最小限の状態による効率化

## 🔗 関連コンポーネント

- [../DetailEcProduct/](../DetailEcProduct/) - 商品詳細表示・編集
- [../DetailEcProductModal.tsx](../DetailEcProductModal.tsx) - 親モーダルコンポーネント
- [../ConfirmCancelModal/](../ConfirmCancelModal/) - 取り消し確認モーダル
- [/feature/products/hooks/](../../../../../../../feature/products/hooks/) - 商品関連フック

## 📝 開発メモ

### 実装の特徴
- **109行のメインコンポーネント**: 履歴表示・並び替え機能の統合
- **78行の一覧コンポーネント**: 効率的な履歴一覧表示
- **3つの並び替えオプション**: 時系列・価格・数量による多角的な分析
- **固定高さレイアウト**: 一貫したUI表示

### 技術的工夫
- **バリデーション**: isValidOrderBy による型安全な並び替え
- **状態管理**: setSearchState による効率的な状態更新
- **視覚的区別**: 赤色ヘッダーによる明確なセクション分離
- **スクロール対応**: 大量データの効率的な表示

### UI設計原則
- **一貫性**: 統一されたレイアウト・カラーリング
- **機能性**: 並び替えによる多角的なデータ分析
- **視認性**: 明確なヘッダー・フッターによる区域分離
- **使いやすさ**: 右上配置の並び替えコントロール

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 