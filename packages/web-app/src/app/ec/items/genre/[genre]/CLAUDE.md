# EC Items Genre Detail Page - ECジャンル別商品一覧ページ

## 目的
特定ジャンルの商品一覧を表示する高機能な動的ページ（400行の大規模コンポーネント）

## 機能概要
- **動的ルーティング**: [genre]パラメータによるジャンル別商品表示
- **表示形式切替**: グリッド表示（3列）とリスト表示の動的切り替え
- **並び替え機能**: 価格昇順・降順での商品ソート
- **無限スクロール**: 18件ずつの段階的読み込み
- **状態保持**: セッションストレージによるスクロール位置・商品状態の永続化
- **ヘッダー制御**: 動的なヘッダーコンテンツ管理
- **フィルタ機能**: FilterButtonによる商品絞り込み

## 内容概要
```
packages/web-app/src/app/ec/items/genre/[genre]/
└── page.tsx                    # ジャンル別商品一覧ページ（400行）
```

## 重要ファイル
- `page.tsx`: 高機能な商品一覧ページ - 複雑な状態管理と最適化実装

## 主要機能実装

### 1. 高度な状態管理
```typescript
// 複合状態管理
const [view, setView] = useState<'grid' | 'list'>('grid');
const [orderBy, setOrderBy] = useState<string>('');
const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
const [restoredState, setRestoredState] = useState<RestoredState>({});

// 参照管理による最適化
const isInitialLoadRef = useRef(true);
const prevSearchParamsRef = useRef<string>('');
const scrollRestoredRef = useRef(false);

// パラメータ管理
const params = useParams();
const genre = params.genre as string;
const searchParams = useSearchParams();
const router = useRouter();
```

### 2. 無限スクロール統合
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
    component="div"
  >
    {isLoading && <CircularProgress />}
  </Box>
)}
```

### 3. セッションストレージによる高度な状態保持
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

// スクロール位置とアイテム状態の保存（統一されたecキーで管理）
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

  // スクロール位置を定期的に保存
  window.addEventListener('scroll', throttledSaveState);

  // ページを離れる前に状態を保存
  const handleBeforeUnload = () => {
    saveState();
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('pagehide', handleBeforeUnload);

  return () => {
    window.removeEventListener('scroll', throttledSaveState);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('pagehide', handleBeforeUnload);
  };
}, [items]);
```

### 4. URLパラメータ・クエリパラメータの高度な処理
```typescript
// URLのクエリパラメータとパスパラメータが変更された時の処理
useEffect(() => {
  const currentSearchString = searchParams.toString();
  const params = new URLSearchParams(currentSearchString);
  const paramList: QueryParam[] = [];

  // 初回ロード以外で、実際にクエリパラメータが変更された場合のみsessionStorageをクリア
  if (
    !isInitialLoadRef.current &&
    prevSearchParamsRef.current !== currentSearchString
  ) {
    EcSessionStorageManager.clear();
    resetState();
    setRestoredState({});
  }

  // 前回のクエリパラメータを更新
  prevSearchParamsRef.current = currentSearchString;
  // 初回ロードフラグを無効化
  isInitialLoadRef.current = false;

  // genreをクエリパラメータとして追加
  if (genre) {
    paramList.push({ key: 'genre', value: genre });
  }

  params.forEach((value, key) => {
    paramList.push({ key, value });
  });
  setQueryParams(paramList);
  setOrderBy(
    (paramList.find((param) => param.key === 'orderBy')?.value as
      | OrderKind['value']
      | null) || '',
  );
}, [searchParams, genre]);
```

### 5. 動的ヘッダーコンテンツ管理
```typescript
// ヘッダーコンテンツの設定
useEffect(() => {
  setHeaderContent(
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Box>
        <FilterButton />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* 並び替えセレクトボックス */}
        <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
          <Select
            value={orderBy}
            onChange={handleSortChange}
            displayEmpty
            disabled={isEcLoading || isLoading}
            sx={{ height: '36px' }}
          >
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
          onClick={() => {
            view === 'grid' ? setView('list') : setView('grid');
          }}
          size="small"
          sx={{
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: '4px',
          }}
        >
          {view === 'grid' ? <ViewModuleIcon /> : <ViewListIcon />}
        </IconButton>
      </Box>
    </Box>,
  );

  // コンポーネントのアンマウント時にヘッダーコンテンツをクリア
  return () => setHeaderContent(null);
}, [setHeaderContent, view, orderBy, isLoading]);
```

### 6. スクロール位置復元システム
```typescript
// 商品データが読み込まれた後のスクロール位置復元
useEffect(() => {
  if (
    initialLoadComplete &&
    items.length > 0 &&
    !scrollRestoredRef.current &&
    restoredState.scrollPosition
  ) {
    scrollRestoredRef.current = true;

    // DOM更新を待ってからスクロール位置を復元
    const restoreScrollPosition = () => {
      window.scrollTo({
        top: restoredState.scrollPosition!,
        behavior: 'auto', // 即座に移動
      });
    };

    // requestAnimationFrameを使用してDOM更新後に実行
    requestAnimationFrame(() => {
      setTimeout(restoreScrollPosition, 100);
    });
  }
}, [initialLoadComplete, items.length, restoredState.scrollPosition]);

// ページ表示時にブラウザバックかどうかを検知
useEffect(() => {
  const handlePageShow = (event: PageTransitionEvent) => {
    // bfcache（back-forward cache）から復元された場合
    if (event.persisted) {
      scrollRestoredRef.current = false;
      const scrollKey = `scroll-${window.location.pathname}${window.location.search}`;
      const savedScrollPosition = sessionStorage.getItem(scrollKey);

      if (savedScrollPosition) {
        const scrollY = parseInt(savedScrollPosition, 10);
        window.scrollTo({
          top: scrollY,
          behavior: 'auto',
        });
      }
    }
  };

  window.addEventListener('pageshow', handlePageShow);

  return () => {
    window.removeEventListener('pageshow', handlePageShow);
  };
}, []);
```

### 7. 並び替え変更処理
```typescript
// 並び替え変更時の処理
const handleSortChange = (event: SelectChangeEvent) => {
  const newOrderBy = event.target.value;

  // sessionStorageをクリア（新しい並び替え条件での検索のため）
  EcSessionStorageManager.clear();

  const params = new URLSearchParams(window.location.search);
  if (newOrderBy) {
    params.set('orderBy', newOrderBy);
  } else {
    params.delete('orderBy');
  }

  // Next.jsのrouter.pushを使用してURLを更新
  const newUrl = `${window.location.pathname}${
    params.toString() ? `?${params.toString()}` : ''
  }`;

  // 初回ロードフラグをリセットして、URLパラメータ変更時の処理を確実に実行
  isInitialLoadRef.current = false;

  router.push(newUrl, { scroll: false });
};
```

### 8. 表示形式切り替え・条件分岐レンダリング
```typescript
return (
  <Container maxWidth="md" sx={{ py: 3, my: 3 }}>
    {/* 初期ロード中表示 - 初期ロードが完了していない場合は常にローディング表示 */}
    {!initialLoadComplete ? (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    ) : items.length > 0 ? (
      // 商品一覧の表示 - 初期ロードが完了していて商品がある場合
      <>
        {view === 'grid' ? (
          // グリッド表示
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
      </>
    ) : (
      // 商品が存在しない場合のメッセージ - 初期ロードが完了していて商品がない場合
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
        }}
      >
        <SearchOffIcon sx={{ fontSize: 64, color: 'grey.600' }} />
        <Typography variant="body2" color="grey.600">
          対象の商品が存在しません
        </Typography>
        <Typography variant="body2" color="grey.600">
          検索条件を変更して再度お試しください
        </Typography>
      </Box>
    )}

    {/* 無限スクロールのローディングインジケーター */}
    {hasMore && initialLoadComplete && (
      <Box
        ref={observerTarget}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 4,
        }}
        component="div"
      >
        {isLoading && <CircularProgress />}
      </Box>
    )}
  </Container>
);
```

## 技術実装詳細

### 1. 状態管理アーキテクチャ
```typescript
// 複合状態管理システム
type QueryParam = {
  key: string;
  value: string;
};

type RestoredState = {
  scrollPosition?: number;
  items?: EcItem[];
  page?: number;
  timestamp?: number;
};

// 状態管理の階層構造
1. React State → 即座の UI 更新
2. URL Parameters → ブラウザ履歴・共有可能な状態
3. Session Storage → ページ間の状態保持
4. Context API → グローバル状態（ヘッダー・ローディング）
```

### 2. パフォーマンス最適化
```typescript
// スロットリング処理
const throttledSaveState = (() => {
  let timeoutId: NodeJS.Timeout;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(saveState, 200);
  };
})();

// 重複リクエスト防止
const isInitialLoadRef = useRef(true);
const prevSearchParamsRef = useRef<string>('');

// DOM更新後の処理
requestAnimationFrame(() => {
  setTimeout(restoreScrollPosition, 100);
});
```

### 3. ブラウザ互換性対応
```typescript
// bfcache（back-forward cache）対応
const handlePageShow = (event: PageTransitionEvent) => {
  if (event.persisted) {
    scrollRestoredRef.current = false;
    // スクロール位置復元処理
  }
};

// 複数のページ離脱イベント対応
window.addEventListener('beforeunload', handleBeforeUnload);
window.addEventListener('pagehide', handleBeforeUnload);
```

## データフロー・API統合

### 1. 商品データ取得フロー
```
1. URLパラメータ解析 → ジャンルID・クエリパラメータ抽出
2. useInfiniteScroll → queryParams配列生成
3. getEcItem API → フィルタ条件適用・商品データ取得
4. 状態更新 → items配列更新・UI再レンダリング
5. セッションストレージ保存 → 状態永続化
```

### 2. 状態復元フロー
```
1. ページ表示時 → EcSessionStorageManager.restorePageState
2. 30分以内のデータ確認 → タイムスタンプ検証
3. 状態復元 → items・page・scrollPosition復元
4. DOM更新後 → スクロール位置復元
5. 継続的な閲覧 → 中断した場所から再開
```

### 3. URL同期フロー
```
1. 並び替え変更 → handleSortChange
2. URLパラメータ更新 → router.push
3. useEffect発火 → クエリパラメータ解析
4. 状態リセット → EcSessionStorageManager.clear
5. 新規データ取得 → useInfiniteScroll再実行
```

## 使用パターン

### 1. 基本的なジャンル別商品表示
```
URL: /ec/items/genre/1
→ ジャンルID=1（ポケモンカードゲーム）の商品一覧
→ デフォルト表示（グリッド・18件・価格昇順）
```

### 2. 高度なフィルタリング・並び替え
```
URL: /ec/items/genre/1?hasStock=true&cardConditions=A,B&orderBy=price_desc
→ ジャンルID=1の商品一覧
→ 在庫あり・状態A/B・価格降順
```

### 3. 状態復元パターン
```
1. 商品一覧閲覧 → スクロール・フィルタ設定
2. 商品詳細遷移 → 状態セッション保存
3. ブラウザバック → 状態復元・スクロール位置復元
4. 継続閲覧 → 中断した場所から再開
```

### 4. 表示形式切り替え
```
1. グリッド表示（デフォルト） → 3列・コンパクト表示
2. リスト表示 → 1列・詳細表示
3. 動的切り替え → IconButton・即座の表示更新
```

## 関連ディレクトリ
- `../` - ECジャンル別商品表示機能
- `../../` - EC商品一覧機能
- `../../../(core)/feature/items/` - 商品関連コンポーネント（ItemCard・ItemList・useInfiniteScroll）
- `../../../(core)/components/buttons/` - FilterButton
- `../../../(core)/contexts/` - HeaderContext・EcLoadingContext
- `../../../(core)/utils/` - EcSessionStorageManager
- `../../../(core)/constants/` - ORDER_KINDS・ORDER_KIND_VALUE

## 開発ノート
- **大規模実装**: 400行の複雑な状態管理・最適化システム
- **無限スクロール**: 18件ずつの効率的な段階的読み込み・重複リクエスト防止
- **状態保持**: 30分間のセッションストレージ・スクロール位置復元・ブラウザバック対応
- **パフォーマンス**: スロットリング（200ms）・requestAnimationFrame・メモリ効率化
- **ブラウザ互換**: bfcache対応・複数ページ離脱イベント・クロスブラウザ対応
- **URL同期**: クエリパラメータ・ブラウザ履歴・共有可能な状態管理
- **レスポンシブ**: グリッド（3列）・リスト表示・モバイル最適化
- **エラーハンドリング**: 空状態・ローディング状態・ネットワークエラー対応
- **UX最適化**: 即座の表示更新・滑らかなスクロール・直感的な操作

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 