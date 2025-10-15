# 新規出品商品モーダル

## 目的
新規商品をECサイトに出品するための多段階モーダルコンポーネント

## 実装されている機能

### メインモーダル (NewPublishProductModal.tsx - 296行)
- **3段階フロー**: 商品選択 → 価格変更 → プラットフォーム選択
- **商品検索・選択**: 在庫商品から出品対象を選択
- **価格設定**: 個別商品の出品価格設定
- **プラットフォーム選択**: 出品先ECプラットフォーム選択
- **一括出品**: 複数商品の一括出品処理

### 出品フロー
1. **商品選択**: 在庫商品から出品商品を選択・出品数設定
2. **価格変更**: 出品価格を変更する商品の価格設定
3. **プラットフォーム選択**: 出品先プラットフォーム選択
4. **出品実行**: 選択商品の一括出品処理

## ファイル構成
```
NewPublishProductModal/
├── NewPublishProductModal.tsx           # メインモーダル（296行）
├── NewPublishProductModalContent.tsx    # モーダルコンテンツ（83行）
├── ConfirmAllPublishProductModal.tsx    # 全商品出品確認（47行）
├── NewPublishProductList/
│   └── NewPublishProductList.tsx        # 商品選択リスト（637行）
├── SelectedProduct/                     # 選択商品表示
├── SelectPlatForm/                      # プラットフォーム選択
└── ChangePrice/                         # 価格変更
```

## 技術実装詳細

### 商品データ構造
```typescript
export interface EcProducts {
  productId: number;                      // 商品ID
  productImage?: string;                  // 商品画像
  productName?: string;                   // 商品名
  productExpansion?: string;              // 商品拡張情報
  productCardnumber?: string;             // 商品番号
  productRarity?: string;                 // レアリティ
  condition?: string;                     // 商品状態
  ecPublishStockNumber?: number;          // EC出品可能数
  sellPrice?: number | null;              // 店舗価格
  ecAutoPrice?: number | null;            // EC自動出品価格
  ecSellPrice?: number | null;            // EC出品価格
  changePrice?: boolean;                  // 価格変更フラグ
  actualEcPublishStockNumber?: number;    // 実際のEC出品数
}

export interface SelectedPlatForm {
  selected: boolean;
  shopName: string;
}
```

### 3段階フロー制御
```typescript
// フロー状態管理
const [canShowChangePriceScreen, setCanShowChangePriceScreen] = useState(false);
const [canShowPlatformScreen, setCanShowPlatformScreen] = useState(false);
const [isChangePrice, setIsChangePrice] = useState(false);

// 価格変更の有無を確認
useEffect(() => {
  const hasChangePrice = selectedProducts.some(
    (product) => product.changePrice === true,
  );
  setIsChangePrice(hasChangePrice);
}, [selectedProducts]);
```

### 段階別処理
```typescript
const handleClick = async () => {
  if (canShowChangePriceScreen) {
    // 価格変更処理
    const changePriceTargets = selectedProducts.filter(
      (product) => product.changePrice === true,
    );

    const results = await Promise.all(
      changePriceTargets.map((product) =>
        updateProduct(store.id, product.productId, {
          specificEcSellPrice: product.ecSellPrice,
        }),
      ),
    );

    if (results.every((res) => res.success)) {
      setCanShowChangePriceScreen(false);
      setCanShowPlatformScreen(true);
    }
  } else if (canShowPlatformScreen) {
    // プラットフォーム選択処理
    const isMycaLinksMallSelected = selectedPlatForm.some(
      (platform) =>
        platform.shopName === ecShopCommonConstants.shopInfo[0].shopName &&
        platform.selected,
    );

    if (isMycaLinksMallSelected) {
      const results = await Promise.all(
        selectedProducts.map((product) =>
          updateProduct(store.id, product.productId, {
            mycalinksEcEnabled: true,
          }),
        ),
      );

      if (results.every((res) => res.success)) {
        // 完了処理
        setCanShowPlatformScreen(false);
        setSelectedProducts([]);
        fetchListProducts();
        setIsModalOpen(false);
      }
    }
  } else {
    // 初期段階: 在庫数更新
    const results = await Promise.all(
      selectedProducts.map((product) =>
        updateProduct(store.id, product.productId, {
          ecPublishStockNumber: product.ecPublishStockNumber === 0 
            ? undefined 
            : product.ecPublishStockNumber,
        }),
      ),
    );

    if (results.every((res) => res.success)) {
      if (isChangePrice) {
        setCanShowChangePriceScreen(true);
      } else {
        setCanShowPlatformScreen(true);
      }
    }
  }
};
```

### モーダル閉じる処理
```typescript
const handleClose = () => {
  if (canShowPlatformScreen) {
    setCanShowPlatformScreen(false);
  } else if (canShowChangePriceScreen) {
    setCanShowChangePriceScreen(false);
    setCanShowPlatformScreen(true);
  } else {
    // 初期状態に戻す
    setSelectedProducts([]);
    setSelectedPlatForm(
      publishStoreInfos.map((info) => ({
        selected: false,
        shopName: info.displayName,
      })),
    );
    fetchListProducts();
    setIsModalOpen(false);
  }
};
```

## 主要コンポーネント

### NewPublishProductModalContent (83行)
- **2分割レイアウト**: 左側商品リスト（8列）+ 右側選択商品（4列）
- **商品検索**: ItemSearchによる商品検索
- **ジャンル選択**: GenreTabによるジャンル別表示
- **絞り込み**: PurchaseTableNarrowDownによる商品絞り込み
- **全商品出品**: 「POS上のすべての商品を出品する」ボタン

### NewPublishProductList (637行)
- **商品選択**: 在庫商品から出品対象商品を選択
- **出品数設定**: 各商品の出品数設定
- **価格表示**: 店舗価格・EC自動価格・出品価格の表示
- **状態管理**: 選択商品の状態管理

### SelectedProduct
- **選択商品表示**: 選択された商品の一覧表示
- **出品数編集**: 選択商品の出品数編集
- **価格変更設定**: 個別商品の価格変更フラグ設定

### SelectPlatForm
- **プラットフォーム選択**: 出品先ECプラットフォームの選択
- **複数選択**: 複数プラットフォームへの同時出品対応

### ChangePrice
- **価格変更**: 価格変更対象商品の出品価格設定
- **一括価格変更**: 複数商品の価格一括変更

## 使用パターン
1. **商品検索**: ItemSearchで商品を検索
2. **商品選択**: 商品リストから出品対象を選択・出品数設定
3. **価格設定**: 必要に応じて出品価格を変更
4. **プラットフォーム選択**: 出品先プラットフォームを選択
5. **出品実行**: 「出品する」ボタンで一括出品

## 関連する主要フック
- **useItemSearch**: 商品検索・取得
- **useUpdateProduct**: 商品情報の更新
- **useStore**: 店舗情報の取得
- **useSession**: セッション情報の取得

## 関連ディレクトリ
- `../`: EC在庫管理コンポーネント
- `/feature/item/`: 商品関連機能
- `/feature/products/`: 商品管理機能
- `/constants/ecShops`: ECショップ情報定数
- `/components/modals/`: モーダルコンポーネント

## 開発ノート
- **多段階フロー**: 3段階の出品フローによる段階的な設定
- **状態管理**: 複雑な商品選択・価格設定の状態管理
- **バッチ処理**: 複数商品の一括更新処理
- **エラーハンドリング**: 各段階でのエラーハンドリング
- **プラットフォーム対応**: 複数ECプラットフォームへの統一出品 