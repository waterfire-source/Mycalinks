# EC Items Detail Page - EC商品詳細ページ

## 目的
個別商品の詳細情報を表示し、フィルタリング・並び替え機能を提供する高機能な商品詳細ページ

## 機能概要
- **動的ルーティング**: [id]パラメータによる商品詳細表示
- **フィルタリング機能**: クエリパラメータによるカード状態フィルタリング
- **並び替え機能**: 価格昇順・降順での商品並び替え
- **エラーハンドリング**: 商品不存在時の適切な404処理
- **ローディング状態**: 非同期データ取得中の適切なフィードバック
- **DetailContent統合**: 335行の大規模商品詳細コンポーネント連携

## 内容概要
```
packages/web-app/src/app/ec/items/[id]/
└── page.tsx                    # 商品詳細ページ（152行）
```

## 重要ファイル
- `page.tsx`: 商品詳細ページ - データ取得・フィルタリング・エラーハンドリング

## 主要機能実装

### 1. 動的ルーティング・パラメータ処理
```typescript
// Props型定義
type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// ProductResponseの型定義（CustomErrorを除外）
type ProductResponse = Exclude<EcAPI['getEcProduct']['response'], CustomError>;

// 商品詳細ページコンポーネント
export default function ECDetailPage({ params, searchParams }: Props) {
  const { setAlertState } = useAlert();
  const { getEcProductWithFilters } = useEcProductDetail();
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState<ProductResponse | null>(null);
  const [fetchStarted, setFetchStarted] = useState(false);
```

### 2. 高度なクエリパラメータ処理
```typescript
// カード状態フィルタリング
const getConditionsFromQuery = useCallback(
  (param: string | string[] | undefined): ConditionOptionHandle[] => {
    if (!param) return [];
    const conditions = Array.isArray(param) ? param[0] : param;
    // URLデコードしてから分割し、有効な条件のみをフィルタリング
    return decodeURIComponent(conditions)
      .split(',')
      .filter((condition): condition is ConditionOptionHandle =>
        Object.values(ConditionOptionHandle).includes(
          condition as ConditionOptionHandle,
        ),
      );
  },
  [],
);

// 並び替え条件の処理
const getOrderByFromQuery = useCallback(
  (param: string | string[] | undefined): string => {
    if (!param) return ORDER_KIND_VALUE.PRICE_ASC;
    const orderBy = Array.isArray(param) ? param[0] : param;
    // 有効な並び替え条件かチェック
    return Object.values(ORDER_KIND_VALUE).includes(orderBy as any)
      ? orderBy
      : ORDER_KIND_VALUE.PRICE_ASC;
  },
  [],
);

// クエリパラメータからフィルタリング条件を取得
const cardConditions = useMemo(
  () => getConditionsFromQuery(searchParams.cardConditions),
  [searchParams.cardConditions, getConditionsFromQuery],
);

const orderBy = useMemo(
  () => getOrderByFromQuery(searchParams.orderBy),
  [searchParams.orderBy, getOrderByFromQuery],
);
```

### 3. 非同期データ取得・エラーハンドリング
```typescript
// データ取得関数
const fetchData = useCallback(async () => {
  if (fetchStarted) return;

  try {
    setIsLoading(true);
    setFetchStarted(true);
    // フィルタリングオプションを指定して整形後のデータを取得
    const data = await getEcProductWithFilters(Number(params.id), {
      cardConditions,
      orderBy,
    });

    if (data === null) {
      notFound();
    }

    setProductData(data);
  } catch (error) {
    console.error('Failed to fetch product data:', error);
    setAlertState({
      message: '商品詳細の取得に失敗しました',
      severity: 'error',
    });
    notFound();
  } finally {
    setIsLoading(false);
  }
}, [
  params.id,
  cardConditions,
  orderBy,
  getEcProductWithFilters,
  setAlertState,
  fetchStarted,
]);

// 初回レンダリング時およびクエリパラメータ変更時にのみデータを取得
useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 4. ローディング・エラー状態の表示
```typescript
// ローディング表示
if (isLoading) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        py: 4,
      }}
      component="div"
    >
      {isLoading && <CircularProgress />}
    </Box>
  );
}

// エラー表示
if (!productData) {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h5" color="error">
        商品情報を取得できませんでした
      </Typography>
    </Box>
  );
}

// 正常時はDetailContentコンポーネントに委譲
return <DetailContent data={productData} />;
```

## DetailContent統合（335行の大規模コンポーネント）

### 1. 商品詳細表示の高度な実装
```typescript
// DetailContent.tsx - 335行の大規模コンポーネント
export const DetailContent = ({ data }: Props) => {
  // nullチェックを行い、デフォルト値を設定
  const displayName = data.mycaItem.cardname ?? '-';
  const displayCardNumber = data.mycaItem.cardnumber ?? '-';
  const displayRarity = data.mycaItem.rarity ?? '-';
  const displayImageUrl = data.mycaItem.full_image_url ?? '/images/no-image.png';

  // 有効な商品のみを抽出（在庫があり、価格が設定されている商品）
  const validProducts = useMemo(
    () =>
      data.products.filter(
        (product) =>
          product.ec_stock_number > 0 &&
          product.actual_ec_sell_price !== null &&
          product.condition_option !== null,
      ),
    [data.products],
  );

  // TOPに表示する商品を選択（最も状態が良く、最も安価な商品）
  const topProduct = useMemo(() => {
    if (!hasProducts) return null;

    return validProducts.reduce((best, current) => {
      const currentHandle = current.condition_option?.handle ?? '';
      const bestHandle = best.condition_option?.handle ?? '';
      const currentPrice = current.actual_ec_sell_price ?? 0;
      const bestPrice = best.actual_ec_sell_price ?? 0;

      // 状態が良い順
      if (currentHandle < bestHandle) return current;
      // 状態が同じ場合は価格が安い方
      if (currentHandle === bestHandle)
        return currentPrice < bestPrice ? current : best;
      return best;
    }, validProducts[0]);
  }, [validProducts, hasProducts]);
```

### 2. スクロール制御・モーダル統合
```typescript
// スクロールヘッダーの表示制御
const [showScrollHeader, setShowScrollHeader] = useState(false);
const [isReportModalOpen, setIsReportModalOpen] = useState(false);
const [isCartNotifyOpen, setIsCartNotifyOpen] = useState(false);
const productCardRef = useRef<HTMLDivElement>(null);

// スクロール位置による表示制御
useEffect(() => {
  const handleScroll = () => {
    if (productCardRef.current) {
      const rect = productCardRef.current.getBoundingClientRect();
      setShowScrollHeader(rect.top < 0);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// レンダリング
return (
  <>
    {/* スクロールで表示される固定ヘッダー */}
    <ProductSummaryCard
      product={{
        name: displayName,
        cardNumber: displayCardNumber,
        rarity: displayRarity,
        imageUrl: displayImageUrl,
        price: topProduct?.actual_ec_sell_price ?? null,
      }}
      isScrollHeader
      isVisible={showScrollHeader}
    />

    <Container maxWidth="md" sx={{ px: 0, mt: { xs: '-14px', md: 5 } }}>
      <Card sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight="bold">
            {displayName}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {displayCardNumber + ' ' + displayRarity}
          </Typography>
          
          {/* 商品画像 */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                aspectRatio: '1/1',
                bgcolor: 'white',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Image
                src={displayImageUrl}
                alt={displayName}
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
          </Box>

          {/* 商品購入カード */}
          <Box ref={productCardRef}>
            {hasProducts ? (
              <ProductCard
                product={topProduct!}
                hasTitle
                orderBy="最安値"
                onAddToCartSuccess={() => setIsCartNotifyOpen(true)}
              />
            ) : (
              <Box sx={{ p: 2, textAlign: 'center', color: 'grey.600' }}>
                <Typography variant="h5">
                  現在、購入可能な商品はありません
                </Typography>
              </Box>
            )}
          </Box>

          {/* 商品詳細情報テーブル */}
          <ItemInfoTable item={data.mycaItem} />

          {/* 問題報告ボタン */}
          <Button
            variant="text"
            startIcon={<ErrorOutlineOutlinedIcon />}
            onClick={() => setIsReportModalOpen(true)}
          >
            問題を報告
          </Button>
        </Stack>
      </Card>

      {/* 商品リストセクション */}
      <Box sx={{ p: 1 }} id="product-list">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h3" fontWeight="bold">
            {`${validProducts.length}件の出品`}
          </Typography>
          <SortSelect value={sortOrder} onChange={handleSortChange} />
        </Stack>

        <Stack direction="column" spacing={2}>
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCartSuccess={() => setIsCartNotifyOpen(true)}
            />
          ))}
        </Stack>
      </Box>

      {/* 問題報告モーダル */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        mycaItemId={data.mycaItem.id}
      />

      {/* カート追加通知 */}
      <Alert
        isOpen={isCartNotifyOpen}
        onClose={() => setIsCartNotifyOpen(false)}
        message="カートに追加しました"
      />
    </Container>
  </>
);
```

## 技術実装詳細

### 1. 型安全性・エラーハンドリング
```typescript
// CustomErrorを除外した型定義
type ProductResponse = Exclude<EcAPI['getEcProduct']['response'], CustomError>;

// 重複リクエスト防止
const [fetchStarted, setFetchStarted] = useState(false);
const fetchData = useCallback(async () => {
  if (fetchStarted) return; // 重複リクエスト防止
  // ... データ取得処理
}, [fetchStarted, /* 他の依存配列 */]);

// 404処理
if (data === null) {
  notFound(); // Next.js の notFound() 関数
}
```

### 2. パフォーマンス最適化
```typescript
// useMemoによる計算結果のキャッシュ
const cardConditions = useMemo(
  () => getConditionsFromQuery(searchParams.cardConditions),
  [searchParams.cardConditions, getConditionsFromQuery],
);

const orderBy = useMemo(
  () => getOrderByFromQuery(searchParams.orderBy),
  [searchParams.orderBy, getOrderByFromQuery],
);

// useCallbackによる関数のメモ化
const fetchData = useCallback(async () => {
  // ... データ取得処理
}, [params.id, cardConditions, orderBy, getEcProductWithFilters, setAlertState, fetchStarted]);
```

### 3. URL・クエリパラメータ処理
```typescript
// URLデコード・配列処理・バリデーション
const getConditionsFromQuery = useCallback(
  (param: string | string[] | undefined): ConditionOptionHandle[] => {
    if (!param) return [];
    const conditions = Array.isArray(param) ? param[0] : param;
    return decodeURIComponent(conditions)
      .split(',')
      .filter((condition): condition is ConditionOptionHandle =>
        Object.values(ConditionOptionHandle).includes(
          condition as ConditionOptionHandle,
        ),
      );
  },
  [],
);

// デフォルト値の設定
const getOrderByFromQuery = useCallback(
  (param: string | string[] | undefined): string => {
    if (!param) return ORDER_KIND_VALUE.PRICE_ASC;
    const orderBy = Array.isArray(param) ? param[0] : param;
    return Object.values(ORDER_KIND_VALUE).includes(orderBy as any)
      ? orderBy
      : ORDER_KIND_VALUE.PRICE_ASC;
  },
  [],
);
```

## データフロー・API統合

### 1. 商品詳細データ取得フロー
```
1. URLパラメータ取得 → params.id による商品ID特定
2. クエリパラメータ解析 → cardConditions・orderBy抽出
3. useEcProductDetail → getEcProductWithFilters API呼び出し
4. フィルタリング適用 → 商品詳細データ取得
5. DetailContent → 335行の詳細表示レンダリング
6. ProductCard・ItemInfoTable → 商品情報・購入機能表示
```

### 2. エラーハンドリングフロー
```
1. API呼び出し失敗 → catch ブロック
2. エラーログ出力 → console.error
3. アラート表示 → setAlertState
4. 404ページ表示 → notFound()
5. ユーザーフィードバック → エラーメッセージ表示
```

## 使用パターン

### 1. 基本的な商品詳細表示
```
URL: /ec/items/123
→ 商品ID=123の詳細情報を表示
→ デフォルト並び順（価格昇順）で商品一覧表示
```

### 2. フィルタリング付き商品詳細
```
URL: /ec/items/123?cardConditions=A,B&orderBy=price_desc
→ 商品ID=123の詳細情報を表示
→ 状態A・B のみでフィルタリング
→ 価格降順で並び替え
```

### 3. エラー処理パターン
```
1. 商品不存在 → 404ページ表示
2. API エラー → エラーアラート + 404ページ
3. ネットワークエラー → エラーアラート + 404ページ
4. 不正なパラメータ → デフォルト値で処理継続
```

## 関連ディレクトリ
- `../` - EC商品一覧機能
- `../../(core)/components/` - DetailContent・ProductCard・ItemInfoTable
- `../../(core)/feature/detail/` - useEcProductDetail フック
- `../../(core)/hooks/` - useEcItem・useEcProduct
- `../../(core)/utils/` - 商品データ変換・フォーマット
- `../../../api/ec/` - 商品詳細API（getEcProduct）

## 開発ノート
- **大規模統合**: 152行のpage.tsx + 335行のDetailContent = 487行の複合システム
- **型安全性**: CustomError除外・ConditionOptionHandle・ORDER_KIND_VALUE の厳密な型チェック
- **パフォーマンス**: useMemo・useCallback・重複リクエスト防止による最適化
- **エラーハンドリング**: 多層的なエラー処理・ユーザーフィードバック・404処理
- **フィルタリング**: URLデコード・配列処理・バリデーション・デフォルト値設定
- **UI統合**: スクロール制御・モーダル・アラート・カート機能の統合
- **レスポンシブ**: Container・Card・Grid による適応的レイアウト
- **SEO対応**: 商品詳細の構造化データ・メタデータ・画像最適化

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 