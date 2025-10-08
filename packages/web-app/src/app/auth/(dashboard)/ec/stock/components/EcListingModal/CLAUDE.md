# 出品取り消しモーダル

## 目的
選択した商品の出品を取り消すためのモーダルコンポーネント

## 実装されている機能

### メインモーダル (CancelSellModal.tsx - 187行)
- **出品取り消し**: 選択商品の出品を一括取り消し
- **商品確認**: 取り消し対象商品の一覧表示
- **プラットフォーム選択**: 取り消し対象プラットフォームの選択
- **確認処理**: 取り消し前の確認とローディング表示

### 取り消し処理
- **一括取り消し**: 複数商品の同時出品取り消し
- **状態更新**: mycalinksEcEnabled を false に設定
- **エラーハンドリング**: 取り消し処理のエラーハンドリング

## ファイル構成
```
CancelSellModal/
└── CancelSellModal.tsx                  # 出品取り消しモーダル（187行）
```

## 技術実装詳細

### プロパティ定義
```typescript
interface Props {
  open: boolean;                          // モーダル表示状態
  onClose: () => void;                    // 閉じる処理
  selectedIds: number[];                  // 選択された商品ID配列
  publishStoreInfos: {                    // 出品先プラットフォーム情報
    displayName: string;
    icon: string;
    ImageUrl: string;
  }[];
}
```

### 商品データ取得
```typescript
// 選択商品の詳細情報を取得
const { searchState, fetchProducts } = useStockSearch(
  store.id,
  {
    isActive: true,
  },
  selectedIds,  // 選択されたIDで検索
);

// 商品データの取得
useEffect(() => {
  if (selectedIds && selectedIds.length > 0) {
    fetchProducts();
  }
}, [fetchProducts, store.id, selectedIds]);
```

### 出品取り消し処理
```typescript
const onPrimaryButtonClick = async () => {
  setPrimaryButtonLoading(true);
  try {
    // 選択されたすべての商品の出品を取り消し
    const results = await Promise.all(
      selectedIds.map((selectedId) =>
        updateProduct(store.id, selectedId, {
          mycalinksEcEnabled: false,  // 出品を無効化
        }),
      ),
    );

    // すべての更新が成功したかチェック
    const allSuccess = results.every((res) => res.success);
    if (allSuccess) {
      onClose();  // モーダルを閉じる
    }
  } catch (error) {
    console.error('更新中にエラーが発生しました', error);
  } finally {
    setPrimaryButtonLoading(false);
  }
};
```

### モーダルレイアウト
```typescript
<Modal open={open} onClose={onClose}>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 550,
      bgcolor: 'white',
      borderRadius: 2,
      boxShadow: 24,
      pt: 1,
      pr: 2.5,
      pl: 2.5,
      pb: 2,
    }}
  >
    {/* 閉じるボタン */}
    <FaTimes
      size={20}
      onClick={onClose}
      style={{
        position: 'absolute',
        right: '5px',
        color: 'black',
        backgroundColor: 'white',
        cursor: 'pointer',
        borderRadius: '50%',
        padding: '5px',
      }}
    />

    {/* タイトル */}
    <Typography variant="h1" fontWeight="bold" color="primary.main" mt={2}>
      出品取り消し
    </Typography>

    {/* 説明文 */}
    <Typography mt={1.5}>
      出品を取り消すプラットフォームを選択してください
    </Typography>
  </Box>
</Modal>
```

### プラットフォーム選択
```typescript
{/* プラットフォーム選択チェックボックス */}
{publishStoreInfos.map((store) => (
  <Stack key={store.displayName} direction="row" alignItems="center" mt={1}>
    <Checkbox
      sx={{
        color: 'black',
        padding: 0,
        margin: 0,
        '&.Mui-checked': {
          color: 'primary.main',
        },
      }}
    />
    <Typography>{store.displayName}</Typography>
  </Stack>
))}
```

### 商品一覧表示
```typescript
{/* 取り消し対象商品の一覧 */}
<Box
  overflow="auto"
  border={1}
  borderColor="grey.300"
  width="100%"
  height={200}
  padding={2}
  sx={{ pt: 1, pr: 2, pl: 2, pb: 1, mt: 1.5 }}
  display="flex"
  justifyContent="center"
>
  <Stack width="100%">
    {searchState.searchResults.map((product) => (
      <Stack
        key={product.id}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ width: '100%', mx: 'auto' }}
      >
        <Typography flex={0.6}>
          {product.displayNameWithMeta}
        </Typography>
        <Typography flex={0.35}>
          {product.item_cardnumber} {product.item_expansion}
        </Typography>
        <Typography flex={0.05} textAlign="right">
          {product.item_rarity}
        </Typography>
      </Stack>
    ))}
  </Stack>
</Box>
```

### ボタン配置
```typescript
{/* アクションボタン */}
<Box display="flex" justifyContent="flex-end" mt={1.5} gap={2}>
  <TertiaryButtonWithIcon onClick={onClose}>
    キャンセル
  </TertiaryButtonWithIcon>
  <PrimaryButtonWithIcon
    loading={primaryButtonLoading}
    onClick={onPrimaryButtonClick}
    disabled={selectedIds.length === 0}  // 商品が選択されていない場合は無効
  >
    出品を取り消す
  </PrimaryButtonWithIcon>
</Box>
```

## 主要機能

### 商品情報表示
- **商品名**: displayNameWithMeta による商品名表示
- **商品番号**: item_cardnumber と item_expansion の表示
- **レアリティ**: item_rarity の表示
- **スクロール対応**: 多数の商品に対応したスクロール表示

### プラットフォーム選択
- **チェックボックス**: 取り消し対象プラットフォームの選択
- **複数選択**: 複数プラットフォームからの同時取り消し対応
- **視覚的表示**: プラットフォーム名の明確な表示

### 取り消し処理
- **一括処理**: Promise.all による並列処理
- **成功判定**: すべての更新が成功した場合のみ完了
- **ローディング**: 処理中のローディング表示
- **エラーハンドリング**: 処理失敗時のエラーログ

## 使用パターン
1. **商品選択**: 在庫管理画面で取り消し対象商品を選択
2. **モーダル表示**: 「選択した商品の出品を取り消す」ボタンでモーダル表示
3. **商品確認**: 取り消し対象商品の一覧を確認
4. **プラットフォーム選択**: 取り消し対象プラットフォームを選択
5. **取り消し実行**: 「出品を取り消す」ボタンで一括取り消し

## 関連する主要フック
- **useStockSearch**: 選択商品の詳細情報取得
- **useUpdateProduct**: 商品の出品状態更新
- **useStore**: 店舗情報の取得

## 関連ディレクトリ
- `../`: EC在庫管理コンポーネント
- `../../`: EC在庫管理メイン
- `/feature/products/hooks/`: 商品関連フック
- `/components/buttons/`: ボタンコンポーネント

## 開発ノート
- **シンプルな構造**: 単一ファイルでの完結した実装
- **一括処理**: 複数商品の効率的な一括取り消し
- **ユーザビリティ**: 取り消し前の商品確認とプラットフォーム選択
- **エラーハンドリング**: 適切なエラーハンドリングとローディング表示
- **レスポンシブ**: 固定幅モーダルによる一貫したUI 