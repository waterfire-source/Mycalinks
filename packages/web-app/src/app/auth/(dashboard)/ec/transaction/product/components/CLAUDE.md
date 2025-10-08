# packages/web-app/src/app/auth/(dashboard)/ec/transaction/product/components/CLAUDE.md

## 🎯 目的・役割

EC商品別取引管理コンポーネント群 - 商品単位でのEC取引分析を行う高度な分析システム。取引履歴・売上統計・商品検索機能を統合し、商品別の詳細な取引分析を提供する。

## 🏗️ 技術構成

- **フレームワーク**: React + TypeScript
- **UI**: Material-UI 5.15.15 + CustomTabTable
- **主要技術**: 
  - useListItemWithEcOrder（商品別取引データフック）
  - CustomTabTable（高性能タブ付きテーブル）
  - dayjs（日付処理）
  - サーバーサイドソート・ページネーション
  - 6コンポーネント総計860行の統合システム
- **依存関係**: 
  - useStore（店舗コンテキスト）
  - useGenre（ジャンル管理）
  - ContainerLayout（レイアウト）

## 📁 ディレクトリ構造

```
packages/web-app/src/app/auth/(dashboard)/ec/transaction/product/components/
├── EcTransactionContentsCardForEachProduct.tsx    # メインコンテナ（135行）
├── EcProductList.tsx                               # 商品一覧・タブ管理（295行）
├── EcSearchProduct.tsx                             # 商品検索フォーム（130行）
├── EcProductDetail.tsx                             # 商品詳細・取引履歴（175行）
├── EcTransactionCartDetailForProductList.tsx      # 取引詳細カード（87行）
├── EcTotalSales.tsx                                # 売上合計表示（33行）
└── CLAUDE.md                                       # 本ドキュメント
```

## 🔧 主要機能

### 1. メインコンテナ機能（EcTransactionContentsCardForEachProduct）
- **統合管理**: 全コンポーネントの統合・データフロー制御
- **日付範囲検索**: 取引開始日・終了日による期間指定
- **ページ遷移**: 「取引ごとに表示する」への切り替え機能
- **データ同期**: useListItemWithEcOrder による統一データ管理

### 2. 商品一覧・タブ管理（EcProductList）
- **ジャンル別タブ**: 「すべて」+ 各ジャンルタブによる分類表示
- **サーバーサイドソート**: 取引点数・取引件数・売上金額での並び替え
- **ページネーション**: 大量商品データの効率的な表示
- **商品詳細表示**: 選択商品の詳細取引履歴表示

### 3. 高度な検索機能（EcSearchProduct）
- **商品名検索**: 部分一致による商品名検索
- **型番検索**: カード番号による絞り込み
- **レアリティ検索**: レアリティによる分類
- **日付範囲検索**: 取引日時の期間指定

### 4. 商品詳細分析（EcProductDetail）
- **取引統計**: 取引件数・取引点数の表示
- **取引履歴**: 個別取引の詳細一覧
- **ローディング状態**: 適切なローディング・エラー表示
- **動的更新**: 商品選択時の自動データ更新

### 5. 取引詳細表示（EcTransactionCartDetailForProductList）
- **取引情報**: 取引ID・日時・商品状態の表示
- **価格情報**: 単価・数量・商品合計の詳細表示
- **条件表示**: TagLabel による商品状態の視覚的表示
- **レイアウト**: 6:6 Grid による情報の整理

### 6. 売上合計表示（EcTotalSales）
- **リアルタイム集計**: 表示中商品の合計売上表示
- **読み取り専用**: TextField による数値の明確な表示
- **フォーマット**: 3桁区切り + 円表示

## 💡 使用パターン

### 基本的な使用方法
```typescript
// メインコンテナ
<EcTransactionContentsCardForEachProduct />

// 個別コンポーネント
<EcProductList
  storeId={store.id}
  items={items}
  searchTotalCount={searchTotalCount}
  searchState={searchState}
  setSearchState={setSearchState}
  searchDate={searchDate}
  isLoading={isLoading}
/>
```

### データ構造
```typescript
// 商品別取引検索状態
interface ItemWithEcOrderSearchState {
  displayName?: string;        // 商品名
  cardNumber?: string;         // 型番
  rarity?: string;            // レアリティ
  genreId?: number;           // ジャンルID
  itemId?: number;            // 商品ID
  searchCurrentPage: number;   // 現在ページ
  orderBy?: string[];         // ソート条件
}

// 日付範囲
interface SearchDate {
  startDate: string;          // 開始日時
  endDate: string;           // 終了日時
}
```

### 状態管理パターン
```typescript
// 日付変更処理
const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const selectedDate = event.target.value;
  setSearchDate((prev) => ({
    ...prev,
    startDate: selectedDate
      ? dayjs(selectedDate).startOf('day').format('YYYY/MM/DD HH:mm:ss')
      : '',
  }));
  setSearchState((prev) => ({
    ...prev,
    searchCurrentPage: 0,
  }));
};

// ソート処理
const handleSort = (direction: 'asc' | 'desc' | undefined, sortBy: string) => {
  const field = `${direction === 'desc' ? '-' : ''}${sortBy}`;
  setSearchState((prev) => {
    const prevOrderBy = prev.orderBy || [];
    const existingIndex = prevOrderBy.findIndex(
      (order) => order.replace('-', '') === field.replace('-', ''),
    );
    const newOrderBy = existingIndex !== -1
      ? [...prevOrderBy.slice(0, existingIndex), field, ...prevOrderBy.slice(existingIndex + 1)]
      : [...prevOrderBy, field];
    return {
      ...prev,
      orderBy: newOrderBy,
      searchCurrentPage: 0,
    };
  });
};
```

## 🎨 UI/UX設計

### メインレイアウト
```typescript
// コンテナレイアウト
<ContainerLayout
  title="EC取引一覧"
  actions={
    <PrimaryButton onClick={handleNavigateToTransactionView}>
      取引ごとに表示する
    </PrimaryButton>
  }
>
  {/* 検索・売上合計 */}
  <Grid container sx={{ height: '40px', gap: 1, mt: 1 }}>
    <EcSearchProduct />
    <EcTotalSales totalAmount={totalAmount} />
  </Grid>

  {/* 商品リスト */}
  <Grid container spacing={1} sx={{ flex: 1, overflow: 'auto', mt: 1 }}>
    <EcProductList />
  </Grid>
</ContainerLayout>
```

### タブ・テーブル構成
```typescript
// カラム定義
const productColumns: ColumnDef<Item>[] = [
  {
    header: '画像',
    key: 'image',
    render: (item) => <ItemImage imageUrl={item.item.image_url} height={60} />,
  },
  {
    header: '商品',
    key: 'productName',
    render: (item) => (
      <Box>
        <ItemText text={item.item.display_name} sx={{ fontWeight: 'bold' }} />
        <Typography variant="caption">
          {[item.item.expansion, item.item.cardnumber, item.item.rarity]
            .filter(Boolean).join(' ')}
        </Typography>
      </Box>
    ),
  },
  {
    header: '取引点数',
    key: 'tradeScore',
    render: (item) => item.ecOrderStats.ecOrderItemCount.toLocaleString(),
    isSortable: true,
    onSortChange: (direction) => handleSort(direction, 'total_item_count'),
  },
  {
    header: '取引件数',
    key: 'tradeCount',
    render: (item) => item.ecOrderStats.ecOrderCount.toLocaleString(),
    isSortable: true,
    onSortChange: (direction) => handleSort(direction, 'total_order_count'),
  },
];
```

### 検索フォーム
```typescript
// 検索フィールド群
<TextField
  label="商品名"
  size="small"
  value={searchState.displayName}
  onChange={(event) => setSearchState(prev => ({
    ...prev,
    displayName: event.target.value,
  }))}
  sx={{ width: 150, backgroundColor: 'white' }}
/>

<TextField
  label="型番"
  size="small"
  value={searchState.cardNumber}
  sx={{ width: 100, backgroundColor: 'white' }}
/>

// 日付範囲選択
<TextField
  label="取引日時"
  type="date"
  size="small"
  value={searchDate.startDate ? dayjs(searchDate.startDate).format('YYYY-MM-DD') : ''}
  onChange={handleStartDateChange}
  sx={{ width: 160, backgroundColor: 'white' }}
/>
```

## 🔗 API統合

### useListItemWithEcOrder フック
```typescript
const {
  items,                    // 商品リスト
  searchState,             // 検索状態
  searchTotalCount,        // 検索結果総数
  totalAmount,             // 合計売上
  searchDate,              // 検索日付
  setSearchDate,           // 日付設定
  setSearchState,          // 検索状態設定
  fetchItemsWithEcOrder,   // データ取得
  isLoading,               // ローディング状態
} = useListItemWithEcOrder({ 
  storeId: store.id, 
  includesSummary: true 
});
```

### データフロー
```typescript
// 初期データ取得
useEffect(() => {
  if (store) {
    fetchItemsWithEcOrder();
  }
}, [fetchItemsWithEcOrder, store]);

// 商品選択時の詳細データ取得
useEffect(() => {
  if (itemId && itemId === searchState.itemId) {
    fetchItemsWithEcOrder();
  }
}, [itemId, searchState.itemId, fetchItemsWithEcOrder]);
```

## 🚀 パフォーマンス最適化

### レンダリング最適化
- **useMemo**: itemList・productTabs・productColumns の最適化
- **条件付きレンダリング**: ローディング・エラー状態の適切な表示
- **仮想化**: CustomTabTable による効率的な大量データ表示

### データ管理効率化
- **サーバーサイドソート**: クライアント負荷軽減
- **ページネーション**: 必要なデータのみ取得
- **状態統合**: 単一フックによる一元管理

## 🔗 関連コンポーネント

- [../page.tsx](../page.tsx) - 商品別取引管理ページ
- [../../transaction/](../../transaction/) - 取引別管理システム
- [/feature/ec/hooks/useListItemWithEcOrder](../../../../../../../feature/ec/hooks/) - 商品別取引データフック
- [/components/tabs/CustomTabTable](../../../../../../../components/tabs/) - 高性能タブテーブル
- [/feature/genre/hooks/useGenre](../../../../../../../feature/genre/hooks/) - ジャンル管理フック

## 📝 開発メモ

### 実装の特徴
- **860行の統合システム**: 6コンポーネントによる商品別取引分析
- **CustomTabTable活用**: ジャンル別タブ + ソート機能の高度な一覧表示
- **サーバーサイド処理**: ソート・ページネーション・検索の効率化
- **詳細分析機能**: 商品選択による詳細取引履歴表示

### 技術的工夫
- **状態同期**: 日付・検索条件・ページネーションの統合管理
- **動的キー生成**: `${item.item_id}-${productIds}` による一意性確保
- **複合ソート**: 複数条件による高度なソート機能
- **日付処理**: dayjs による正確な日時フォーマット

### UI設計原則
- **分析性**: 商品別の詳細な取引分析機能
- **検索性**: 多角的な検索条件による絞り込み
- **視認性**: 画像・統計・詳細情報の明確な表示
- **操作性**: タブ・ソート・ページネーションの直感的な操作

### データ分析機能
- **取引統計**: 点数・件数・売上の包括的な分析
- **期間分析**: 日付範囲による時系列分析
- **商品分析**: ジャンル・商品別の詳細分析
- **取引詳細**: 個別取引の詳細情報表示

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 