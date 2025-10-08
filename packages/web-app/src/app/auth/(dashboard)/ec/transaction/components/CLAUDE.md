# EC取引管理コンポーネント

## 目的
EC取引の詳細管理・表示・分析を行うコンポーネント群

## 実装されている機能

### 取引一覧・タブ機能
- **EcTransactionTab**: ジャンル別タブ・取引一覧表示・フィルタリング
- **EcTransactionContentsCard**: 取引管理のメインコンテンツ

### 取引詳細表示
- **EcTransactionDetail**: 取引詳細の表示
- **EcTransactionDetailContent**: 取引詳細内容
- **EcTransactionProductDetail**: 商品詳細情報
- **EcTransactionProductDetailList**: 商品詳細一覧

### 返品機能
- **ReturnTransactionModal**: 返品処理モーダル（未実装）

## ファイル構成
```
components/
├── EcTransactionContentsCard.tsx        # メインコンテンツ（385行）
├── EcTransactionTab.tsx                 # タブ・一覧表示（205行）
├── EcTransactionDetail.tsx              # 取引詳細（66行）
├── EcTransactionDetailContent.tsx       # 取引詳細内容（140行）
├── EcTransactionProductDetail.tsx       # 商品詳細（118行）
├── EcTransactionProductDetailList.tsx   # 商品詳細一覧（62行）
└── ReturnTransactionModal.tsx           # 返品モーダル（27行）
```

## 技術実装詳細

### EcTransactionTab (205行) - タブ・一覧表示
```typescript
// プラットフォーム情報の変換
const platformName = platformKind.map((item) => item.shopName);
const getPlatformValue = (platformKey: PlatformKindEnum | '' | null): string => {
  return platformKind.find((item) => item.id === platformKey)?.initial ?? '';
};

// 取引一覧のカラム定義
const transactionColumns: ColumnDef<EcOrderByStoreInfoType>[] = [
  {
    header: '注文番号',
    key: 'id',
    render: (item) => <Typography>{item.order.id}</Typography>,
  },
  {
    header: '商品',
    key: 'transaction_item',
    render: (item) => (
      <Box sx={{ display: 'flex', gap: '2px', flexDirection: 'column' }}>
        <ItemText
          text={item.products[0]?.displayNameWithMeta?.replace(/（/, '\n（') ?? ''}
          sx={{ fontWeight: 'bold', whiteSpace: 'pre-line' }}
        />
        <Typography
          sx={{
            backgroundColor: 'grey.300',
            padding: '2px 6px',
            borderRadius: '4px',
            display: 'inline-block',
          }}
        >
          他{item.products.length - 1}商品
        </Typography>
      </Box>
    ),
  },
  {
    header: '合計金額',
    key: 'total_price',
    render: (item) => item.total_price.toLocaleString() + '円',
  },
  {
    header: '受注日時',
    key: 'ordered_at',
    render: (item) => (
      <Box display="flex" flexDirection="column" alignItems="flex-start">
        <Typography>
          {dayjs(item.order.ordered_at).format('YYYY/MM/DD')}
        </Typography>
        <Typography sx={{ fontSize: '12px' }}>
          {dayjs(item.order.ordered_at).format('HH:mm')}
        </Typography>
      </Box>
    ),
    isSortable: true,
    onSortChange: (direction: 'asc' | 'desc' | undefined) => {
      handleSortOrderedAt(direction);
    },
  },
  {
    header: 'プラットフォーム',
    key: 'platform',
    render: (item) => (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            color: 'primary.main',
            border: '1px solid',
            borderRadius: '50%',
          }}
        >
          <Box
            sx={{
              fontWeight: 'bold',
              fontSize: '1rem',
              textAlign: 'center',
              padding: '6px',
            }}
          >
            {getPlatformValue(item.order.platform as PlatformKindEnum)}
          </Box>
        </Box>
      </Box>
    ),
    filterConditions: Object.values(platformName),
    filterDefaultValue: 'すべて',
    onFilterConditionChange: handlePlatformChange,
  },
];
```

### タブ定義
```typescript
// ジャンル別タブの定義
const productTabs: TabDef<EcOrderByStoreInfoType>[] = useMemo(() => {
  const tabs = [{ label: 'すべて', value: 'all' }];
  const genreOptions = genre?.itemGenres.map((genre) => ({
    label: genre.display_name,
    value: genre.id.toString(),
  }));
  return genreOptions ? tabs.concat(genreOptions) : tabs;
}, [genre]);
```

### CustomTabTable使用
```typescript
<CustomTabTable<EcOrderByStoreInfoType>
  data={transactions}
  columns={transactionColumns}
  tabs={productTabs}
  rowKey={(item) => item.order.id}
  onRowClick={handleTransactionChange}
  selectedRow={selectedTransaction}
  onTabChange={handleTabChange}
  isLoading={isLoading}
  variant="scrollable"
  scrollButtons={false}
  isShowFooterArea={true}
  currentPage={searchState.searchCurrentPage}
  rowPerPage={searchState.searchItemPerPage}
  totalRow={totalCount}
  handleRowPerPageChange={handleRowPerPageChange}
  handlePrevPagination={handlePrevPagination}
  handleNextPagination={handleNextPagination}
/>
```

### EcTransactionDetail (66行) - 取引詳細表示
```typescript
// 取引詳細の表示
const EcTransactionDetail = ({
  selectedTransaction,
  isReturnModalOpen,
  setIsReturnModalOpen,
}: Props) => {
  const transactionID = selectedTransaction ? selectedTransaction.order.id : null;

  return (
    <>
      <ReturnTransactionModal
        open={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onConfirm={() => {
          // 返品処理は未実装
        }}
        transactionId={transactionID}
      />
      <DetailCard
        title={`注文番号：${transactionID ?? ''}`}
        titleTextColor={'text.primary'}
        titleBackgroundColor={'common.white'}
        content={
          <EcTransactionDetailContent
            transactionID={transactionID}
            transaction={selectedTransaction}
          />
        }
        // 返品処理は未実装のためコメントアウト
        // bottomContent={
        //   transactionID ? (
        //     <SecondaryButtonWithIcon
        //       onClick={() => setIsReturnModalOpen(true)}
        //       disabled={isLoading}
        //     >
        //       返品
        //     </SecondaryButtonWithIcon>
        //   ) : (
        //     <></>
        //   )
        // }
      />
    </>
  );
};
```

### プラットフォーム表示
```typescript
// プラットフォームの円形アイコン表示
<Box
  sx={{
    width: 40,
    height: 40,
    color: 'primary.main',
    border: '1px solid',
    borderRadius: '50%',
  }}
>
  <Box
    sx={{
      fontWeight: 'bold',
      fontSize: '1rem',
      textAlign: 'center',
      padding: '6px',
    }}
  >
    {getPlatformValue(item.order.platform as PlatformKindEnum)}
  </Box>
</Box>
```

## 主要コンポーネント

### EcTransactionContentsCard (385行)
- **メインコンテンツ**: 取引管理の中心となるコンポーネント
- **検索・フィルタ**: 日付・商品名・ジャンル・プラットフォーム別検索
- **データ取得**: MycaPosApiClient による取引データ取得
- **売上集計**: 取引合計金額の計算・表示

### EcTransactionTab (205行)
- **タブ切り替え**: ジャンル別の取引表示
- **一覧表示**: CustomTabTable による高機能な取引一覧
- **ソート機能**: 受注日時による昇順・降順ソート
- **フィルタ機能**: プラットフォーム別フィルタリング
- **ページネーション**: 取引データの分割表示

### EcTransactionDetail (66行)
- **取引詳細**: 選択された取引の詳細情報表示
- **DetailCard**: 統一されたカード形式での詳細表示
- **返品モーダル**: 返品処理用モーダル（未実装）

### EcTransactionDetailContent (140行)
- **詳細内容**: 取引の詳細内容表示
- **商品情報**: 取引に含まれる商品情報の表示

### EcTransactionProductDetail (118行)
- **商品詳細**: 取引商品の詳細情報表示
- **商品画像**: 商品画像の表示
- **価格情報**: 商品価格・数量情報の表示

### EcTransactionProductDetailList (62行)
- **商品一覧**: 取引に含まれる商品の一覧表示
- **商品別詳細**: 各商品の詳細情報表示

### ReturnTransactionModal (27行)
- **返品モーダル**: 返品処理用モーダル
- **未実装**: 返品機能は未実装状態

## 使用パターン
1. **取引一覧表示**: EcTransactionTab で取引を一覧表示
2. **ジャンル切り替え**: タブでジャンル別に取引を絞り込み
3. **取引選択**: 取引をクリックして詳細表示
4. **詳細確認**: EcTransactionDetail で取引詳細を確認
5. **商品詳細**: 商品別の詳細情報を確認

## 関連する主要フック
- **useGenre**: ジャンル情報の取得・管理
- **useStore**: 店舗情報の取得
- **useAlert**: エラー・成功メッセージの表示

## 関連ディレクトリ
- `../`: EC取引管理メイン
- `/components/tabs/CustomTabTable`: 高機能タブテーブル
- `/components/cards/DetailCard`: 詳細カード表示
- `/feature/item/components/`: 商品表示コンポーネント
- `api-generator/client`: API クライアント

## 開発ノート
- **CustomTabTable活用**: 高機能なタブ・テーブル・ページネーション
- **プラットフォーム対応**: 複数ECプラットフォームの統一表示
- **日付処理**: dayjs による日付フォーマット
- **返品機能**: 未実装状態（コメントアウト）
- **レスポンシブ**: スクロール対応・フレキシブルレイアウト 