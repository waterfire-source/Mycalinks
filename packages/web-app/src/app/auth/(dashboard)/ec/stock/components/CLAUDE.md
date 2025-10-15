# EC在庫管理コンポーネント

## 目的
EC出品在庫管理の各種コンポーネントを提供するディレクトリ

## 実装されている機能

### 商品一覧・検索機能
- **EcProductList**: 出品商品の一覧表示とチェックボックス選択
- **EcProductNarrowDown**: 商品の絞り込み・並び替え機能
- **EcStockPageContent**: 在庫管理のメインコンテンツ

### モーダル機能
- **NewPublishProductModal**: 新規出品商品登録モーダル
- **DetailEcProductModal**: 商品詳細表示・編集モーダル
- **CancelSellModal**: 出品取り消しモーダル

## ファイル構成
```
components/
├── EcStockPageContent.tsx               # メインコンテンツ（155行）
├── EcProductList.tsx                    # 商品一覧表示（256行）
├── EcProductNarrowDown.tsx              # 絞り込み機能（196行）
├── NewPublishProductModal/              # 新規出品モーダル
│   ├── NewPublishProductModal.tsx       # メインモーダル（296行）
│   ├── NewPublishProductModalContent.tsx # モーダルコンテンツ（83行）
│   ├── ConfirmAllPublishProductModal.tsx # 全出品確認（47行）
│   ├── NewPublishProductList/           # 新規出品商品リスト
│   ├── SelectedProduct/                 # 選択商品
│   ├── SelectPlatForm/                  # プラットフォーム選択
│   └── ChangePrice/                     # 価格変更
├── DetailEcProductModal/                # 商品詳細モーダル
│   ├── DetailEcProductModal.tsx         # メインモーダル（98行）
│   ├── DetailEcProductModalContent.tsx  # モーダルコンテンツ（57行）
│   ├── DetailEcProduct/                 # 商品詳細
│   ├── ProductEcOrderHistory/           # 商品注文履歴
│   └── ConfirmCancelModal/              # 取り消し確認
└── CancelSellModal/                     # 出品取り消しモーダル
```

## 技術実装詳細

### EcProductList (256行) - 商品一覧表示
```typescript
// 商品データの変換
const productList = useMemo(() =>
  searchState.searchResults.map((element) => ({
    id: element.id,
    productImage: element.image_url,
    productName: element.displayNameWithMeta,
    condition: element.condition_option_display_name,
    ecSellPrice: element.actual_ec_sell_price,
    sellPrice: element.actual_sell_price,
    ecStockNumber: element.ec_stock_number,
    stockNumber: element.stock_number,
    mycalinksEcEnable: element.mycalinks_ec_enabled,
  })),
  [searchState.searchResults],
);

// チェックボックス選択処理
const handleCheckboxClick = (id: number) => {
  setSelectedIds((prev) => {
    if (prev.includes(id)) {
      return prev.filter((existingId) => existingId !== id);
    } else {
      return [...prev, id];
    }
  });
};
```

### DataGrid カラム設定
```typescript
const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: '',
    flex: 0.05,
    renderHeader: () => {
      // 全選択チェックボックス
      const allSelected = searchState.searchResults.length > 0 &&
        searchState.searchResults.every((row) => selectedIds.includes(row.id));
      const someSelected = searchState.searchResults.some((row) =>
        selectedIds.includes(row.id)) && !allSelected;

      return (
        <Checkbox
          indeterminate={someSelected}
          checked={allSelected}
          onChange={(event) => {
            if (event.target.checked) {
              const allIds = searchState.searchResults.map((row) => row.id);
              setSelectedIds(allIds);
            } else {
              setSelectedIds([]);
            }
          }}
        />
      );
    },
    renderCell: (params) => (
      <Checkbox
        checked={selectedIds.includes(params.row.id)}
        onChange={(event) => {
          event.stopPropagation();
          handleCheckboxClick(params.row.id);
        }}
      />
    ),
  },
  {
    field: 'productImage',
    headerName: '商品画像',
    renderCell: (params) => <ItemImage imageUrl={params.value} />,
  },
  {
    field: 'productName',
    headerName: '商品名',
    renderCell: (params) => <ItemText text={params.value} />,
  },
  {
    field: 'ecSellPrice',
    headerName: '出品価格（店舗価格）',
    renderCell: (params) => (
      <Typography>
        {params.row.ecSellPrice != null
          ? `${params.row.ecSellPrice.toString()}円`
          : '-円'}
        （{params.row.sellPrice != null
          ? `${params.row.sellPrice.toString()}円`
          : '-円'}）
      </Typography>
    ),
  },
  {
    field: 'sellingPlace',
    headerName: '出品先',
    renderCell: (params) => (
      // 出品先プラットフォームのアイコン表示
      <ShopIcon publishStoreInfos={publishStoreInfos} />
    ),
  },
];
```

### DetailEcProductModal (98行) - 商品詳細モーダル
```typescript
// 商品詳細の状態管理
const [actualEcSellPrice, setActualEcSellPrice] = useState<number>();
const [posReservedStockNumber, setPosReservedStockNumber] = useState<number>();
const [canDisableEcAutoStocking, setCanDisableEcAutoStocking] = useState<boolean>(false);

// 商品更新処理
const onPrimaryButtonClick = async () => {
  setPrimaryButtonLoading(true);
  try {
    const result = await updateProduct(store.id, productId, {
      posReservedStockNumber: posReservedStockNumber ?? null,
      specificEcSellPrice: actualEcSellPrice ?? null,
      disableEcAutoStocking: canDisableEcAutoStocking,
    });

    if (result.success) {
      onClose();
    }
  } catch (error) {
    console.error('更新中にエラーが発生しました', error);
  } finally {
    setPrimaryButtonLoading(false);
  }
};
```

### DetailEcProduct (241行) - 商品詳細表示
```typescript
// 商品詳細情報の表示
return (
  <Stack alignItems="center">
    <Stack mt={1}>
      <ItemImage imageUrl={searchState.searchResults[0]?.image_url} height={250} />
    </Stack>
    
    {/* 商品名 */}
    <Stack direction="row" justifyContent="space-between" width="70%" mt={2.5}>
      <ItemText text={searchState.searchResults[0]?.displayNameWithMeta} />
    </Stack>
    
    {/* 状態 */}
    <Stack direction="row" justifyContent="space-between" width="70%" mt={2}>
      <Typography>
        {searchState.searchResults[0]?.condition_option_display_name}
      </Typography>
    </Stack>
    
    {/* 店頭販売価格 */}
    <Stack direction="row" justifyContent="space-between" width="70%" mt={2}>
      <Typography>店頭販売価格</Typography>
      <Typography>
        {searchState.searchResults[0]?.actual_sell_price?.toString()}円
      </Typography>
    </Stack>
    
    {/* 出品価格（編集可能） */}
    <Stack direction="row" justifyContent="space-between" width="70%" alignItems="center" mt={2}>
      <Typography>出品価格</Typography>
      <NumericTextField
        value={searchState.searchResults[0]?.actual_ec_sell_price ?? actualEcSellPrice}
        onChange={handlePriceChange}
        sx={{ width: '100px' }}
        InputProps={{ sx: { height: 30 } }}
      />
    </Stack>
    
    {/* 店頭用在庫数（編集可能） */}
    <Stack direction="row" justifyContent="space-between" width="70%" mt={2}>
      <Stack direction="row" alignItems="center">
        <Typography>店頭用在庫数</Typography>
        <Tooltip
          title={
            <Typography>
              店頭用に確保し、ECに出品しない在庫数です。
              全体の設定よりも個別の設定が優先されます。
            </Typography>
          }
          placement="right"
          arrow
        >
          <IconButton size="small">
            <HelpSharpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <NumericTextField
        value={searchState.searchResults[0]?.pos_reserved_stock_number ?? posReservedStockNumber}
        onChange={handlePosStockNumberChange}
        sx={{ width: '100px' }}
      />
    </Stack>
  </Stack>
);
```

## 主要コンポーネント

### EcStockPageContent (155行)
- **メインレイアウト**: ContainerLayoutによるページ構成
- **検索機能**: ProductSearchによる商品検索
- **タブ機能**: ProductGenreTabによるジャンル切り替え
- **商品一覧**: EcProductListによる商品表示
- **モーダル管理**: 複数モーダルの状態管理

### EcProductNarrowDown (196行)
- **絞り込み条件**: 検索条件の設定・変更
- **並び替え**: 商品の並び替え機能
- **フィルタ**: 各種条件による商品フィルタリング

### NewPublishProductModal (296行)
- **新規出品**: 新しい商品の出品登録
- **プラットフォーム選択**: 出品先の選択
- **価格設定**: 出品価格の設定
- **一括出品**: 複数商品の一括出品

## 使用パターン
1. **商品一覧表示**: EcProductListで出品商品を一覧表示
2. **商品選択**: チェックボックスで複数商品を選択
3. **詳細編集**: 商品クリック→DetailEcProductModalで詳細編集
4. **新規出品**: 「新規出品商品登録」→NewPublishProductModalで出品
5. **出品取り消し**: 選択商品→CancelSellModalで取り消し

## 関連する主要フック
- **useStockSearch**: 在庫商品の検索・取得
- **useUpdateProduct**: 商品情報の更新
- **useStore**: 店舗情報の取得

## 関連ディレクトリ
- `../`: EC在庫管理メイン
- `/feature/products/`: 商品関連機能
- `/feature/ec/components/`: EC共通コンポーネント
- `/feature/item/components/`: 商品表示コンポーネント
- `/components/tables/`: テーブル表示コンポーネント

## 開発ノート
- **DataGrid活用**: Material-UI DataGridによる高機能な商品一覧
- **チェックボックス管理**: 全選択・個別選択の状態管理
- **モーダル階層**: 複数モーダルの重複管理
- **リアルタイム更新**: 編集後の即座なデータ更新
- **プラットフォーム対応**: 複数ECプラットフォームへの統一出品管理 