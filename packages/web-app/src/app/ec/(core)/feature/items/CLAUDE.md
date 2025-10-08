# EC Core Feature Items - 商品機能

## 目的
ECサイトの商品一覧・検索・表示に特化したコンポーネント・フック・型定義を提供

## 実装されている機能 (3個)

### hooks/ - 商品関連フック
```
items/hooks/
└── useInfiniteScroll.tsx (350行)
```

### components/ - 商品関連コンポーネント
```
items/components/
├── ItemList.tsx (178行)
├── ItemCard.tsx (189行)
├── PurchaseButton.tsx (34行)
├── ItemDetailShopInfo.tsx (47行)
├── ItemDetailInfo.tsx (40行)
└── ItemDetailCard.tsx (60行)
```

### types/ - 商品関連型定義
```
items/types/
└── index.ts (22行)
```

## 主要実装

### useInfiniteScroll.tsx (350行) - 無限スクロールフック
```typescript
/**
 * 無限スクロールを実現するためのカスタムフック
 *
 * 画面遷移時や検索条件変更時に商品データを自動的に取得し、
 * スクロールによる追加データの読み込みを行う。
 *
 * 重複リクエストの問題を解決するために fetchInProgressRef を使用して
 * 現在リクエストが進行中かどうかを追跡し、複数回の呼び出しを防止する。
 *
 * @param queryParams 検索条件のクエリパラメータ
 * @param itemsPerPage 1ページあたりの表示件数（デフォルト: 18件）
 */
export const useInfiniteScroll = (
  queryParams: QueryParam[],
  itemsPerPage: number = 18, // 1ページあたりの表示件数(デフォルト:18件)
  initialItems?: EcItem[], // 初期アイテム（復元時に使用）
  initialPage?: number, // 初期ページ番号（復元時に使用）
) => {
  /**
   * 状態管理
   */
  // 表示するアイテム一覧
  const [items, setItems] = useState<EcItem[]>(initialItems || []);
  // ローディング中かどうか（画面遷移時は常にtrue）
  const [isLoading, setIsLoading] = useState(!initialItems);
  // 初期データのロードが完了したかどうか（初期ロード中は「商品がありません」メッセージを表示しない）
  const [initialLoadComplete, setInitialLoadComplete] = useState(
    !!initialItems,
  );
  // さらに読み込むデータがあるかどうか
  const [hasMore, setHasMore] = useState(true);
  // 無限スクロール用のIntersection Observer対象要素への参照
  const observerTarget = useRef(null);
  // 現在のページ番号（0から開始）
  const [page, setPage] = useState(initialPage || 0);
  // ジャンルデータ
  const [genre, setGenre] = useState<MycaAppGenre[] | null>(null);

  /**
   * 重複リクエスト防止用のフラグ
   * 画面遷移時やuseEffectの依存配列更新時に複数回fetchItemsが呼ばれるのを防ぐ
   */
  const fetchInProgressRef = useRef(false);

  const { getEcItem } = useEcItem();
  const { getEcGenre } = useEcGenre();
  const { setAlertState } = useAlert();
  const { setIsEcLoading } = useEcLoading();

  /**
   * クエリパラメータが変更されたとき（画面遷移時や検索条件変更時）の処理
   * - 状態をすべてリセットして初期状態に戻す
   * - ジャンルデータを取得する
   */
  useEffect(() => {
    const resetState = () => {
      // 初期アイテムがある場合は復元モード
      if (initialItems && initialItems.length > 0) {
        setItems(initialItems);
        setPage(initialPage || 0);
        setInitialLoadComplete(true);
        setIsLoading(false);
        setIsEcLoading(false);
        setHasMore(true);
        fetchInProgressRef.current = false;
      } else {
        // 通常のリセット処理
        setInitialLoadComplete(false);
        setIsLoading(true);
        setIsEcLoading(true);
        setPage(0);
        setItems([]);
        setHasMore(true);
        fetchInProgressRef.current = false;
      }
    };

    // クエリパラメータが変更されたら状態をリセット
    resetState();

    // ジャンルデータを取得
    const fetchGenre = async () => {
      try {
        const genreData = await getEcGenre();
        if (genreData) {
          setGenre(genreData);
        }
      } catch (error) {
        console.error('Failed to fetch genre data:', error);
        setAlertState({
          message: 'ジャンルの取得に失敗しました',
          severity: 'error',
        });
      }
    };

    fetchGenre();
  }, [queryParams]);

  // 商品データ取得関数の実装
  const fetchItems = useCallback(
    async (currentPage: number) => {
      // ジャンルデータがない場合は何もしない
      if (!genre) return;

      // すでにリクエスト進行中であれば何もしない（重複呼び出し防止）
      if (fetchInProgressRef.current) {
        return;
      }

      // すでにロード中または追加データがない場合はスキップ
      if (isLoading && currentPage > 0) return;
      if (!hasMore && currentPage > 0) return;

      // 初期ロードが完了していて、ページ番号が現在のページと同じ場合はスキップ
      if (initialLoadComplete && currentPage === page - 1) return;

      // リクエスト進行中フラグを設定
      fetchInProgressRef.current = true;

      // ローディング中フラグを設定
      setIsLoading(true);
      // ECグローバルローディングも設定
      setIsEcLoading(true);

      // 各種クエリパラメータの解析と処理
      const hasStock = queryParams.find((param) => param.key === 'hasStock')?.value;
      const cardConditions = Array.from(
        queryParams
          .find((param) => param.key === 'cardConditions')
          ?.value?.split(',') ||
          cardCondition.map((condition) => condition.value),
      );
      const boxConditions = Array.from(
        queryParams
          .find((param) => param.key === 'boxConditions')
          ?.value?.split(',') ||
          boxCondition.map((condition) => condition.value),
      );
      const conditionOption = [
        ...cardConditions,
        ...boxConditions,
      ] as ConditionOptionHandle[];

      const genreId = queryParams.find((param) => param.key === 'genre')?.value;
      const itemCategory = Array.from(
        queryParams
          .find((param) => param.key === 'category')
          ?.value?.split(',') ||
          itemCategoryList.map((category) => category.value),
      ) as ItemCategoryHandle[];

      const rarity = queryParams.find((param) => param.key === 'rarity')?.value;
      const cardType = queryParams.find((param) => param.key === 'type')?.value || undefined;
      const cardSeries = queryParams.find((param) => param.key === 'cardseries')?.value || undefined;
      const orderBy = queryParams.find((param) => param.key === 'orderBy')?.value || undefined;
      const name = queryParams.find((param) => param.key === 'name')?.value || undefined;

      // API呼び出し実行
      // ... (API呼び出し処理)
    },
    [genre, isLoading, hasMore, initialLoadComplete, page, queryParams, getEcItem, setAlertState, setIsEcLoading],
  );

  return {
    items,
    isLoading,
    initialLoadComplete,
    hasMore,
    observerTarget,
    page,
    genre,
    fetchItems,
    resetState: () => {
      setItems([]);
      setPage(0);
      setHasMore(true);
      setIsLoading(false);
      setInitialLoadComplete(false);
      fetchInProgressRef.current = false;
    },
  };
};
```

### ItemList.tsx (178行) - 商品リストアイテム
```typescript
// ReactNativeWebViewの型定義を追加
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

/**
 * 商品リストアイテムコンポーネント
 * @param item 商品情報
 */
export const ItemList = ({ item }: Props) => {
  const searchParams = useSearchParams();
  const currentParams = searchParams.toString();
  const detailUrl = `${PATH.ITEMS.detail(Number(item.id))}?${currentParams}`;

  return (
    <Link href={detailUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
      {/* 商品カード */}
      <Paper
        sx={{
          p: 1,
          '&:hover': {
            cursor: 'pointer',
            bgcolor: 'grey.50',
            transition:
              'background-color 0.2s, transform 0.2s, box-shadow 0.2s',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {/* 商品情報レイアウト */}
        <Stack direction="row" spacing={2}>
          {/* 商品画像 */}
          <Box sx={{ width: 80, height: 80, position: 'relative' }}>
            <Image
              src={item.fullImageUrl ?? '/images/ec/noimage.png'}
              alt={item.cardName}
              width={80}
              height={80}
              style={{ objectFit: 'contain', height: '100%' }}
            />
          </Box>
          {/* 商品詳細情報 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* 商品名 - 2行まで表示 */}
            <Typography
              variant="body2"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {item.cardName}
            </Typography>
            {/* 型番 - 1行まで表示 */}
            <Typography
              variant="caption"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5,
              }}
            >
              {item.expansion} {item.cardNumber}
            </Typography>
            {/* レアリティ - 1行まで表示 */}
            <Typography
              variant="caption"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5,
              }}
            >
              {item.rarity}
            </Typography>
            {/* 在庫状況と価格表示 */}
            {item.topPosProduct.ecStockNumber > 0 &&
            item.topPosProduct.actualEcSellPrice !== null &&
            item.topPosProduct.conditionOptionHandle !== null ? (
              // 在庫ありの場合
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {/* 商品状態 */}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6rem',
                    borderRadius: 0.5,
                    p: '2px',
                    border: '1px solid #f0f0f0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: 'fit-content',
                    maxWidth: '100px',
                    minWidth: '35px',
                  }}
                >
                  {cardCondition.find(
                    (condition) =>
                      condition.value ===
                      item.topPosProduct.conditionOptionHandle,
                  )?.label ||
                    boxCondition.find(
                      (condition) =>
                        condition.value ===
                        item.topPosProduct.conditionOptionHandle,
                    )?.label}
                </Typography>
                {/* 価格表示 */}
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    fontWeight: 'bold',
                    lineHeight: 1.2,
                  }}
                >
                  {item.topPosProduct.actualEcSellPrice?.toLocaleString() ?? 0}
                  円{item.productCount > 1 ? '〜' : ''}
                </Typography>
              </Stack>
            ) : (
              // 在庫なしの場合
              <Typography
                variant="caption"
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: 'fit-content',
                  color: 'white',
                  fontWeight: 'bold',
                  bgcolor: 'black',
                  borderRadius: 100,
                  p: '2px 15px',
                }}
              >
                売り切れ
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>
    </Link>
  );
};
```

### types/index.ts (22行) - 型定義
```typescript
import { EcOrderCartStoreStatus } from '@prisma/client';

export type DetailItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  seller: {
    id: number;
    name: string;
    description?: string;
  };
  modelNumber: string;
  rarity: string;
  stock: number;
  status: EcOrderCartStoreStatus;
  condition: {
    label: string;
    value: string;
  };
};
```

## 主要な技術実装

### 無限スクロール機能 (useInfiniteScroll.tsx - 350行)
- **重複リクエスト防止**: fetchInProgressRef による進行中フラグ管理
- **状態復元**: 初期アイテム・ページ番号による状態復元機能
- **複雑なクエリ処理**: 在庫・コンディション・ジャンル・カテゴリ・レアリティ等の多様な検索条件
- **ページネーション**: 18件ずつの効率的なデータ読み込み
- **Intersection Observer**: スクロール位置による自動データ読み込み

### 商品リスト表示 (ItemList.tsx - 178行)
- **レスポンシブデザイン**: Material-UI による適応的レイアウト
- **ホバー効果**: scale(1.05) + box-shadow による視覚的フィードバック
- **画像最適化**: Next.js Image コンポーネントによる最適化
- **テキスト省略**: WebkitLineClamp による行数制限
- **在庫状況表示**: 在庫あり・売り切れの適切な表示

### ReactNative WebView対応
- **グローバル型定義**: ReactNativeWebView の型定義
- **クロスプラットフォーム**: Web・ReactNative両対応

### 型安全性 (types/index.ts - 22行)
- **商品詳細型**: DetailItem による商品詳細情報の型定義
- **Prisma連携**: EcOrderCartStoreStatus による状態管理
- **販売者情報**: seller オブジェクトによる販売者情報管理

## 使用パターン

### 1. 無限スクロール商品一覧
```typescript
import { useInfiniteScroll } from './hooks/useInfiniteScroll';

const ProductListPage = () => {
  const queryParams = [
    { key: 'genre', value: '1' },
    { key: 'hasStock', value: 'true' },
    { key: 'cardConditions', value: 'A,B' }
  ];

  const {
    items,
    isLoading,
    hasMore,
    observerTarget,
    fetchItems
  } = useInfiniteScroll(queryParams, 18);

  useEffect(() => {
    fetchItems(0);
  }, []);

  return (
    <div>
      {items.map(item => (
        <ItemList key={item.id} item={item} />
      ))}
      {hasMore && <div ref={observerTarget} />}
    </div>
  );
};
```

### 2. 商品リスト表示
```typescript
import { ItemList } from './components/ItemList';

const ProductGrid = ({ products }: { products: EcItem[] }) => {
  return (
    <Grid container spacing={2}>
      {products.map(product => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          <ItemList item={product} />
        </Grid>
      ))}
    </Grid>
  );
};
```

### 3. 状態復元付き無限スクロール
```typescript
import { useInfiniteScroll } from './hooks/useInfiniteScroll';

const ProductListPage = () => {
  const restoredItems = sessionStorage.getItem('products');
  const restoredPage = sessionStorage.getItem('currentPage');

  const {
    items,
    isLoading,
    hasMore,
    observerTarget
  } = useInfiniteScroll(
    queryParams,
    18,
    restoredItems ? JSON.parse(restoredItems) : undefined,
    restoredPage ? Number(restoredPage) : undefined
  );

  return (
    // 商品一覧表示
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコア機能
- `../../hooks/`: 共通フック（useEcItem, useEcGenre）
- `../../constants/`: 定数（condition, itemCategory, paths）
- `../../contexts/`: Context（EcLoadingContext）
- `/contexts/`: アラートContext

## 開発ノート
- **パフォーマンス**: 無限スクロール・画像最適化・重複リクエスト防止
- **UX**: ホバー効果・ローディング状態・売り切れ表示
- **型安全性**: TypeScript による厳密な型定義
- **再利用性**: 複数の商品一覧ページで利用可能
- **状態管理**: 複雑な検索条件・ページネーション・状態復元
- **クロスプラットフォーム**: Web・ReactNative両対応

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 