# packages/web-app/src/app/auth/(dashboard)/ec/stock/components/NewPublishProductModal/SelectedProduct/CLAUDE.md

## 🎯 目的・役割

選択済み商品表示・管理コンポーネント - 新規出品モーダルで選択された商品を一覧表示し、出品数・価格変更設定の編集および削除機能を提供する商品管理パネル。

## 🏗️ 技術構成

- **フレームワーク**: React + TypeScript
- **UI**: Material-UI 5.15.15
- **主要技術**: 
  - Box・Stack レイアウト（flexbox設計）
  - NumericTextField（数値入力制御）
  - Checkbox（価格変更設定）
  - IconButton・DeleteIcon（削除機能）
  - 192行のコンパクト実装
- **依存関係**: 
  - ItemImage・ItemText（商品表示）
  - grey カラーパレット（区切り線）

## 📁 ディレクトリ構造

```
packages/web-app/src/app/auth/(dashboard)/ec/stock/components/NewPublishProductModal/SelectedProduct/
├── SelectedProduct.tsx         # 選択済み商品管理コンポーネント（192行）
└── CLAUDE.md                   # 本ドキュメント
```

## 🔧 主要機能

### 1. 選択商品一覧表示
- **ヘッダー**: 「選択済み商品」タイトル・選択件数表示
- **商品画像**: ItemImage による商品画像表示（10%幅）
- **商品情報**: 商品名・拡張・カード番号・レアリティ（30%幅）
- **商品状態**: コンディション表示（primary.main背景）
- **出品設定**: 出品数・価格変更設定（25%幅ずつ）
- **削除操作**: DeleteIcon による個別削除（10%幅）

### 2. 出品数編集
- **NumericTextField**: 数値入力による出品数設定
- **最大値制限**: actualEcPublishStockNumber による上限制御
- **出品可能数表示**: 「（出品可能X点）」による制限値表示
- **リアルタイム更新**: onChange による即座の状態反映

### 3. 価格変更設定
- **店舗価格表示**: sellPrice による価格表示
- **価格変更チェック**: Checkbox による出品価格変更の選択
- **設定切り替え**: changePrice フラグによる価格変更の有効/無効

### 4. 商品削除機能
- **個別削除**: DeleteIcon による選択商品の削除
- **状態更新**: setSelectedProducts による選択リストの更新
- **即座の反映**: 削除後の即座のUI更新

## 💡 使用パターン

### 基本的な使用方法
```typescript
// 選択済み商品表示・管理
<SelectedProduct
  selectedProducts={selectedProducts}
  setSelectedProducts={setSelectedProducts}
/>
```

### データ構造
```typescript
interface EcProducts {
  productId: number;
  productImage?: string;
  productName?: string;
  condition: string;
  actualEcPublishStockNumber?: number;  // 出品可能数
  ecPublishStockNumber?: number;        // 出品数
  sellPrice?: number | null;            // 店舗価格
  changePrice?: boolean;                // 価格変更フラグ
  productExpansion?: string;            // 拡張
  productCardnumber?: string;           // カード番号
  productRarity?: string;               // レアリティ
}
```

### 状態管理パターン
```typescript
// 出品数変更
const handleTextChange = (productId: number, value: number) => {
  setSelectedProducts((prev) => {
    return prev.map((row) =>
      row.productId === productId
        ? { ...row, ecPublishStockNumber: value }
        : row,
    );
  });
};

// 価格変更設定
const handleCheckBoxChange = (productId: number, value: boolean) => {
  setSelectedProducts((prev) => {
    return prev.map((row) =>
      row.productId === productId ? { ...row, changePrice: value } : row,
    );
  });
};

// 商品削除
const handleDeleteRow = (productId?: number) => {
  setSelectedProducts((prev) =>
    prev.filter((row) => row.productId !== productId),
  );
};
```

## 🎨 UI/UX設計

### レイアウト構成
```typescript
// メインコンテナ
<Box
  sx={{
    backgroundColor: 'white',
    boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  }}
>
  {/* ヘッダー */}
  <Box sx={{ height: '60px', boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.2)' }}>
    <Typography>選択済み商品</Typography>
    <Typography>{selectedProducts.length}件</Typography>
  </Box>

  {/* メインコンテンツ */}
  <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
    {/* 商品一覧 */}
  </Box>

  {/* フッター */}
  <Box sx={{ height: '60px', boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.2)' }} />
</Box>
```

### 商品行レイアウト
```typescript
// 商品行構成（5列レイアウト）
<Stack
  direction="row"
  spacing={0.5}
  alignItems="center"
  borderBottom={`1px solid ${grey[300]}`}
>
  {/* 商品画像（10%） */}
  <Stack width={'10%'} sx={{ minWidth: 55 }}>
    <ItemImage imageUrl={product.productImage ?? null} />
  </Stack>
  
  {/* 商品情報（30%） */}
  <Stack direction="column" width={'30%'}>
    <ItemText text={product.productName ?? '-'} />
    <Typography>
      ({product.productExpansion} {product.productCardnumber} {product.productRarity})
    </Typography>
    <Typography
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        width: 'fit-content',
        pl: 1, pr: 1,
      }}
    >
      {product.condition}
    </Typography>
  </Stack>
  
  {/* 出品数設定（25%） */}
  <Stack direction="column" width={'25%'}>
    <Typography>出品数</Typography>
    <NumericTextField
      value={product.ecPublishStockNumber ?? undefined}
      onChange={(value) => handleTextChange(product.productId, value)}
      max={Math.max(product.actualEcPublishStockNumber ?? 0, 0)}
    />
    <Typography>
      （出品可能{Math.max(product.actualEcPublishStockNumber ?? 0, 0)}点）
    </Typography>
  </Stack>
  
  {/* 価格設定（25%） */}
  <Stack direction="column" width={'25%'}>
    <Typography>店舗価格</Typography>
    <Typography>{product.sellPrice}円</Typography>
    <Stack direction="row" alignItems="center">
      <Checkbox
        checked={product.changePrice ?? false}
        onChange={(event) => handleCheckBoxChange(product.productId, event.target.checked)}
      />
      <Typography>出品価格変更</Typography>
    </Stack>
  </Stack>
  
  {/* 削除ボタン（10%） */}
  <Stack width={'10%'}>
    <IconButton onClick={() => handleDeleteRow(product.productId)}>
      <DeleteIcon />
    </IconButton>
  </Stack>
</Stack>
```

### 空状態表示
```typescript
// 商品未選択時の表示
{selectedProducts.length > 0 ? (
  <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
    {/* 商品一覧 */}
  </Box>
) : (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      minHeight: 450,
    }}
  />
)}
```

## 🚀 パフォーマンス最適化

### レンダリング最適化
- **条件付きレンダリング**: 商品存在時のみ一覧表示
- **overflowY: auto**: 大量商品時のスクロール対応
- **flexGrow: 1**: 効率的なレイアウト拡張

### 状態管理効率化
- **map による更新**: 対象商品のみ更新
- **filter による削除**: 効率的な商品削除
- **最小限の再レンダリング**: 必要な部分のみ更新

## 🔗 関連コンポーネント

- [../NewPublishProductModal.tsx](../NewPublishProductModal.tsx) - 親モーダルコンポーネント
- [../NewPublishProductList/](../NewPublishProductList/) - 商品選択リスト
- [../SelectPlatForm/](../SelectPlatForm/) - プラットフォーム選択
- [../ChangePrice/](../ChangePrice/) - 価格変更設定
- [/feature/item/components/](../../../../../../../feature/item/components/) - 商品表示コンポーネント

## 📝 開発メモ

### 実装の特徴
- **192行のコンパクト実装**: 選択商品管理の全機能を効率的に統合
- **5列レイアウト**: 画像・情報・出品数・価格・削除の明確な分離
- **リアルタイム編集**: 出品数・価格変更の即座の反映
- **視覚的階層**: ヘッダー・コンテンツ・フッターの明確な区分

### 技術的工夫
- **幅制御**: パーセンテージ幅による柔軟なレイアウト
- **minWidth設定**: 最小幅による表示崩れ防止
- **NumericTextField**: 数値入力の適切な制限・バリデーション
- **状態更新**: map・filter による効率的な配列操作

### UI設計原則
- **一覧性**: 選択商品の効率的な一覧表示
- **編集性**: 各項目の直接編集機能
- **削除性**: 個別商品の簡単な削除
- **視認性**: 商品状態・制限値の明確な表示

### 使用場面
- **商品選択確認**: 選択した商品の確認・調整
- **出品数調整**: 個別商品の出品数設定
- **価格設定**: 出品価格変更の選択
- **選択取り消し**: 不要商品の削除

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 