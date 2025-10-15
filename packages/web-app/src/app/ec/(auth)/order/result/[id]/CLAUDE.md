# EC注文結果詳細画面

## 目的
注文完了直後の確認画面として、注文内容・配送先・支払い方法を表示し、顧客に安心感を提供する画面

## 機能概要
- **注文完了確認**: 注文確定メッセージ・確認メール案内
- **注文詳細表示**: 指定されたIDの注文情報表示
- **お届け先表示**: アカウント情報からの配送先確認
- **支払い方法確認**: 選択された決済方法の表示
- **商品情報表示**: 店舗別商品一覧の表示

## 技術実装詳細

### 状態管理・データフロー
```typescript
// 251行のコンポーネント、複合的な状態管理
const [order, setOrder] = useState<Order | null>(null);
const [displayAccountInfo, setDisplayAccountInfo] = useState<DisplayAccountInfo>({
  id: 0,
  fullName: '',
  prefecture: '',
  city: '',
  address: '',
  address2: '',
  building: '',
  zipCode: '',
});
const [isLoading, setIsLoading] = useState(true);

// 複合データ取得処理
const fetchData = async () => {
  // 1. アカウント情報取得
  const accountInfo = await getAccountInfo();
  
  // 2. 注文情報取得
  const orderData = await getCartContents();
  
  // 3. 指定IDの注文を検索
  const targetOrder = orderData.orders.find(
    (order) => order.id === Number(orderId)
  );
};
```

### データ構造定義
```typescript
// アカウント表示情報
interface DisplayAccountInfo {
  id: number;
  fullName: string;
  prefecture: string;
  city: string;
  address: string;
  address2: string;
  building: string;
  zipCode: string;
}

// 注文情報
interface Order {
  id: number;
  status: string;
  total_price: number;
  shipping_total_fee: number;
  cart_stores: CartStore[];
  payment_method?: EcPaymentMethod | null;
}
```

### UI/UX設計

#### ステータス表示・完了メッセージ
```typescript
// 進行状況アイコン（ステップ3/3）
<StatusIcon current={3} total={3} />

// 成功時メッセージ
{order ? (
  <>
    <Typography variant="h2" color="primary">
      注文確定。ありがとうございました。
    </Typography>
    <Typography variant="body2" color="gray">
      確認メールが送信されます。
    </Typography>
  </>
) : (
  <Typography variant="h2" color="error">
    該当する注文が存在しません。
  </Typography>
)}
```

#### お届け先情報表示
```typescript
// 配送先住所の表示
<Paper sx={{ p: 2, mb: 2 }}>
  <Typography variant="h6" sx={{ mb: 1 }}>お届け先</Typography>
  
  {/* 郵便番号フォーマット */}
  <Typography variant="body2">
    {displayAccountInfo.zipCode?.includes('-')
      ? displayAccountInfo.zipCode
      : displayAccountInfo.zipCode?.slice(0, 3) + 
        '-' + 
        displayAccountInfo.zipCode?.slice(3)}
  </Typography>
  
  {/* 住所 */}
  <Typography variant="body2">
    {displayAccountInfo.prefecture} {displayAccountInfo.city}{' '}
    {displayAccountInfo.address2} {displayAccountInfo.building}
  </Typography>
  
  {/* 氏名 */}
  <Typography variant="body2">
    {displayAccountInfo.fullName}
  </Typography>
</Paper>
```

#### 支払い方法表示
```typescript
// 決済方法確認
<Paper sx={{ p: 2, mb: 2 }}>
  {order?.payment_method && (
    <Typography variant="body2">
      お支払い方法 :{' '}
      {paymentMethods.find(
        (method) => method.value === order.payment_method,
      )?.label ?? order.payment_method}
    </Typography>
  )}
</Paper>
```

#### 商品情報表示
```typescript
// 店舗別商品一覧
{!order?.cart_stores?.length ? (
  <Paper sx={{ p: 2, mb: 2 }}>
    <Typography variant="body1">商品情報がありません</Typography>
  </Paper>
) : (
  order.cart_stores.map((store, storeIndex) => (
    <StoreCard
      key={store.store_id}
      store={store}
      storeIndex={storeIndex}
      totalStores={order.cart_stores.length}
      onStockChange={() => {}}      // 読み取り専用
      onDelete={() => {}}           // 読み取り専用
      onShopChange={() => {}}       // 読み取り専用
      onShippingMethodChange={() => {}} // 読み取り専用
      viewMode="order"              // 注文表示モード
    />
  ))
)}
```

### エラーハンドリング・状態管理

#### ローディング状態
```typescript
if (isLoading) {
  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={36} />
      </Box>
    </Container>
  );
}
```

#### エラー状態
```typescript
if (!order) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1">
          指定されたIDの注文情報が見つかりませんでした。
        </Typography>
      </Box>
    </Paper>
  );
}
```

#### アカウント情報取得エラー
```typescript
if (accountInfo instanceof CustomError) {
  console.error('アカウント情報の取得に失敗しました');
  setIsLoading(false);
  return;
}
```

### データ取得・処理ロジック

#### 注文検索処理
```typescript
// 注文ID による注文検索
const targetOrder = orderData.orders.find(
  (order) => order.id === Number(orderId)
);

// 注文データの整形
if (targetOrder) {
  setOrder({
    id: targetOrder.id,
    status: targetOrder.status,
    total_price: targetOrder.total_price,
    shipping_total_fee: targetOrder.shipping_total_fee,
    cart_stores: targetOrder.cart_stores,
    payment_method: targetOrder.payment_method,
  });
}
```

#### 郵便番号フォーマット処理
```typescript
// ハイフン自動挿入処理
{displayAccountInfo.zipCode?.includes('-')
  ? displayAccountInfo.zipCode
  : displayAccountInfo.zipCode?.slice(0, 3) + 
    '-' + 
    displayAccountInfo.zipCode?.slice(3)}
```

## 依存関係
- **useParams**: 動的ルーティングパラメータ取得
- **useAppAuth**: アカウント情報取得API
- **useEcOrder**: 注文データ取得API
- **StatusIcon**: 進行状況表示コンポーネント
- **StoreCard**: 店舗別商品表示コンポーネント
- **paymentMethods**: 決済方法定数
- **CustomError**: エラー型定義

## ユーザーエクスペリエンス

### 心理的安心感の提供
- **明確な完了通知**: 「注文確定。ありがとうございました。」
- **次のアクション案内**: 「確認メールが送信されます。」
- **詳細情報確認**: 注文内容・配送先・支払い方法の再確認

### 情報の可視性
- **階層化された情報**: お届け先 → 支払い方法 → 商品詳細
- **読み取り専用表示**: StoreCard の viewMode="order"
- **適切なエラーメッセージ**: 注文が見つからない場合の案内

## パフォーマンス最適化
- **効率的なデータ取得**: アカウント情報と注文情報の並行取得
- **条件分岐最適化**: 注文存在チェックによる無駄な処理回避
- **コンポーネント再利用**: StoreCard の読み取り専用モード活用

## セキュリティ考慮事項
- **認証確認**: useAppAuth による認証状態チェック
- **注文所有権**: ユーザー自身の注文のみアクセス可能
- **エラーログ**: 機密情報を含まないエラーログ出力

## 開発上の特徴
- **複合状態管理**: 注文・アカウント・ローディングの統合管理
- **エラー処理**: CustomError による型安全なエラーハンドリング
- **レスポンシブ**: Container maxWidth="md" による適切な幅制御
- **Material-UI**: 統一されたデザインシステム

## 関連ファイル
- `../../page.tsx`: 注文確認・決済画面（遷移元）
- `../../history/`: 注文履歴機能
- `@/app/ec/(core)/components/cards/StoreCard`: 商品表示コンポーネント
- `@/app/ec/(core)/components/icons/statusIcon`: 進行状況表示
- `@/app/ec/(core)/constants/payment`: 決済方法定数

---
*生成: 2025-01-24 / 項目47 - EC注文結果詳細画面* 