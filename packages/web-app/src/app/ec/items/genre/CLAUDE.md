# EC Items Genre - ECジャンル別商品表示機能

## 目的
商品をジャンル・カテゴリ別に分類して表示する機能を提供し、ユーザーが興味のあるジャンルの商品を効率的に探索できるようにする

## 機能概要
- **ジャンル別商品表示**: 特定ジャンルの商品一覧表示
- **動的ルーティング**: [genre]パラメータによるジャンル別ページ
- **商品フィルタ**: ジャンル別の商品絞り込み機能
- **ソート機能**: 価格・人気・新着順での商品並び替え
- **無限スクロール**: 大量商品の効率的な段階的表示

## 内容概要
```
packages/web-app/src/app/ec/items/genre/
├── CLAUDE.md                   # ジャンル機能概要（本ファイル）
└── [genre]/                    # 特定ジャンル商品一覧
    ├── page.tsx                # ジャンル別商品一覧ページ（400行）
    └── CLAUDE.md               # ジャンル詳細ページ機能
```

## 重要ファイル
- `[genre]/page.tsx`: 特定ジャンルの商品一覧ページ - 高機能な商品表示システム
- `[genre]/CLAUDE.md`: ジャンル詳細ページの技術仕様

## 主要機能実装

### 1. ジャンル別商品表示システム
```typescript
// 動的ルーティングによるジャンル別表示
// URL: /ec/items/genre/[genre]
// 例: /ec/items/genre/1 (ポケモンカードゲーム)
//     /ec/items/genre/2 (遊戯王)
//     /ec/items/genre/3 (デュエルマスターズ)

// パラメータ処理
const params = useParams();
const genre = params.genre as string;

// ジャンル別商品取得
const queryParams = [
  { key: 'genre', value: genre },
  { key: 'hasStock', value: 'true' },
];
```

### 2. 商品表示機能
```typescript
// 表示形式切替
const [view, setView] = useState<'grid' | 'list'>('grid');

// グリッド表示（3列）
{view === 'grid' ? (
  <Grid container spacing={1}>
    {items.map((item) => (
      <Grid item xs={4} key={item.id}>
        <ItemCard item={item} />
      </Grid>
    ))}
  </Grid>
) : (
  // リスト表示
  <Stack spacing={2}>
    {items.map((item) => (
      <ItemList key={item.id} item={item} />
    ))}
  </Stack>
)}
```

### 3. 高度なフィルタリング・並び替え
```typescript
// 並び替え機能
const [orderBy, setOrderBy] = useState<string>('');

// 価格での並び替えのみ提供
<FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
  <Select value={orderBy} onChange={handleSortChange}>
    <MenuItem value="">並び替え</MenuItem>
    {ORDER_KINDS.filter(
      (orderKind) =>
        orderKind.value === ORDER_KIND_VALUE.PRICE_ASC ||
        orderKind.value === ORDER_KIND_VALUE.PRICE_DESC,
    ).map((orderKind) => (
      <MenuItem key={orderKind.value} value={orderKind.value}>
        {orderKind.label}
      </MenuItem>
    ))}
  </Select>
</FormControl>
```

### 4. 無限スクロール統合
```typescript
// useInfiniteScrollカスタムフック活用
const {
  items,
  isLoading,
  hasMore,
  observerTarget,
  initialLoadComplete,
  resetState,
} = useInfiniteScroll(
  queryParams,
  18, // 18件ずつ読み込み
  restoredState.items,
  restoredState.page,
);

// 無限スクロールのローディングインジケーター
{hasMore && initialLoadComplete && (
  <Box
    ref={observerTarget}
    sx={{
      display: 'flex',
      justifyContent: 'center',
      py: 4,
    }}
  >
    {isLoading && <CircularProgress />}
  </Box>
)}
```

### 5. セッションストレージによる状態保持
```typescript
// ECセッションストレージから状態復元
useEffect(() => {
  const restoredData = EcSessionStorageManager.restorePageState(
    window.location.pathname,
    window.location.search,
  );

  if (restoredData) {
    setRestoredState(restoredData);
  }
}, []);

// スクロール位置とアイテム状態の保存
useEffect(() => {
  const saveState = () => {
    EcSessionStorageManager.savePageState(
      window.location.pathname,
      window.location.search,
      window.scrollY,
      items,
    );
  };

  const throttledSaveState = (() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(saveState, 200);
    };
  })();

  window.addEventListener('scroll', throttledSaveState);
  return () => window.removeEventListener('scroll', throttledSaveState);
}, [items]);
```

## 技術実装詳細

### 1. ジャンル別商品取得
```typescript
// ジャンル別商品の取得処理
const fetchItems = async (currentPage: number) => {
  const newItems = await getEcItem({
    hasStock: Boolean(hasStock) || undefined,
    itemGenre: genre?.find((g) => g.id === Number(genreId))?.name || '',
    take: itemsPerPage,
    skip: currentPage * itemsPerPage,
    orderBy,
    // その他のフィルタ条件
  });
  
  if (newItems?.length) {
    setItems((prev) => [...prev, ...newItems]);
  } else {
    setHasMore(false);
  }
};
```

### 2. ヘッダー制御
```typescript
// ヘッダーコンテンツの動的設定
useEffect(() => {
  setHeaderContent(
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <Box>
        <FilterButton />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* 並び替えセレクトボックス */}
        <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
          <Select value={orderBy} onChange={handleSortChange}>
            <MenuItem value="">並び替え</MenuItem>
            {ORDER_KINDS.filter(
              (orderKind) =>
                orderKind.value === ORDER_KIND_VALUE.PRICE_ASC ||
                orderKind.value === ORDER_KIND_VALUE.PRICE_DESC,
            ).map((orderKind) => (
              <MenuItem key={orderKind.value} value={orderKind.value}>
                {orderKind.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* 表示形式切り替えボタン */}
        <IconButton
          onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
          size="small"
          sx={{ border: '1px solid rgba(0, 0, 0, 0.23)', borderRadius: '4px' }}
        >
          {view === 'grid' ? <ViewModuleIcon /> : <ViewListIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}, [setHeaderContent, view, orderBy, isLoading]);
```

### 3. 状態管理最適化
```typescript
// 初回ロード・クエリパラメータ変更の管理
const isInitialLoadRef = useRef(true);
const prevSearchParamsRef = useRef<string>('');

useEffect(() => {
  const currentSearchString = searchParams.toString();
  
  // 初回ロード以外で、実際にクエリパラメータが変更された場合のみsessionStorageをクリア
  if (
    !isInitialLoadRef.current &&
    prevSearchParamsRef.current !== currentSearchString
  ) {
    EcSessionStorageManager.clear();
    resetState();
    setRestoredState({});
  }

  prevSearchParamsRef.current = currentSearchString;
  isInitialLoadRef.current = false;
}, [searchParams, genre]);
```

## 使用パターン

### 1. 基本的なジャンル別商品表示
```typescript
// URL: /ec/items/genre/1
// ジャンルID 1（ポケモンカードゲーム）の商品一覧を表示
```

### 2. 在庫ありフィルタ付き
```typescript
// URL: /ec/items/genre/1?hasStock=true
// ジャンルID 1の在庫ありの商品のみを表示
```

### 3. 価格順並び替え
```typescript
// URL: /ec/items/genre/1?hasStock=true&orderBy=price_asc
// ジャンルID 1の在庫ありの商品を価格昇順で表示
```

### 4. 複合フィルタ
```typescript
// URL: /ec/items/genre/1?hasStock=true&cardConditions=A,B&orderBy=price_desc
// ジャンルID 1の在庫ありの状態A・Bの商品を価格降順で表示
```

## データフロー

### 1. 商品取得フロー
```
1. URLパラメータ解析 → ジャンルID取得
2. クエリパラメータ解析 → フィルタ条件取得
3. useInfiniteScroll → getEcItem API呼び出し
4. 商品データ取得 → 状態更新
5. UI表示更新 → 商品一覧表示
```

### 2. 状態保持フロー
```
1. スクロール・商品データ → EcSessionStorageManager
2. セッションストレージ保存 → 30分間の状態保持
3. ページ復帰時 → 状態復元
4. スクロール位置復元 → 継続的な閲覧体験
```

## 関連ディレクトリ
- `../` - EC商品一覧機能
- `../../(core)/feature/items/` - 商品関連コンポーネント（ItemCard・ItemList・useInfiniteScroll）
- `../../(core)/components/buttons/` - FilterButton
- `../../(core)/contexts/` - HeaderContext・EcLoadingContext
- `../../(core)/utils/` - EcSessionStorageManager
- `../../(core)/constants/` - ORDER_KINDS・ORDER_KIND_VALUE

## 開発ノート
- **ジャンル中心設計**: 特定ジャンルの商品表示に特化した機能
- **16ジャンル対応**: ポケモン・遊戯王・デュエマなど主要TCGジャンルをサポート
- **無限スクロール**: 18件ずつの効率的な段階的読み込み
- **状態保持**: セッションストレージによる30分間の状態保持・復元
- **表示形式**: グリッド（3列）・リスト表示の動的切り替え
- **フィルタ統合**: FilterButtonによる高度なフィルタリング機能
- **パフォーマンス**: メモ化・スロットリング・重複リクエスト防止

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 