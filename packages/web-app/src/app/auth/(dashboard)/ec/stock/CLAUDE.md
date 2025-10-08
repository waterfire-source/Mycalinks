# EC出品在庫管理

## 目的
ECサイトに出品する商品の在庫管理・出品管理を行うページ

## 実装されている機能

### メインページ (page.tsx - 8行)
- **シンプルな構造**: EcStockPageContentコンポーネントのみ

### 在庫管理コンテンツ (EcStockPageContent.tsx - 155行)
- **商品検索**: ProductSearchによる商品検索機能
- **ジャンル別表示**: ProductGenreTabによるタブ切り替え
- **絞り込み**: EcProductNarrowDownによる並び替え・フィルタ
- **商品一覧**: EcProductListによる在庫商品一覧表示
- **新規出品**: 新規商品の出品登録
- **出品取り消し**: 選択商品の出品取り消し

### 主要機能
- **新規出品商品登録**: NewPublishProductModalによる新規出品
- **出品取り消し**: CancelSellModalによる一括取り消し
- **商品詳細**: DetailEcProductModalによる詳細表示・編集
- **外部EC連携**: 複数プラットフォームへの出品管理

## ファイル構成
```
stock/
├── page.tsx                              # メインページ（8行）
└── components/
    ├── EcStockPageContent.tsx           # メインコンテンツ（155行）
    ├── EcProductList.tsx                # 商品一覧表示（256行）
    ├── EcProductNarrowDown.tsx          # 絞り込み機能（196行）
    ├── NewPublishProductModal/          # 新規出品モーダル
    ├── DetailEcProductModal/            # 商品詳細モーダル
    └── CancelSellModal/                 # 出品取り消しモーダル
```

## 技術実装詳細

### 検索・フィルタ機能
```typescript
// 検索状態管理
const { searchState, setSearchState, fetchProducts } = useStockSearch(
  store.id,
  {
    itemPerPage: 30,        // 1ページあたりのアイテム数
    currentPage: 0,         // 初期ページ
    isActive: true,         // アクティブ商品のみ
    ecAvailable: true,      // EC出品可能商品のみ
  },
);

// データ取得
useEffect(() => {
  fetchProducts();
}, [fetchProducts, store.id]);
```

### 外部ECプラットフォーム連携
```typescript
// EC店舗情報の取得
const StoreInfos = ecShopCommonConstants;
const publishStoreInfos = StoreInfos.shopInfo.map((shop) => ({
  displayName: shop.shopName,
  icon: shop.shopIconInfo,
  ImageUrl: shop.shopImageUrl,
}));

// 複数プラットフォームへの出品管理
- 店舗情報の統一管理
- アイコン・画像の表示
- プラットフォーム別の出品状態管理
```

### 商品選択・操作
```typescript
// 商品選択状態管理
const [selectedIds, setSelectedIds] = useState<number[]>([]);

// 商品詳細表示
const [productId, setProductId] = useState<number>();
useEffect(() => {
  if (productId) {
    setIsDetailModalOpen(true);
  }
}, [productId]);

// 出品取り消し処理
const handleCancelModalClose = () => {
  setSelectedIds([]);
  fetchProducts();          // 一覧を再取得
  setIsCancelModalOpen(false);
};
```

## 主要コンポーネント

### EcProductList (256行)
- **商品一覧表示**: 出品商品の一覧表示
- **商品選択**: チェックボックスによる複数選択
- **商品詳細**: 商品クリックによる詳細表示
- **出品状態**: プラットフォーム別の出品状態表示

### EcProductNarrowDown (196行)
- **並び替え**: 商品の並び替え機能
- **フィルタ**: 各種条件による絞り込み
- **検索条件**: 検索条件の表示・変更

### NewPublishProductModal
- **新規出品**: 新しい商品の出品登録
- **プラットフォーム選択**: 出品先プラットフォームの選択
- **商品情報入力**: 商品詳細情報の入力

### DetailEcProductModal
- **商品詳細表示**: 商品の詳細情報表示
- **出品情報編集**: 出品情報の編集
- **出品取り消し**: 個別商品の出品取り消し

### CancelSellModal
- **一括取り消し**: 選択商品の一括出品取り消し
- **確認機能**: 取り消し前の確認処理

## UI/UX設計
- **2段階ボタン**: 新規出品（Primary）、出品取り消し（Secondary）
- **レスポンシブ**: Stack layoutによる柔軟なレイアウト
- **検索・フィルタ**: 直感的な商品検索機能
- **タブ切り替え**: ジャンル別の商品表示

## 使用パターン
1. **商品検索**: ProductSearchで商品を検索
2. **ジャンル選択**: ProductGenreTabでジャンルを選択
3. **商品確認**: 一覧で商品を確認
4. **新規出品**: 「新規出品商品登録」ボタンから新規出品
5. **出品管理**: 商品選択→「出品を取り消す」で一括管理
6. **詳細編集**: 商品クリック→詳細モーダルで編集

## 関連する主要フック
- **useStockSearch**: 在庫商品の検索・取得
- **useStore**: 店舗情報の取得

## 関連ディレクトリ
- `/feature/products/`: 商品関連機能
  - `components/ProductSearch`: 商品検索
  - `components/ProductGenreTab`: ジャンル別タブ
  - `hooks/useNewProductSearch`: 商品検索フック
- `/constants/ecShops`: EC店舗情報定数
- `../settings/`: EC設定との連携
- `../external/`: 外部EC連携

## 開発ノート
- **プラットフォーム対応**: 複数ECプラットフォームへの統一出品管理
- **リアルタイム更新**: 操作後の自動データ更新
- **バッチ処理**: 複数商品の一括操作対応
- **状態管理**: 商品選択状態の適切な管理
- **モーダル管理**: 複数モーダルの状態管理 