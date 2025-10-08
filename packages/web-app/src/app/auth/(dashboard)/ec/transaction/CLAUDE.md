# EC取引管理

## 目的
ECサイトでの取引履歴・売上分析・商品別売上管理を行うページ

## 実装されている機能

### メインページ (page.tsx - 7行)
- **シンプルな構造**: EcTransactionContentsCardコンポーネントのみ

### 取引管理コンテンツ (EcTransactionContentsCard.tsx - 385行)
- **取引一覧表示**: 取引履歴の一覧表示
- **取引詳細表示**: 個別取引の詳細情報表示
- **売上集計**: 取引合計金額の表示
- **検索・フィルタ**: 日付・商品名・ジャンル・プラットフォーム別検索
- **ページネーション**: 取引データの分割表示

### 検索・フィルタ機能
- **日付範囲**: 開始日・終了日による期間検索
- **取引ID**: 特定取引IDでの検索
- **商品名**: 商品名での部分一致検索
- **ジャンル**: ジャンル別フィルタ
- **プラットフォーム**: ECプラットフォーム別フィルタ
- **並び替え**: 受注日時での昇順・降順

## ファイル構成
```
transaction/
├── page.tsx                                    # メインページ（7行）
├── type.ts                                     # 型定義（43行）
├── components/
│   ├── EcTransactionContentsCard.tsx          # メインコンテンツ（385行）
│   ├── EcTransactionTab.tsx                   # タブ切り替え（205行）
│   ├── EcTransactionDetail.tsx                # 取引詳細（66行）
│   ├── EcTransactionDetailContent.tsx         # 取引詳細内容（140行）
│   ├── EcTransactionProductDetail.tsx         # 商品詳細（118行）
│   ├── EcTransactionProductDetailList.tsx    # 商品詳細一覧（62行）
│   └── ReturnTransactionModal.tsx             # 返品モーダル（27行）
└── product/                                   # 商品別売上管理
```

## 技術実装詳細

### 検索状態管理
```typescript
export interface EcOrderSearchState {
  transactionID?: number;           // 取引ID
  productName?: string;             // 商品名
  genreId?: number;                 // ジャンル ID
  platform?: PlatformKindEnum;      // プラットフォーム
  orderBy?: string;                 // 並び替え
  searchCurrentPage: number;        // 現在ページ
  searchItemPerPage: number;        // 1ページあたりのアイテム数
}

// 検索状態の初期値
const [searchState, setSearchState] = useState<EcOrderSearchState>({
  transactionID: undefined,
  productName: undefined,
  genreId: undefined,
  platform: undefined,
  orderBy: undefined,
  searchCurrentPage: 0,
  searchItemPerPage: 30,
});
```

### プラットフォーム管理
```typescript
export enum PlatformKindEnum {
  MYCALINKS = 'MYCALINKS',
  SHOPIFY = 'SHOPIFY',
  OCHANOKO = 'OCHANOKO',
}

export const platformKind = [
  { id: PlatformKindEnum.MYCALINKS, shopName: 'Mycalinks' },
  { id: PlatformKindEnum.SHOPIFY, shopName: 'Shopify' },
  { id: PlatformKindEnum.OCHANOKO, shopName: 'おちゃのこネット' },
];
```

### データ取得・処理
```typescript
// 取引データ取得API
const fetchEcTransactionData = useCallback(async () => {
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const response = await apiClient.ec.getEcOrderByStore({
    storeId: store.id,
    id: searchState.transactionID,
    orderBy: searchState.orderBy,
    skip: searchState.searchCurrentPage * searchState.searchItemPerPage,
    take: searchState.searchItemPerPage,
    includesSummary: true,
    orderedAtGte: dayjs(searchDate.startDate).toISOString(),
    orderedAtLt: dayjs(searchDate.endDate).toISOString(),
    productDisplayName: searchState.productName,
    genreId: searchState.genreId,
    platform: searchState.platform,
  });

  // 取引データ設定
  setTransactions(response.storeOrders);
  setSearchTotalCount(response.summary?.totalCount ?? 0);

  // 売上合計計算
  const totals = response.storeOrders.reduce(
    (acc: any, { total_price = 0 }: any) => {
      acc.sell += total_price;
      return acc;
    },
    { sell: 0 },
  );
  setTotalAmount(totals.sell);
}, [searchDate, searchState]);
```

### ページネーション
```typescript
// ページ変更処理
const handleRowPerPageChange = (newItemPerPage: number) => {
  setSearchState((prev) => ({
    ...prev,
    searchCurrentPage: 0,
    searchItemPerPage: newItemPerPage,
  }));
};

// 前のページ
const handlePrevPagination = () => {
  if (searchState.searchCurrentPage > 0) {
    setSearchState((prev) => ({
      ...prev,
      searchCurrentPage: prev.searchCurrentPage - 1,
    }));
  }
};

// 次のページ
const handleNextPagination = () => {
  if (searchState.searchCurrentPage * searchState.searchItemPerPage < searchTotalCount) {
    setSearchState((prev) => ({
      ...prev,
      searchCurrentPage: prev.searchCurrentPage + 1,
    }));
  }
};
```

### 日付範囲検索
```typescript
// 日付範囲の初期値設定
const [searchDate, setSearchDate] = useState(() => {
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  return {
    startDate: startDateParam || dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss'),
    endDate: endDateParam || dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
  };
});

// 日付変更処理
const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setSearchDate((prev) => ({
    ...prev,
    startDate: event.target.value,
  }));
};
```

## 主要コンポーネント

### EcTransactionTab (205行)
- **ジャンル別タブ**: ジャンル別の取引表示
- **タブ切り替え**: ジャンル選択による絞り込み

### EcTransactionDetail (66行)
- **取引詳細**: 個別取引の詳細情報表示
- **取引選択**: 取引一覧からの選択表示

### EcTransactionDetailContent (140行)
- **詳細内容**: 取引の詳細内容表示
- **商品情報**: 取引に含まれる商品情報

### EcTotalSales
- **売上集計**: 商品別売上の集計表示
- **売上分析**: 売上データの分析機能

## 使用パターン
1. **期間検索**: 日付範囲を設定して取引を検索
2. **フィルタ検索**: ジャンル・プラットフォーム・商品名で絞り込み
3. **取引詳細**: 取引一覧から個別取引を選択して詳細表示
4. **売上分析**: 商品別売上画面で売上分析
5. **ページング**: 大量データの分割表示

## 関連する主要フック
- **useGenre**: ジャンル情報の取得・管理
- **useStore**: 店舗情報の取得
- **useAlert**: エラー・成功メッセージの表示

## 関連ディレクトリ
- `product/`: 商品別売上管理
- `components/`: 取引管理関連コンポーネント
- `../list/`: 注文一覧との連携
- `../stock/`: 在庫管理との連携
- `/feature/genre/`: ジャンル管理機能

## 開発ノート
- **大量データ対応**: ページネーションによる効率的なデータ表示
- **リアルタイム検索**: 検索条件変更時の自動データ取得
- **売上分析**: 商品別・期間別の売上分析機能
- **プラットフォーム対応**: 複数ECプラットフォームの統一管理
- **日付処理**: dayjsによる日付範囲検索の実装 