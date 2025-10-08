# EC Cart - ECショッピングカート機能

## 目的
ECサイトにおけるショッピングカート機能を提供し、商品選択から決済前までの複雑な購入フローを管理

## 機能概要
- **カート管理**: 商品追加・削除・数量変更・ショップ変更
- **配送方法選択**: 都道府県別配送方法・料金計算
- **在庫不足対応**: デッキ購入時の在庫不足商品モーダル表示
- **決済準備**: 配送方法確認・合計金額計算・注文画面遷移

## 内容概要
```
packages/web-app/src/app/ec/cart/
└── page.tsx                    # カートメイン画面 (962行)
```

## 重要ファイル
- `page.tsx`: カートメイン画面 - 複雑なカート操作の統合管理

## 主要機能実装

### 1. カート状態管理
```typescript
// 複合状態管理
const [cartData, setCartData] = useState<EcOrderData | null>(null);
const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
const [prefecture, setPrefecture] = useState<number>(13); // 東京都
const [isLoading, setIsLoading] = useState(false);
const [isUpdate, setIsUpdate] = useState(false);

// DRAFT注文の最新取得
const draftOrders = cart.orders?.filter((order) => order.status === 'DRAFT') || [];
const targetOrder = draftOrders.length > 0
  ? draftOrders.reduce((max, current) => (current.id > max.id ? current : max), draftOrders[0])
  : null;
```

### 2. 商品操作機能
```typescript
/**
 * カートの数量変更処理
 */
const handleStockChange = async (productId: number, value: number) => {
  if (!cartData?.orders?.[0] || isUpdate) return;
  setIsUpdate(true);
  
  const updatedCart = structuredClone(cartData);
  // 商品数量更新ロジック
  const updatedOrderResult = await createOrUpdateEcOrder({
    includesShippingMethodCandidates: true,
    body: { shippingAddressPrefecture: getPrefectureName(prefecture), cartStores }
  });
};

/**
 * 商品削除処理
 */
const handleDelete = async (productId: number) => {
  // 商品削除・空ストア除外ロジック
};

/**
 * ショップ変更処理
 */
const handleShopChange = async (updateInfo: ShopChangeUpdateInfo) => {
  // 複雑なショップ間商品移動ロジック
};
```

### 3. 配送方法管理
```typescript
/**
 * 配送方法変更処理
 */
const handleShippingMethodChange = async (storeId: number, methodId: number) => {
  // 配送方法更新・料金再計算
};

/**
 * 都道府県変更時の処理
 */
const handlePrefectureChange = async (prefectureId: number) => {
  // 配送方法候補更新・自動選択ロジック
};

// 配送方法未選択チェック
const getUnselectedShippingMethodStoreId = () => {
  const unselectedStore = displayCart.cart_stores.find(
    (store) => store.shipping_method_id === null && 
               store.shippingMethodCandidates && 
               store.shippingMethodCandidates.length > 0
  );
  return unselectedStore?.store_id || null;
};
```

### 4. 在庫不足商品対応
```typescript
// 在庫不足商品のステート
const [insufficientProducts, setInsufficientProducts] = useState<InsufficientProduct[]>([]);
const [modalOpen, setModalOpen] = useState(false);

useEffect(() => {
  const products = getInsufficientProducts();
  if (products) {
    setInsufficientProducts(products);
    setModalOpen(true);
  }
}, []);

// InsufficientProductsModal表示
<InsufficientProductsModal
  open={modalOpen}
  onClose={handleCloseModal}
  insufficientProducts={insufficientProducts}
/>
```

## UI/UX設計

### レイアウト構成
```typescript
<Container maxWidth="md">
  {/* ステータスアイコン・都道府県選択 */}
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
    <StatusIcon current={1} total={3} />
    <Typography variant="h2">カート</Typography>
    <PrefectureSelect onPrefectureChange={handlePrefectureChange} />
  </Box>

  {/* カート詳細サマリー */}
  <Paper sx={{ p: 2, mb: 4 }}>
    <Typography>ショップ数: {displayCart?.cart_stores?.length || 0}店舗</Typography>
    <Typography>商品: {totalProductCount}点</Typography>
    <Typography>商品合計: ¥{productTotal.toLocaleString()}</Typography>
    <Typography>送料: ¥{displayCart?.shipping_total_fee?.toLocaleString()}</Typography>
    <Typography>カート小計: ¥{displayCart?.total_price?.toLocaleString()}</Typography>
    
    {/* アクションボタン */}
    <Button onClick={() => router.push(PATH.TOP)}>買い物を続ける</Button>
    <Button onClick={handlePaymentSelect}>お支払い方法の選択</Button>
  </Paper>

  {/* ストアカード一覧 */}
  {displayCart?.cart_stores?.map((store, storeIndex) => (
    <StoreCard
      key={store.store_id}
      store={store}
      onStockChange={handleStockChange}
      onDelete={handleDelete}
      onShopChange={handleShopChange}
      onShippingMethodChange={handleShippingMethodChange}
    />
  ))}
</Container>
```

### 更新中UI
```typescript
{isUpdate && (
  <Box sx={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1300
  }}>
    <CircularProgress />
    <Typography variant="body2">更新中...</Typography>
  </Box>
)}
```

## データフロー

### 1. カート初期化
```
useEffect → getCartContents → DRAFT注文取得 → createOrUpdateEcOrder → 配送方法候補取得
```

### 2. 商品操作フロー
```
操作実行 → structuredClone(cartData) → ローカル更新 → createOrUpdateEcOrder → API更新 → 状態反映
```

### 3. 決済遷移フロー
```
handlePaymentSelect → 認証チェック → 配送方法未選択チェック → アラート表示 or 注文画面遷移
```

## 技術実装

### 複雑な状態同期
```typescript
// 表示用カートデータの合成
const displayCart = cartData?.orders?.[0] ? {
  ...cartData.orders[0],
  cart_stores: cartData.orders[0].cart_stores.map((store) => {
    const orderStore = orderResult?.cart_stores.find(s => s.store_id === store.store_id);
    return {
      ...store,
      shipping_method_id: store.shipping_method_id !== null 
        ? store.shipping_method_id 
        : orderStore?.shipping_method_id ?? null,
      shippingMethodCandidates: orderStore?.shippingMethodCandidates,
      total_price: store.total_price ?? orderStore?.total_price ?? 0,
    };
  }),
} : null;
```

### エラーハンドリング
```typescript
// アラート統合
const [alertOpen, setAlertOpen] = useState(false);
const [alertMessage, setAlertMessage] = useState('');

<Alert
  isOpen={alertOpen}
  onClose={handleAlertClose}
  message={alertMessage}
  severity="error"
  bgColor="#f44336"
/>
```

### パフォーマンス最適化
```typescript
// 更新中の重複操作防止
if (!cartData?.orders?.[0] || isUpdate) return;

// 構造化クローンによる安全な状態更新
const updatedCart = structuredClone(cartData);
```

## 使用パターン

### 1. カート操作
```typescript
// 商品数量変更
await handleStockChange(productId, newQuantity);

// 商品削除
await handleDelete(productId);

// ショップ変更
await handleShopChange({
  parentStoreId, parentProductId, selections, shouldRemoveParent
});
```

### 2. 配送設定
```typescript
// 都道府県変更
await handlePrefectureChange(prefectureId);

// 配送方法選択
await handleShippingMethodChange(storeId, methodId);
```

### 3. 決済遷移
```typescript
// 決済画面へ
const handlePaymentSelect = () => {
  if (!getUserId()) router.push(PATH.LOGIN);
  
  const unselectedStoreId = getUnselectedShippingMethodStoreId();
  if (unselectedStoreId) {
    // 配送方法未選択アラート
    setAlertMessage('配送方法が未選択です');
    setAlertOpen(true);
    return;
  }
  
  router.push(PATH.ORDER.root);
};
```

## 依存関係

### 外部ライブラリ
- **Material-UI**: UI コンポーネント・レイアウト
- **Next.js**: ルーティング・ナビゲーション
- **React**: 状態管理・ライフサイクル

### 内部モジュール
- **useEcOrder**: カート操作・API連携
- **useAppAuth**: 認証状態管理
- **StoreCard**: 店舗別商品表示
- **PrefectureSelect**: 都道府県選択
- **StatusIcon**: 進行状況表示
- **Alert**: アラート表示

## 関連ディレクトリ
- `../(auth)/order/` - 注文確認・決済
- `../items/` - 商品詳細（カート追加元）
- `../(core)/hooks/` - カート操作フック
- `../(core)/components/` - カート関連コンポーネント
- `/feature/deck/` - デッキ購入・在庫不足モーダル

## 開発ノート
- **複雑な状態管理**: cartData と orderResult の2重管理
- **リアルタイム更新**: 操作毎のAPI同期
- **エラー処理**: 統一されたアラート表示
- **パフォーマンス**: 更新中の操作制御
- **UX配慮**: ローディング状態・進行状況表示

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 