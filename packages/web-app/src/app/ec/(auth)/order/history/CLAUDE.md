# EC注文履歴画面

## 目的
ユーザーの過去の注文履歴を一覧表示し、個別注文の詳細確認への導線を提供する画面

## 機能概要
- **注文履歴一覧**: 過去の注文を時系列で表示
- **注文詳細リンク**: 各注文の詳細画面への遷移
- **商品情報表示**: 注文に含まれる商品の基本情報表示
- **状態管理**: 注文ステータスの可視化

## 技術実装詳細

### 状態管理・データフロー
```typescript
// 280行のコンポーネント、複雑な状態管理
const [orders, setOrders] = useState<TransformedEcOrder[]>([]);
const [isLoading, setIsLoading] = useState(true);

// データ取得・変換・フィルタリング・ソート
const fetchOrders = async () => {
  const orderData = await getCartContents();
  const transformedOrders = transformEcOrder(orderData);
  
  // DRAFT状態の注文を除外
  const nonDraftOrders = transformedOrders.filter(
    (order) => order.storeStatus !== 'DRAFT'
  );
  
  // 複合ソート: 日付 → 注文ID → 店舗ID
  const sortedOrders = nonDraftOrders.sort((a, b) => {
    const dateDiff = dateB.getTime() - dateA.getTime(); // 最新順
    if (dateDiff !== 0) return dateDiff;
    
    const idDiff = Number(b.id) - Number(a.id); // ID降順
    if (idDiff !== 0) return idDiff;
    
    return a.storeId - b.storeId; // 店舗ID昇順
  });
};
```

### データ変換・表示ロジック

#### 日時フォーマット
```typescript
// 日本語ロケール対応の詳細な日時表示
new Date(order.orderDate).toLocaleString('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).replace(/\//g, '/').replace(',', '')
```

#### 商品状態ラベル変換
```typescript
// カード・ボックス状態の日本語表示
const getConditionLabel = (conditionHandle: string): string => {
  const cardMatch = cardCondition.find(
    (condition) => condition.value === conditionHandle
  );
  if (cardMatch) return cardMatch.label;
  
  const boxMatch = boxCondition.find(
    (condition) => condition.value === conditionHandle
  );
  if (boxMatch) return boxMatch.label;
  
  return conditionHandle; // フォールバック
};
```

### UI/UX設計

#### 注文カードレイアウト
```typescript
// 注文ごとのカード構造
<Card key={order.id} sx={{ mb: 3 }}>
  <CardContent>
    {/* ヘッダー部分 */}
    <Stack direction="row" justifyContent="space-between">
      <Stack spacing={0.5}>
        <Typography>{order.shopName}</Typography>
        <Stack direction="row" spacing={1}>
          <Typography>注文日時: {formatDateTime}</Typography>
          <Typography color="primary">
            {EC_ORDER_CART_STORE_STATUS_MAP[order.storeStatus]}
          </Typography>
        </Stack>
        <Typography color="grey">#{order.storeOrderCode}</Typography>
      </Stack>
      
      {/* 詳細ボタン */}
      <Button variant="contained" size="small">詳細</Button>
    </Stack>
    
    {/* 商品一覧 */}
    {order.items.map((item) => (
      <Grid container spacing={2}>
        <Grid item xs={3} sm={2}>
          <CardMedia component="img" image={item.imageUrl} />
        </Grid>
        <Grid item xs={9} sm={10}>
          {/* 商品詳細情報 */}
        </Grid>
      </Grid>
    ))}
  </CardContent>
</Card>
```

#### 商品情報表示
```typescript
// 商品カード内の詳細情報
<Stack spacing={0.2}>
  <Typography variant="body2">{item.name}</Typography>
  <Typography variant="body2">{item.cardnumber}</Typography>
  <Typography variant="body2">{item.rarity}</Typography>
  
  <Stack direction="row" justifyContent="space-between">
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* 状態ラベル */}
      <Box sx={{ border: '1px solid rgba(0, 0, 0, 0.23)', borderRadius: '0.25rem' }}>
        <Typography>{getConditionLabel(item.condition)}</Typography>
      </Box>
      
      {/* 価格 */}
      <Typography sx={{ fontWeight: 'bold', ml: 1 }}>
        {item.price.toLocaleString()}円
      </Typography>
    </Box>
    
    {/* 数量 */}
    <Typography>注文数: {item.quantity}</Typography>
  </Stack>
</Stack>
```

### ローディング・エラー状態

#### ローディング表示
```typescript
if (isLoading) {
  return (
    <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Container>
  );
}
```

#### 空状態処理
```typescript
if (orders.length === 0) {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h2" align="center">注文履歴</Typography>
      <Typography variant="body1" align="center">注文履歴がありません</Typography>
    </Container>
  );
}
```

### ナビゲーション設計
```typescript
// 注文詳細への遷移
const getOrderDetailPath = (storeOrderCode: string) =>
  `/ec/order/history/${encodeURIComponent(storeOrderCode)}`;

// Link コンポーネントによる遷移
<Link href={getOrderDetailPath(order.storeOrderCode)} passHref legacyBehavior>
  <Button variant="contained" size="small">詳細</Button>
</Link>
```

## 依存関係
- **useEcOrder**: 注文データ取得API
- **useAppAuth**: ユーザー認証・ID取得
- **useAlert**: エラー通知システム
- **transformEcOrder**: 注文データ変換ユーティリティ
- **EC_ORDER_CART_STORE_STATUS_MAP**: 注文状態マッピング
- **cardCondition/boxCondition**: 商品状態定数

## データ構造
```typescript
interface TransformedEcOrder {
  id: string;
  shopName: string;
  orderDate: string | Date;
  storeStatus: string;
  storeOrderCode: string;
  storeId: number;
  items: Array<{
    id: string;
    name: string;
    imageUrl: string;
    cardnumber: string;
    rarity: string;
    condition: string;
    price: number;
    quantity: number;
  }>;
}
```

## パフォーマンス最適化
- **フィルタリング**: DRAFT注文の除外による表示データ削減
- **ソート**: 複合ソートによる直感的な並び順
- **画像最適化**: CardMedia の objectFit: 'contain'
- **メモリ効率**: 必要なデータのみの状態管理

## ユーザビリティ
- **視覚的階層**: 注文 → 商品の明確な階層構造
- **情報密度**: 必要十分な情報の適切な配置
- **アクション明確性**: 詳細ボタンの明確な配置
- **レスポンシブ**: Grid システムによるモバイル対応

## 関連ファイル
- `[storeOrderCode]/page.tsx`: 注文詳細画面
- `@/app/ec/(core)/utils/transformEcOrder`: データ変換ユーティリティ
- `@/app/ec/(core)/constants/orderStatus`: 注文状態定数
- `@/app/ec/(core)/constants/condition`: 商品状態定数

---
*生成: 2025-01-24 / 項目44 - EC注文履歴画面* 