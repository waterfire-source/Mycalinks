# EC商品詳細モーダル

## 目的
EC出品商品の詳細表示・編集・取り消しを行うモーダルコンポーネント

## 実装されている機能

### メインモーダル (DetailEcProductModal.tsx - 98行)
- **商品詳細表示**: 出品中商品の詳細情報表示
- **商品編集**: 出品価格・店頭在庫数の編集
- **出品取り消し**: 商品の出品取り消し機能
- **3ボタン構成**: 保存・破棄・取り消しの操作

### 編集可能項目
- **出品価格**: 個別商品の出品価格設定
- **店頭用在庫数**: 店頭確保在庫数の設定
- **自動補充無効**: EC自動補充の無効化設定

## ファイル構成
```
DetailEcProductModal/
├── DetailEcProductModal.tsx             # メインモーダル（98行）
├── DetailEcProductModalContent.tsx      # モーダルコンテンツ（57行）
├── DetailEcProduct/
│   └── DetailEcProduct.tsx              # 商品詳細表示（241行）
├── ProductEcOrderHistory/               # 商品注文履歴
└── ConfirmCancelModal/                  # 取り消し確認モーダル
    └── ConfirmCancelModal.tsx
```

## 技術実装詳細

### モーダル状態管理
```typescript
// 編集可能な状態の管理
const [actualEcSellPrice, setActualEcSellPrice] = useState<number>();
const [posReservedStockNumber, setPosReservedStockNumber] = useState<number>();
const [canDisableEcAutoStocking, setCanDisableEcAutoStocking] = useState<boolean>(false);

// 更新処理のローディング状態
const [primaryButtonLoading, setPrimaryButtonLoading] = useState<boolean>(false);
```

### 商品更新処理
```typescript
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

### CustomModalWithIcon設定
```typescript
<CustomModalWithIcon
  open={open}
  onClose={onClose}
  title="出品中の商品"
  width="90%"
  height="90%"
  actionButtonText="変更を保存"
  onActionButtonClick={onPrimaryButtonClick}
  loading={primaryButtonLoading}
  cancelButtonText="編集内容を破棄"
  onCancelClick={onClose}
  secondActionButtonText="出品を取り消す"
  onSecondActionButtonClick={() => setIsConfirmCancelModalOpen(true)}
>
```

## DetailEcProduct (241行) - 商品詳細表示コンポーネント

### 商品情報表示
```typescript
// 商品基本情報の表示
<Stack alignItems="center">
  {/* 商品画像 */}
  <Stack mt={1}>
    <ItemImage imageUrl={searchState.searchResults[0]?.image_url} height={250} />
  </Stack>
  
  {/* 商品名 */}
  <Stack direction="row" justifyContent="space-between" width="70%" mt={2.5}>
    <ItemText text={searchState.searchResults[0]?.displayNameWithMeta} />
  </Stack>
  
  {/* 商品状態 */}
  <Stack direction="row" justifyContent="space-between" width="70%" mt={2}>
    <Typography>
      {searchState.searchResults[0]?.condition_option_display_name}
    </Typography>
  </Stack>
  
  {/* 店頭販売価格（表示のみ） */}
  <Stack direction="row" justifyContent="space-between" width="70%" mt={2}>
    <Typography>店頭販売価格</Typography>
    <Typography>
      {searchState.searchResults[0]?.actual_sell_price?.toString()}円
    </Typography>
  </Stack>
</Stack>
```

### 編集可能フィールド
```typescript
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

{/* 自動出品価格（参考表示） */}
<Stack direction="row" justifyContent="space-between" width="70%">
  <Typography>（自動出品価格）</Typography>
  <Typography>
    （{searchState.searchResults[0]?.ec_sell_price?.toString() ?? '-'}円）
  </Typography>
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
```

### ヘルプ機能
```typescript
// Tooltipによるヘルプ表示
const [open, setOpen] = useState(false);
const [hovering, setHovering] = useState(false);

<Tooltip
  open={open}
  onClose={() => setOpen(false)}
  title={<Typography>説明文</Typography>}
  placement="right"
  arrow
  componentsProps={{
    tooltip: {
      sx: {
        backgroundColor: 'white',
        color: 'black',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
        border: '1px solid #ccc',
      },
    },
    arrow: {
      sx: { color: 'white' },
    },
  }}
>
  <IconButton
    size="small"
    onClick={() => setOpen((prev) => !prev)}
    onMouseEnter={() => {
      setHovering(true);
      handleOpen();
    }}
    onMouseLeave={() => {
      setHovering(false);
      handleClose();
    }}
  >
    <HelpSharpIcon fontSize="small" />
  </IconButton>
</Tooltip>
```

## 主要コンポーネント

### DetailEcProductModal (98行)
- **モーダル管理**: CustomModalWithIconによる統一モーダル
- **3ボタン構成**: 保存・破棄・取り消しの操作
- **状態管理**: 編集内容の状態管理
- **更新処理**: useUpdateProductによる商品更新

### DetailEcProductModalContent (57行)
- **コンテンツ配置**: モーダル内のコンテンツ配置
- **タブ切り替え**: 商品詳細・注文履歴のタブ切り替え

### DetailEcProduct (241行)
- **商品詳細表示**: 商品情報の詳細表示
- **編集フィールド**: 出品価格・店頭在庫数の編集
- **ヘルプ機能**: Tooltipによる説明表示
- **データ取得**: useStockSearchによる商品データ取得

## 使用パターン
1. **商品詳細表示**: 商品一覧から商品をクリック→モーダル表示
2. **価格編集**: 出品価格フィールドで価格を変更
3. **在庫設定**: 店頭用在庫数を設定
4. **変更保存**: 「変更を保存」ボタンで更新
5. **出品取り消し**: 「出品を取り消す」ボタンで取り消し確認

## 関連する主要フック
- **useUpdateProduct**: 商品情報の更新
- **useStockSearch**: 商品データの取得
- **useStore**: 店舗情報の取得

## 関連ディレクトリ
- `../`: EC在庫管理コンポーネント
- `../../`: EC在庫管理メイン
- `/feature/products/hooks/`: 商品関連フック
- `/components/modals/`: モーダルコンポーネント
- `/components/inputFields/`: 入力フィールド

## 開発ノート
- **モーダル階層**: 詳細モーダル + 確認モーダルの階層管理
- **リアルタイム更新**: 編集後の即座なデータ更新
- **ユーザビリティ**: Tooltipによる分かりやすい説明
- **状態管理**: 編集内容の適切な状態管理
- **エラーハンドリング**: 更新処理のエラーハンドリング 