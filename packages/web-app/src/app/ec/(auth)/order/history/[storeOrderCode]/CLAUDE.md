# EC注文履歴詳細画面

## 目的
特定の注文の詳細情報を表示し、領収書発行・問い合わせ機能を提供する画面

## 機能概要
- **注文詳細表示**: 注文概要・商品一覧・金額明細の詳細表示
- **領収書発行**: 宛名入力による領収書発行機能
- **問い合わせリンク**: 該当注文への問い合わせ機能
- **配送・支払い情報**: 配送先・配送方法・支払い方法の表示

## 技術実装詳細

### 状態管理・データフロー
```typescript
// 394行の大規模コンポーネント、複雑な状態管理
const [order, setOrder] = useState<TransformedEcOrder>();
const [receiptName, setReceiptName] = useState('');
const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

// データ取得・変換
const fetchOrder = async () => {
  const orderData = await getCartContents();
  if (orderData && orderData.orders) {
    const transformedOrder = getEcOrderByStoreOrderCode(
      orderData,
      storeOrderCode
    );
    setOrder(transformedOrder);
  }
};
```

### データ変換・表示ユーティリティ
```typescript
// 日時フォーマット - 日本語ロケール対応
const formatDateTime = (date?: string | number | Date) =>
  date
    ? new Date(date).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).replace(/\//g, '/').replace(',', '')
    : '日時不明';

// 価格フォーマット - 円表示
const formatPrice = (price?: number) =>
  price !== undefined ? `${price.toLocaleString()}円` : '-';

// 商品状態ラベル変換 - カード・ボックス状態の日本語表示
const getConditionLabel = (handle: string): string => {
  const card = cardCondition.find((c) => c.value === handle);
  if (card) return card.label;
  const box = boxCondition.find((c) => c.value === handle);
  if (box) return box.label;
  return handle;
};
```

### UI/UX設計

#### 注文概要セクション
```typescript
// ヘッダー部分 - 注文基本情報と支払い金額
<Paper elevation={1} sx={{ mb: 3, p: 2 }}>
  <Stack direction="row" justifyContent="space-between">
    <Stack spacing={1}>
      <Typography>注文日時: {formatDateTime(order.orderDate)}</Typography>
      <Typography>注文番号: #{order.storeOrderCode}</Typography>
      <Typography>ショップ: {order.shopName}</Typography>
    </Stack>
    <Stack alignItems="flex-end">
      <Typography variant="caption">支払い金額</Typography>
      <Typography variant="h3" fontWeight="bold">
        {formatPrice(
          order.totalPrice ?? 
          (order.subtotal ?? 0) + (order.shippingFee ?? 0)
        )}
      </Typography>
    </Stack>
  </Stack>
</Paper>
```

#### 商品詳細セクション
```typescript
// 商品一覧 - 画像・詳細情報・価格・数量
{order.items.map((item) => (
  <Stack direction="row" spacing={2} alignItems="center">
    <CardMedia
      component="img"
      image={item.imageUrl ?? 'sample.png'}
      sx={{
        width: { xs: '25%', sm: '15%' },
        objectFit: 'contain',
      }}
    />
    <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
      <Typography variant="body2">{item.name}</Typography>
      <Typography variant="caption">{item.cardnumber}</Typography>
      <Typography variant="caption">{item.rarity}</Typography>
      
      <Stack direction="row" alignItems="center" spacing={1}>
        <Chip
          label={getConditionLabel(item.condition)}
          size="small"
          variant="outlined"
        />
        <Typography variant="body1" fontWeight="bold">
          {formatPrice(item.price)}
        </Typography>
        <Typography variant="body2" style={{ marginLeft: 'auto' }}>
          注文数: {item.quantity}
        </Typography>
      </Stack>
    </Stack>
  </Stack>
))}
```

#### 金額明細セクション
```typescript
// 価格詳細 - 小計・送料・合計
<Stack spacing={1} alignItems="flex-end">
  {[
    { label: '商品の小計', value: order.subtotal },
    { label: '送料', value: order.shippingFee },
  ].map(({ label, value }) => (
    <Stack direction="row" justifyContent="space-between" 
           sx={{ width: { xs: '100%', sm: '60%' } }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body1">{formatPrice(value)}</Typography>
    </Stack>
  ))}
  
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="body1" fontWeight="bold">支払い金額</Typography>
    <Typography variant="body1" fontWeight="bold">
      {formatPrice(order.totalPrice ?? 0)}
    </Typography>
  </Stack>
</Stack>
```

### 領収書発行機能
```typescript
// 領収書機能 - 宛名入力・発行ボタン・モーダル
<Paper elevation={2} sx={{ mb: 3, p: 3 }}>
  <Stack spacing={2}>
    <Typography variant="h4">領収書</Typography>
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        label="宛名"
        variant="outlined"
        size="small"
        value={receiptName}
        onChange={handleNameChange}
        sx={{ flexGrow: 1 }}
      />
      <Button variant="contained" onClick={handleIssueReceipt}>
        発行
      </Button>
    </Stack>
  </Stack>
</Paper>

// 領収書発行モーダル
<ReceiptIssueModal
  isOpen={isReceiptModalOpen}
  onClose={() => setIsReceiptModalOpen(false)}
  receiptName={receiptName}
  onIssue={(name) => console.log('発行用ロジック', name)}
/>
```

### 配送・支払い情報セクション
```typescript
// TODO実装予定の情報セクション
<Paper elevation={2} sx={{ mb: 3, p: 3 }}>
  <Stack spacing={1.5}>
    <Typography variant="h4">お届け先</Typography>
    <Typography variant="body1">{order.shippingAddress}</Typography>
    <Typography variant="body1">{order.customerName}</Typography>
  </Stack>
</Paper>

<Paper elevation={2} sx={{ mb: 3, p: 3 }}>
  <Stack spacing={1.5}>
    <Typography variant="h4">配送方法</Typography>
    <Typography variant="body1">{order.shippingMethod}</Typography>
  </Stack>
</Paper>

<Paper elevation={2} sx={{ mb: 3, p: 3 }}>
  <Stack spacing={1.5}>
    <Typography variant="h4">お支払い方法</Typography>
    <Typography variant="body1">
      {EC_PAYMENT_METHOD_MAP[order.paymentMethod]}
    </Typography>
  </Stack>
</Paper>
```

### 問い合わせリンク機能
```typescript
// 注文問い合わせへの導線
<Stack alignItems="flex-end" sx={{ mt: 1 }}>
  <MuiLink
    href="#"
    underline="always"
    color="primary"
    variant="h5"
    onClick={(e) => {
      e.preventDefault();
      router.push(PATH.ORDER.contact(order.storeOrderCode));
    }}
  >
    この注文について問い合わせる
  </MuiLink>
</Stack>
```

## 依存関係
- **useAppAuth**: ユーザー認証・ID取得
- **useEcOrder**: 注文データ取得API
- **useAlert**: エラー通知システム
- **getEcOrderByStoreOrderCode**: 注文コードによる注文検索ユーティリティ
- **ReceiptIssueModal**: 領収書発行モーダルコンポーネント
- **EC_ORDER_CART_STORE_STATUS_MAP**: 注文状態マッピング
- **EC_PAYMENT_METHOD_MAP**: 支払い方法マッピング
- **cardCondition/boxCondition**: 商品状態定数

## データ構造
```typescript
interface TransformedEcOrder {
  id: string;
  shopName: string;
  orderDate: string | Date;
  storeStatus: string;
  storeOrderCode: string;
  totalPrice?: number;
  subtotal?: number;
  shippingFee?: number;
  shippingAddress: string;
  customerName: string;
  shippingMethod: string;
  paymentMethod: string;
  items: Array<{
    id: string;
    name: string;
    imageUrl?: string;
    cardnumber: string;
    rarity: string;
    condition: string;
    price: number;
    quantity: number;
  }>;
}
```

## ローディング・エラー処理
```typescript
// ローディング状態
if (isLoading) {
  return (
    <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Container>
  );
}

// 注文が見つからない場合
if (!order) {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography align="center">注文が見つかりません。</Typography>
    </Container>
  );
}
```

## パフォーマンス最適化
- **画像最適化**: CardMedia の objectFit: 'contain'
- **レスポンシブ**: width: { xs: '25%', sm: '15%' } による画面サイズ対応
- **メモリ効率**: 必要な状態のみの管理
- **エラーハンドリング**: 適切なエラー状態表示

## ユーザビリティ
- **情報階層**: 概要 → 詳細 → アクションの明確な構造
- **視覚的強調**: 支払い金額の大きなフォント表示
- **アクション明確性**: 領収書発行・問い合わせの明確な導線
- **レスポンシブ**: モバイル対応の適切な幅制御

## 開発上の特徴
- **大規模コンポーネント**: 394行の詳細な実装
- **ユーティリティ活用**: 複数のフォーマット関数による一貫性
- **TODO実装**: 配送・支払い情報の将来実装予定
- **Material-UI**: 統一されたデザインシステム

## 関連ファイル
- `../page.tsx`: 注文履歴一覧画面（遷移元）
- `../../contact/[orderId]/page.tsx`: 注文問い合わせ画面（遷移先）
- `@/app/ec/(core)/utils/transformEcOrder`: データ変換ユーティリティ
- `@/app/ec/(core)/components/modals/ReceiptIssueModal`: 領収書発行モーダル
- `@/app/ec/(core)/constants/`: 各種定数ファイル

---
*生成: 2025-01-24 / 項目45 - EC注文履歴詳細画面* 