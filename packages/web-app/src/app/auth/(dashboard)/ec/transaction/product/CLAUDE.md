# EC商品別取引管理

## 目的
EC取引を商品別に集計・分析し、商品ごとの売上実績を管理するページ

## 実装されている機能

### メインページ (page.tsx - 7行)
- **シンプルな構造**: EcTransactionContentsCardForEachProductコンポーネントのみ

### 商品別取引管理 (EcTransactionContentsCardForEachProduct.tsx - 135行)
- **商品別集計**: 商品ごとの取引実績集計表示
- **期間検索**: 開始日・終了日による期間指定検索
- **売上合計**: 期間内の総売上金額表示
- **取引切り替え**: 「取引ごとに表示する」ボタンで取引一覧へ遷移
- **リアルタイム更新**: 検索条件変更時の自動データ更新

### 商品別分析機能
- **取引点数**: 商品別の取引された商品点数
- **取引件数**: 商品別の取引件数
- **売上金額**: 商品別の売上金額
- **ジャンル別表示**: ジャンル別の商品絞り込み

## ファイル構成
```
product/
├── page.tsx                                      # メインページ（7行）
└── components/
    ├── EcTransactionContentsCardForEachProduct.tsx # メインコンテンツ（135行）
    ├── EcProductList.tsx                          # 商品一覧表示（295行）
    ├── EcProductDetail.tsx                        # 商品詳細表示（175行）
    ├── EcSearchProduct.tsx                        # 商品検索（130行）
    ├── EcTotalSales.tsx                           # 売上合計（33行）
    └── EcTransactionCartDetailForProductList.tsx # 取引カート詳細（87行）
```

## 技術実装詳細

### 商品別取引データ取得
```typescript
// ECの在庫別取引一覧取得
const {
  items,
  searchState,
  searchTotalCount,
  totalAmount,
  searchDate,
  setSearchDate,
  setSearchState,
  fetchItemsWithEcOrder,
  isLoading,
} = useListItemWithEcOrder({ storeId: store.id, includesSummary: true });

// データ取得
useEffect(() => {
  if (store) {
    fetchItemsWithEcOrder();
  }
}, [fetchItemsWithEcOrder, store]);
```

### 日付範囲検索
```typescript
// 検索条件(取引開始日付) の処理
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

// 検索条件(取引終了日付) の処理
const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const selectedDate = event.target.value;
  setSearchDate((prev) => ({
    ...prev,
    endDate: selectedDate
      ? dayjs(selectedDate).endOf('day').format('YYYY/MM/DD HH:mm:ss')
      : '',
  }));
  setSearchState((prev) => ({
    ...prev,
    searchCurrentPage: 0,
  }));
};
```

### 取引一覧への遷移
```typescript
// 日付を保持して取引一覧へ遷移
const handleNavigateToTransactionView = () => {
  const queryParams = new URLSearchParams({
    startDate: searchDate.startDate,
    endDate: searchDate.endDate,
  }).toString();

  push(`${PATH.EC.transaction}?${queryParams}`);
};
```

### 商品一覧表示 (EcProductList.tsx - 295行)
```typescript
// 商品データの一意キー生成
const itemList = useMemo(() => {
  return items.map((item) => ({
    ...item,
    id: `${item.item_id}-${
      item.ecOrderCartStoreProducts
        ? item.ecOrderCartStoreProducts
            .map((ecOrderCartStoreProduct) => ecOrderCartStoreProduct.product.id)
            .toString()
        : ''
    }`,
  }));
}, [items]);

// カラム定義
const productColumns: ColumnDef<Item>[] = useMemo(() => {
  return [
    {
      header: '画像',
      key: 'image',
      render: (item) => (
        <ItemImage imageUrl={item.item.image_url ?? null} height={60} />
      ),
    },
    {
      header: '商品',
      key: 'productName',
      render: (item) => {
        const metaText = [
          item.item.expansion,
          item.item.cardnumber,
          item.item.rarity,
        ].filter(Boolean).join(' ');
        
        const displayMetaText = metaText ? `(${metaText})` : '';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <ItemText
              text={item.item.display_name ?? ''}
              sx={{ fontWeight: 'bold' }}
            />
            <Typography variant="caption">
              {displayMetaText}
            </Typography>
          </Box>
        );
      },
    },
    {
      header: '取引点数',
      key: 'tradeScore',
      render: (item) => (
        <Box minWidth="65px">
          {Number(item.ecOrderStats.ecOrderItemCount).toLocaleString()}
        </Box>
      ),
      isSortable: true,
      onSortChange: (direction) => {
        handleSort(direction, 'total_item_count');
      },
    },
    {
      header: '取引件数',
      key: 'tradeCount',
      render: (item) => (
        <Box minWidth="65px">
          {Number(item.ecOrderStats.ecOrderCount).toLocaleString()}
        </Box>
      ),
      isSortable: true,
      onSortChange: (direction) => {
        handleSort(direction, 'total_order_count');
      },
    },
  ];
}, []);
```

### ソート機能
```typescript
// サーバーサイドソート
const handleSort = (direction: 'asc' | 'desc' | undefined, sortBy: string) => {
  const field = `${direction === 'desc' ? '-' : ''}${sortBy}`;
  setSearchState((prev) => {
    const prevOrderBy = prev.orderBy || [];
    const existingIndex = prevOrderBy.findIndex(
      (order) => order.replace('-', '') === field.replace('-', ''),
    );
    const newOrderBy =
      existingIndex !== -1
        ? [
            ...prevOrderBy.slice(0, existingIndex),
            field,
            ...prevOrderBy.slice(existingIndex + 1),
          ]
        : [...prevOrderBy, field];
    return {
      ...prev,
      orderBy: newOrderBy,
      searchCurrentPage: 0,
    };
  });
};
```

## 主要コンポーネント

### EcTransactionContentsCardForEachProduct (135行)
- **メインコンテンツ**: 商品別取引管理の中心コンポーネント
- **レイアウト**: ContainerLayoutによるページ構成
- **日付検索**: 期間指定による取引データ絞り込み
- **遷移機能**: 取引一覧への遷移とクエリパラメータ引き継ぎ

### EcProductList (295行)
- **商品一覧**: CustomTabTableによる高機能な商品一覧表示
- **ジャンル別タブ**: ジャンル別の商品絞り込み
- **ソート機能**: 取引点数・取引件数による並び替え
- **ページネーション**: 大量データの分割表示

### EcSearchProduct (130行)
- **商品検索**: 商品名・期間による検索機能
- **日付ピッカー**: 開始日・終了日の選択
- **検索条件**: 商品名での部分一致検索

### EcTotalSales (33行)
- **売上合計**: 期間内の総売上金額表示
- **リアルタイム更新**: 検索条件変更時の自動更新

### EcProductDetail (175行)
- **商品詳細**: 選択商品の詳細情報表示
- **取引履歴**: 商品別の取引履歴表示

## 使用パターン
1. **期間設定**: 開始日・終了日を設定して期間を指定
2. **商品検索**: 商品名で検索して対象商品を絞り込み
3. **ジャンル選択**: タブでジャンル別に商品を絞り込み
4. **売上確認**: 期間内の総売上金額を確認
5. **詳細分析**: 商品をクリックして詳細な取引データを確認
6. **取引一覧**: 「取引ごとに表示する」で取引一覧へ遷移

## 関連する主要フック
- **useListItemWithEcOrder**: 商品別取引データの取得・管理
- **useGenre**: ジャンル情報の取得・管理
- **useStore**: 店舗情報の取得
- **useRouter**: ページ遷移とクエリパラメータ管理

## 関連ディレクトリ
- `../`: EC取引管理メイン（取引一覧）
- `components/`: 商品別取引管理コンポーネント
- `/feature/ec/hooks/`: EC関連フック
- `/feature/genre/hooks/`: ジャンル管理フック
- `/components/tabs/CustomTabTable`: 高機能タブテーブル

## 開発ノート
- **商品別集計**: 取引データの商品別集計と分析
- **期間検索**: dayjs による日付範囲検索の実装
- **CustomTabTable活用**: 高機能なタブ・テーブル・ページネーション
- **状態管理**: 複雑な検索条件の状態管理
- **遷移連携**: 取引一覧との連携とクエリパラメータ引き継ぎ

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 