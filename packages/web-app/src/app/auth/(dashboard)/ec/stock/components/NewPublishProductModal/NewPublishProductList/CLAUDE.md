# packages/web-app/src/app/auth/(dashboard)/ec/stock/components/NewPublishProductModal/NewPublishProductList/CLAUDE.md

## 🎯 目的・役割

新規出品商品選択リストコンポーネント - EC出品可能な商品を一覧表示し、商品状態・出品数・価格変更の設定を行う高機能な商品選択システム。

## 🏗️ 技術構成

- **フレームワーク**: React + TypeScript
- **UI**: Material-UI 5.15.15 + MUI-X DataGrid
- **主要技術**: 
  - DataGrid（日本語対応・ページネーション）
  - NumericTextField（数値入力制御）
  - Select・Checkbox（状態選択）
  - 637行の大規模コンポーネント
- **依存関係**: 
  - useAlert（アラート表示）
  - ItemImage・ItemText（商品表示）
  - useItemSearch（商品検索）

## 📁 ディレクトリ構造

```
packages/web-app/src/app/auth/(dashboard)/ec/stock/components/NewPublishProductModal/NewPublishProductList/
├── NewPublishProductList.tsx   # 商品選択リストコンポーネント（637行）
└── CLAUDE.md                   # 本ドキュメント
```

## 🔧 主要機能

### 1. 商品一覧表示
- **DataGrid表示**: MUI-X DataGrid による高性能な商品一覧
- **商品画像**: ItemImage による商品画像表示
- **商品情報**: 商品名・拡張・カード番号・レアリティの詳細表示
- **在庫情報**: 在庫数・出品可能数の表示
- **ページネーション**: 大量商品データの効率的な表示

### 2. 商品状態選択
- **状態選択**: Select による商品コンディション選択
- **自動ソート**: order_number による状態の自動並び替え
- **初期値設定**: 最初の状態を初期選択値として設定
- **動的更新**: 状態変更時の即座な反映

### 3. 出品設定
- **出品数入力**: NumericTextField による出品数設定
- **価格変更**: Checkbox による出品価格変更の選択
- **在庫制限**: 出品可能数による入力制限
- **バリデーション**: 不正な値の入力防止

### 4. 選択商品管理
- **商品追加**: 設定完了商品の選択リストへの追加
- **重複管理**: 同一商品IDの重複防止・差し替え処理
- **エラーチェック**: 状態未選択時のアラート表示
- **データ統合**: 複数の商品情報の統合管理

## 💡 使用パターン

### 基本的な使用方法
```typescript
// 商品選択リスト
<NewPublishProductList
  searchState={searchState}
  setSearchState={setSearchState}
  setSelectedProducts={setSelectedProducts}
/>
```

### データ構造
```typescript
// 商品行データ
interface EcProductRowData {
  index: number;                    // 行のインデックス
  productId?: number;               // 商品を識別するためのID
  condition?: string;               // 選択された状態
  ecPublishStockNumber?: number;    // 在庫数
  changePrice?: boolean;            // 価格変更フラグ
}

// 選択商品データ
interface EcProducts {
  productId: number;
  productImage?: string;
  productName?: string;
  condition: string;
  actualEcPublishStockNumber: number;
  ecPublishStockNumber?: number;
  sellPrice?: number | null;
  changePrice: boolean;
  ecAutoPrice?: number | null;
  productExpansion?: string;
  productCardnumber?: string;
  productRarity?: string;
}
```

### 状態管理パターン
```typescript
// 商品状態変更
const handleConditionChange = (
  rowId: number,
  productId: number,
  key: keyof EcProductRowData,
  value: string,
) => {
  setRows((prevRows) => {
    const rowExists = prevRows.find((row) => row.index === rowId);
    
    if (rowExists) {
      // 既存の行を更新
      return prevRows.map((row) =>
        row.index === rowId ? { ...row, [key]: value, productId } : row,
      );
    } else {
      // 新しい行を追加
      return [...prevRows, { index: rowId, productId, [key]: value }];
    }
  });
};

// 出品数変更
const handleTextChange = (
  rowId: number,
  key: keyof EcProductRowData,
  value: number,
) => {
  // 同様の更新ロジック
};
```

## 🎨 UI/UX設計

### DataGrid列定義
```typescript
const columns: GridColDef[] = [
  {
    field: 'productImage',
    headerName: '商品画像',
    flex: 5,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <ItemImage imageUrl={params.value} height={80} />
    ),
  },
  {
    field: 'productName',
    headerName: '商品名',
    flex: 10,
    renderCell: (params) => (
      <ItemText text={params.value || ''} />
    ),
  },
  {
    field: 'productState',
    headerName: '状態',
    flex: 5,
    renderCell: (params) => (
      <Select
        value={/* 選択された状態 */}
        onChange={/* 状態変更処理 */}
      >
        {/* 状態オプション */}
      </Select>
    ),
  },
  {
    field: 'stockQuantity',
    headerName: '在庫数',
    flex: 3,
  },
  {
    field: 'ecPublishStockNumber',
    headerName: '出品数',
    flex: 5,
    renderCell: (params) => (
      <NumericTextField
        value={/* 出品数 */}
        onChange={/* 出品数変更 */}
        max={/* 在庫制限 */}
      />
    ),
  },
  {
    field: 'changePrice',
    headerName: '価格変更',
    flex: 3,
    renderCell: (params) => (
      <Checkbox
        checked={/* 価格変更フラグ */}
        onChange={/* 価格変更処理 */}
      />
    ),
  },
  {
    field: 'actions',
    headerName: '操作',
    flex: 3,
    renderCell: (params) => (
      <SecondaryButtonWithIcon
        onClick={() => handleAddSelectedData(/* パラメータ */)}
      >
        追加
      </SecondaryButtonWithIcon>
    ),
  },
];
```

### ページネーション
```typescript
// ページネーション設定
const handlePaginationModelChange = (model: GridPaginationModel) => {
  setSearchState((prev) => ({
    ...prev,
    skip: model.page * model.pageSize,
    take: model.pageSize,
  }));
};
```

## 🔗 API統合

### 商品データ取得
```typescript
// 検索状態から商品リスト作成
const itemList = searchState.searchResults.map((element, index) => {
  const productState = element.products
    .filter((product) => product.condition_option_display_name)
    .map((product) => ({
      condition: product.condition_option_display_name,
      id: product.id,
      orderNumber: product.condition_option__order_number,
    }))
    .sort((a, b) => a.orderNumber - b.orderNumber);
    
  return {
    id: index,
    productImage: element.image_url,
    productName: element.display_name || '',
    productExpansion: element.expansion || '',
    productCardnumber: element.cardnumber || '',
    productRarity: element.rarity || '',
    productId: element.products.map((product) => product.id),
    productState: productState,
    initialCondition: productState.length > 0 ? productState[0].condition : '',
    stockQuantity: element.products_stock_number,
    itemId: element.id,
    infiniteStock: element.infinite_stock,
  };
});
```

### 選択商品追加処理
```typescript
const handleAddSelectedData = (
  rowId: number,
  rowImage: string,
  rowDisplayName: string,
  initialProduct: { id: number; condition: string },
  actualEcPublishStockNumber?: number,
  sellPrice?: number | null,
  ecAutoPrice?: number | null,
  // その他のパラメータ
) => {
  setSelectedProducts((prevSelectedProducts) => {
    const rowdata = rows.find((row) => row.index === rowId);

    // バリデーション
    if (!initialProduct && !rowdata) {
      setAlertState({
        message: `状態を選択してください。`,
        severity: 'error',
      });
      return prevSelectedProducts;
    }

    const newSelectedData: EcProducts = {
      productId: rowdata?.productId ?? initialProduct?.id,
      productImage: rowImage || undefined,
      productName: rowDisplayName || undefined,
      condition: rowdata?.condition ?? initialProduct?.condition,
      actualEcPublishStockNumber: Math.max(actualEcPublishStockNumber ?? 0, 0),
      ecPublishStockNumber: rowdata?.ecPublishStockNumber || undefined,
      sellPrice: sellPrice,
      changePrice: rowdata?.changePrice ?? false,
      ecAutoPrice: ecAutoPrice,
      productExpansion: productExpansion,
      productCardnumber: productCardnumber,
      productRarity: productRarity,
    };

    // 重複チェック・差し替え
    const updatedList = prevSelectedProducts.filter(
      (product) => product.productId !== newSelectedData.productId,
    );

    return [...updatedList, newSelectedData];
  });
};
```

## 🚀 パフォーマンス最適化

### DataGrid最適化
- **仮想化**: MUI-X DataGrid による効率的なレンダリング
- **ページネーション**: 大量データの分割表示
- **条件付きレンダリング**: 必要な要素のみ表示
- **日本語対応**: jaJP ロケールによる適切な表示

### 状態管理効率化
- **最小限の状態**: 必要な変更のみ追跡
- **差分更新**: 変更された行のみ更新
- **重複防止**: 同一商品IDの効率的な管理

## 🔗 関連コンポーネント

- [../NewPublishProductModal.tsx](../NewPublishProductModal.tsx) - 親モーダルコンポーネント
- [../SelectedProduct/](../SelectedProduct/) - 選択済み商品表示
- [../SelectPlatForm/](../SelectPlatForm/) - プラットフォーム選択
- [../ChangePrice/](../ChangePrice/) - 価格変更設定
- [/feature/item/components/](../../../../../../../feature/item/components/) - 商品表示コンポーネント

## 📝 開発メモ

### 実装の特徴
- **637行の大規模コンポーネント**: 商品選択の全機能を統合
- **高性能DataGrid**: MUI-X による効率的な大量データ表示
- **複雑な状態管理**: 商品・状態・出品設定の統合管理
- **バリデーション**: 入力値の適切な検証・エラー表示

### 技術的工夫
- **動的行管理**: rows状態による効率的な変更追跡
- **重複防止**: productId による重複チェック・差し替え
- **自動ソート**: order_number による状態の自動並び替え
- **型安全性**: TypeScript による厳密な型定義

### UI設計原則
- **一覧性**: DataGrid による効率的な商品一覧表示
- **操作性**: 各行での独立した設定・操作
- **視認性**: 商品画像・詳細情報の明確な表示
- **使いやすさ**: 直感的な操作・明確なフィードバック

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 