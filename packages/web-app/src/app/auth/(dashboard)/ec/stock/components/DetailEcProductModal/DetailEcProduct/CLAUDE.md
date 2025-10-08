# packages/web-app/src/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/DetailEcProduct/CLAUDE.md

## 🎯 目的・役割

EC商品詳細表示・編集コンポーネント - 出品中商品の詳細情報を表示し、出品価格・店頭用在庫数・自動補充設定の編集を行う高機能なコンポーネント。

## 🏗️ 技術構成

- **フレームワーク**: React + TypeScript
- **UI**: Material-UI 5.15.15
- **主要技術**: 
  - useStockSearch（商品検索フック）
  - NumericTextField（数値入力フィールド）
  - Tooltip（ヘルプ機能）
  - Checkbox（設定切り替え）
  - ItemImage・ItemText（商品表示コンポーネント）
- **依存関係**: 
  - useStore（店舗コンテキスト）
  - ShopIcon（店舗アイコン）
  - useStockSearch（在庫検索）

## 📁 ディレクトリ構造

```
packages/web-app/src/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/DetailEcProduct/
├── DetailEcProduct.tsx         # 商品詳細表示・編集コンポーネント（241行）
└── CLAUDE.md                   # 本ドキュメント
```

## 🔧 主要機能

### 1. 商品詳細表示
- **商品画像**: ItemImage による250px高さの商品画像表示
- **商品名**: displayNameWithMeta による詳細商品名表示
- **商品状態**: condition_option_display_name による状態表示
- **価格情報**: 店頭販売価格・出品価格・自動出品価格の表示
- **在庫情報**: 出品数・在庫数・店頭用在庫数の表示

### 2. 編集可能項目
- **出品価格**: NumericTextField による価格編集
- **店頭用在庫数**: NumericTextField による在庫数編集
- **自動補充無効**: Checkbox による自動補充設定の切り替え

### 3. 高度なUI機能
- **ヘルプ機能**: Tooltip による詳細説明表示
- **ホバー制御**: マウスホバーでのTooltip表示制御
- **レスポンシブ**: 70%幅による適応的レイアウト
- **出品店舗表示**: ShopIcon による出品プラットフォーム表示

### 4. データ管理
- **リアルタイム更新**: useStockSearch による商品情報の自動更新
- **状態管理**: React useState による編集状態の管理
- **バリデーション**: 数値入力フィールドの入力制限

## 💡 使用パターン

### 基本的な使用方法
```typescript
// 商品詳細表示・編集
<DetailEcProduct
  productId={productId}
  actualEcSellPrice={actualEcSellPrice}
  setActualEcSellPrice={setActualEcSellPrice}
  posReservedStockNumber={posReservedStockNumber}
  setPosReservedStockNumber={setPosReservedStockNumber}
  canDisableEcAutoStocking={canDisableEcAutoStocking}
  setCanDisableEcAutoStocking={setCanDisableEcAutoStocking}
  publishStoreInfos={publishStoreInfos}
/>
```

### 状態管理パターン
```typescript
// 価格変更処理
const handlePriceChange = (value: number | undefined) => {
  setActualEcSellPrice(value);
};

// 在庫数変更処理
const handlePosStockNumberChange = (value: number | undefined) => {
  setPosReservedStockNumber(value);
};

// 自動補充設定変更処理
const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setCanDisableEcAutoStocking(event.target.checked);
};
```

## 🎨 UI/UX設計

### レイアウト構成
- **中央配置**: Stack alignItems="center" による中央配置
- **商品画像**: 250px高さの大きな商品画像
- **情報行**: 70%幅による統一的な情報表示
- **左右配置**: justifyContent="space-between" による左右配置

### 表示情報の階層
```typescript
// 1行目: 商品名
<ItemText text={searchState.searchResults[0]?.displayNameWithMeta} />

// 2行目: 商品状態
<Typography>
  {searchState.searchResults[0]?.condition_option_display_name}
</Typography>

// 3行目: 店頭販売価格
<Typography>店頭販売価格</Typography>
<Typography>
  {searchState.searchResults[0]?.actual_sell_price?.toString()}円
</Typography>

// 4行目: 出品価格（編集可能）
<Typography>出品価格</Typography>
<NumericTextField
  value={searchState.searchResults[0]?.actual_ec_sell_price ?? actualEcSellPrice}
  onChange={handlePriceChange}
  sx={{ width: '100px' }}
/>

// 5行目: 自動出品価格（参考表示）
<Typography>（自動出品価格）</Typography>
<Typography>
  （{searchState.searchResults[0]?.ec_sell_price?.toString() ?? '-'}円）
</Typography>
```

### ヘルプ機能
```typescript
// Tooltip による詳細説明
<Tooltip
  open={open}
  onClose={() => setOpen(false)}
  title={
    <Typography>
      店頭用に確保し、ECに出品しない在庫数です。全体の設定よりも個別の設定が優先されます。
    </Typography>
  }
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
  }}
>
  <IconButton
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

## 🔗 API統合

### useStockSearch フック
```typescript
const { searchState, fetchProducts } = useStockSearch(
  store.id,
  {
    isActive: true,
  },
  productId,
);

// 商品情報の取得
useEffect(() => {
  fetchProducts();
}, [fetchProducts, store.id, productId]);
```

### データ構造
```typescript
interface Props {
  productId: number;
  actualEcSellPrice: number | undefined;
  setActualEcSellPrice: React.Dispatch<React.SetStateAction<number | undefined>>;
  posReservedStockNumber: number | undefined;
  setPosReservedStockNumber: React.Dispatch<React.SetStateAction<number | undefined>>;
  canDisableEcAutoStocking: boolean;
  setCanDisableEcAutoStocking: React.Dispatch<React.SetStateAction<boolean>>;
  publishStoreInfos: {
    displayName: string;
    icon: string;
    ImageUrl?: string;
  }[];
}
```

## 🚀 パフォーマンス最適化

### 状態管理効率化
- **最小限の状態**: 編集に必要な状態のみ管理
- **条件付きレンダリング**: データ存在時のみ表示
- **useEffect最適化**: 依存関係の適切な管理

### UI最適化
- **Tooltip制御**: ホバー状態の適切な管理
- **数値入力**: NumericTextField による入力制限
- **レスポンシブ**: 固定幅による一貫したレイアウト

## 🔗 関連コンポーネント

- [../DetailEcProductModal.tsx](../DetailEcProductModal.tsx) - 親モーダルコンポーネント
- [../ProductEcOrderHistory/](../ProductEcOrderHistory/) - 注文履歴表示
- [../ConfirmCancelModal/](../ConfirmCancelModal/) - 取り消し確認モーダル
- [/feature/item/components/ItemImage](../../../../../../../feature/item/components/) - 商品画像表示
- [/feature/item/components/ItemText](../../../../../../../feature/item/components/) - 商品テキスト表示

## 📝 開発メモ

### 実装の特徴
- **241行の高機能コンポーネント**: 表示・編集・ヘルプ機能の統合
- **詳細な商品情報**: 8つの情報行による包括的な表示
- **編集可能項目**: 3つの重要な設定項目の編集機能
- **ユーザビリティ**: Tooltip・ホバー制御による使いやすさ

### 技術的工夫
- **Tooltip制御**: open・hovering状態の適切な管理
- **数値入力**: 専用コンポーネントによる入力制限
- **レスポンシブ**: 70%幅による適応的なレイアウト
- **データ同期**: useStockSearch による自動データ更新

### UI設計原則
- **視覚的階層**: 商品画像→商品名→詳細情報の明確な階層
- **編集可能性**: 編集可能項目の明確な区別
- **ヘルプ機能**: 複雑な設定項目への適切な説明
- **一貫性**: 統一されたレイアウト・スタイル

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 