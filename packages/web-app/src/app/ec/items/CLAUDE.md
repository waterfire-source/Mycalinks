# EC Items - EC商品一覧機能

## 目的
ECサイトにおける商品表示・検索・詳細確認の中核機能を提供し、顧客の商品発見から購入決定までの体験を支援

## 機能概要
- **商品詳細表示**: 個別商品の詳細情報・フィルタリング・並び替え機能
- **ジャンル別表示**: カテゴリ・ジャンル別商品一覧の動的表示
- **高度な検索**: 商品名・条件・価格での多角的絞り込み
- **無限スクロール**: 18件ずつの段階的読み込みによる快適な商品閲覧
- **状態保持**: セッションストレージによるスクロール位置・検索状態の永続化

## 内容概要
```
packages/web-app/src/app/ec/items/
├── CLAUDE.md                   # 商品機能概要（本ファイル）
├── [id]/                       # 個別商品詳細
│   ├── page.tsx                # 商品詳細ページ（152行）
│   └── CLAUDE.md               # 商品詳細機能仕様
└── genre/                      # ジャンル別商品表示
    ├── CLAUDE.md               # ジャンル機能概要
    └── [genre]/                # 特定ジャンルの商品一覧
        ├── page.tsx            # ジャンル別商品一覧ページ（400行）
        └── CLAUDE.md           # ジャンル詳細ページ機能
```

## 重要ファイル
- `[id]/page.tsx`: 商品詳細ページ - 152行の高機能商品詳細表示システム
- `genre/[genre]/page.tsx`: ジャンル別商品一覧ページ - 400行の大規模商品一覧システム

## 主要機能実装

### 1. 商品詳細表示システム（[id]/page.tsx - 152行）
```typescript
// 動的ルーティングによる商品詳細表示
export default function ECDetailPage({ params, searchParams }: Props) {
  const { getEcProductWithFilters } = useEcProductDetail();
  const [productData, setProductData] = useState<ProductResponse | null>(null);
  
  // クエリパラメータからフィルタリング条件を取得
  const cardConditions = useMemo(
    () => getConditionsFromQuery(searchParams.cardConditions),
    [searchParams.cardConditions, getConditionsFromQuery],
  );
  
  const orderBy = useMemo(
    () => getOrderByFromQuery(searchParams.orderBy),
    [searchParams.orderBy, getOrderByFromQuery],
  );
  
  // フィルタリングオプションを指定してデータ取得
  const data = await getEcProductWithFilters(Number(params.id), {
    cardConditions,
    orderBy,
  });
  
  return <DetailContent data={productData} />;
}
```

### 2. ジャンル別商品一覧システム（genre/[genre]/page.tsx - 400行）
```typescript
// 高度な商品一覧表示システム
export default function ItemsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [orderBy, setOrderBy] = useState<string>('');
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [restoredState, setRestoredState] = useState<RestoredState>({});
  
  // 無限スクロール統合
  const {
    items,
    isLoading,
    hasMore,
    observerTarget,
    initialLoadComplete,
    resetState,
  } = useInfiniteScroll(queryParams, 18, restoredState.items, restoredState.page);
  
  // セッションストレージによる状態保持
  useEffect(() => {
    const restoredData = EcSessionStorageManager.restorePageState(
      window.location.pathname,
      window.location.search,
    );
    if (restoredData) {
      setRestoredState(restoredData);
    }
  }, []);
}
```

### 3. DetailContent統合（335行の大規模コンポーネント）
```typescript
// 商品詳細コンテンツの高度な表示システム
export const DetailContent = ({ data }: Props) => {
  // 有効な商品のみを抽出（在庫・価格・状態チェック）
  const validProducts = useMemo(
    () => data.products.filter(
      (product) =>
        product.ec_stock_number > 0 &&
        product.actual_ec_sell_price !== null &&
        product.condition_option !== null,
    ),
    [data.products],
  );
  
  // 最適商品の選択（状態良好・最安価）
  const topProduct = useMemo(() => {
    return validProducts.reduce((best, current) => {
      const currentHandle = current.condition_option?.handle ?? '';
      const bestHandle = best.condition_option?.handle ?? '';
      const currentPrice = current.actual_ec_sell_price ?? 0;
      const bestPrice = best.actual_ec_sell_price ?? 0;
      
      // 状態が良い順 → 価格が安い順
      if (currentHandle < bestHandle) return current;
      if (currentHandle === bestHandle)
        return currentPrice < bestPrice ? current : best;
      return best;
    }, validProducts[0]);
  }, [validProducts]);
  
  // スクロール制御・モーダル統合・カート機能
  return (
    <>
      <ProductSummaryCard isScrollHeader isVisible={showScrollHeader} />
      <Container maxWidth="md">
        <ProductCard product={topProduct} onAddToCartSuccess={setIsCartNotifyOpen} />
        <ItemInfoTable item={data.mycaItem} />
        <ReportModal isOpen={isReportModalOpen} onClose={handleCloseReportModal} />
        <Alert isOpen={isCartNotifyOpen} message="カートに追加しました" />
      </Container>
    </>
  );
};
```

## 技術実装詳細

### 1. 高度なフィルタリング・並び替え
```typescript
// カード状態フィルタリング
const getConditionsFromQuery = (param: string | string[] | undefined): ConditionOptionHandle[] => {
  if (!param) return [];
  const conditions = Array.isArray(param) ? param[0] : param;
  return decodeURIComponent(conditions)
    .split(',')
    .filter((condition): condition is ConditionOptionHandle =>
      Object.values(ConditionOptionHandle).includes(condition as ConditionOptionHandle),
    );
};

// 並び替え条件の処理
const getOrderByFromQuery = (param: string | string[] | undefined): string => {
  if (!param) return ORDER_KIND_VALUE.PRICE_ASC;
  const orderBy = Array.isArray(param) ? param[0] : param;
  return Object.values(ORDER_KIND_VALUE).includes(orderBy as any)
    ? orderBy
    : ORDER_KIND_VALUE.PRICE_ASC;
};
```

### 2. 無限スクロール・状態管理
```typescript
// 無限スクロール統合（useInfiniteScroll - 350行）
const useInfiniteScroll = (
  queryParams: QueryParam[],
  itemsPerPage: number = 18,
  initialItems?: EcItem[],
  initialPage?: number,
) => {
  const [items, setItems] = useState<EcItem[]>(initialItems || []);
  const [isLoading, setIsLoading] = useState(!initialItems);
  const [initialLoadComplete, setInitialLoadComplete] = useState(!!initialItems);
  const [hasMore, setHasMore] = useState(true);
  const fetchInProgressRef = useRef(false);
  
  // 重複リクエスト防止・データ取得・エラーハンドリング
  const fetchItems = useCallback(async (currentPage: number) => {
    if (fetchInProgressRef.current) return;
    
    try {
      fetchInProgressRef.current = true;
      setIsLoading(true);
      
      const newItems = await getEcItem({
        hasStock: Boolean(hasStock) || undefined,
        itemGenre: genre?.find((g) => g.id === Number(genreId))?.name || '',
        take: itemsPerPage,
        skip: currentPage * itemsPerPage,
        orderBy,
        // ... その他のフィルタ条件
      });
      
      if (newItems?.length) {
        setItems((prev) => [...prev, ...newItems]);
        setPage(currentPage + 1);
      } else {
        setHasMore(false);
      }
      
      setInitialLoadComplete(true);
    } catch (error) {
      setAlertState({ message: '商品の取得に失敗しました', severity: 'error' });
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [queryParams, itemsPerPage]);
  
  return { items, isLoading, hasMore, observerTarget, initialLoadComplete, resetState };
};
```

### 3. セッションストレージによる状態保持
```typescript
// EcSessionStorageManager による状態管理
const EcSessionStorageManager = {
  savePageState: (pathname: string, search: string, scrollY: number, items: EcItem[]) => {
    const key = `ec-${pathname}${search}`;
    sessionStorage.setItem(key, JSON.stringify({
      scrollPosition: scrollY,
      items,
      page: Math.floor(items.length / 18),
      timestamp: Date.now(),
    }));
  },
  
  restorePageState: (pathname: string, search: string): RestoredState | null => {
    const key = `ec-${pathname}${search}`;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      // 30分以内のデータのみ復元
      if (Date.now() - data.timestamp < 30 * 60 * 1000) {
        return data;
      }
    }
    return null;
  },
  
  clear: () => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('ec-')) {
        sessionStorage.removeItem(key);
      }
    });
  },
};
```

## 表示形式・UI制御

### 1. 表示形式切り替え
```typescript
// グリッド表示（3列）・リスト表示の動的切り替え
{view === 'grid' ? (
  <Grid container spacing={1}>
    {items.map((item) => (
      <Grid item xs={4} key={item.id}>
        <ItemCard item={item} />
      </Grid>
    ))}
  </Grid>
) : (
  <Stack spacing={2}>
    {items.map((item) => (
      <ItemList key={item.id} item={item} />
    ))}
  </Stack>
)}
```

### 2. ヘッダー制御・フィルタ統合
```typescript
// ヘッダーコンテンツの動的制御
useEffect(() => {
  setHeaderContent(
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <Box>
        <FilterButton />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
          <Select value={orderBy} onChange={handleSortChange}>
            <MenuItem value="">並び替え</MenuItem>
            {ORDER_KINDS.filter(orderKind => 
              orderKind.value === ORDER_KIND_VALUE.PRICE_ASC ||
              orderKind.value === ORDER_KIND_VALUE.PRICE_DESC
            ).map((orderKind) => (
              <MenuItem key={orderKind.value} value={orderKind.value}>
                {orderKind.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
          {view === 'grid' ? <ViewModuleIcon /> : <ViewListIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}, [view, orderBy, isLoading]);
```

## データフロー・API統合

### 1. 商品データ取得フロー
```
1. URLパラメータ解析 → クエリパラメータ配列生成
2. useInfiniteScroll → getEcItem API呼び出し
3. フィルタリング条件適用 → 商品データ取得
4. 状態更新 → UI表示更新
5. セッションストレージ保存 → 状態永続化
```

### 2. 商品詳細データフロー
```
1. [id]パラメータ取得 → 商品ID特定
2. searchParams解析 → フィルタリング条件抽出
3. getEcProductWithFilters → 商品詳細データ取得
4. DetailContent → 335行の詳細表示レンダリング
5. ProductCard・ItemInfoTable → 商品情報表示
```

## 使用パターン

### 1. 基本的な商品閲覧フロー
```
1. ECトップページ → ジャンル選択
2. /ec/items/genre/[genre] → 商品一覧表示
3. フィルタリング・並び替え → 商品絞り込み
4. 商品クリック → /ec/items/[id] 商品詳細
5. カート追加 → 購入フロー
```

### 2. 高度な検索・フィルタリング
```
1. FilterButton → 詳細条件設定
2. 価格・状態・ジャンル・店舗 → 複合フィルタ
3. URLパラメータ更新 → 検索結果表示
4. 無限スクロール → 追加商品読み込み
5. セッション保存 → 状態永続化
```

### 3. 状態復元・ナビゲーション
```
1. ブラウザバック → セッションストレージ確認
2. 状態復元 → スクロール位置・商品データ復元
3. 継続閲覧 → 中断した場所から再開
4. 新規検索 → セッションクリア・新規取得
```

## 関連ディレクトリ
- `../cart/` - ショッピングカート（商品追加連携）
- `../deck/` - デッキ機能（カード商品特化）
- `../(core)/feature/items/` - 商品関連コンポーネント（ItemCard・ItemList・useInfiniteScroll）
- `../(core)/components/` - 共通コンポーネント（DetailContent・FilterButton・ProductCard）
- `../(core)/hooks/` - カスタムフック（useEcItem・useEcProductDetail）
- `../(core)/utils/` - ユーティリティ（EcSessionStorageManager・transformEcOrder）
- `../../api/ec/` - 商品API（getEcItem・getEcProduct）

## 開発ノート
- **大規模コンポーネント**: DetailContent（335行）・ItemsPage（400行）の複雑な実装
- **無限スクロール最適化**: 重複リクエスト防止・メモリ効率化・エラーハンドリング
- **状態管理**: セッションストレージによる30分間の状態保持・復元機能
- **フィルタリング**: URLパラメータ・クエリパラメータ・API連携の統合システム
- **レスポンシブ**: グリッド（3列）・リスト表示の動的切り替え・モバイル最適化
- **パフォーマンス**: useMemo・useCallback・useRef による最適化・重複処理防止
- **エラーハンドリング**: 商品不存在・API エラー・ネットワークエラーの適切な処理
- **UX最適化**: スクロール位置復元・ローディング表示・段階的データ読み込み

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 