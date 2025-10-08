'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Stack,
  Grid,
  Box,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { ItemCard } from '@/app/ec/(core)/feature/items/components/ItemCard';
import { ItemList } from '@/app/ec/(core)/feature/items/components/ItemList';
import { useInfiniteScroll } from '@/app/ec/(core)/feature/items/hooks/useInfiniteScroll';
import { useHeader } from '@/app/ec/(core)/contexts/HeaderContext';
import { FilterButton } from '@/app/ec/(core)/components/buttons/FilterButton';
import { FilterSidebar } from '@/app/ec/(core)/components/filters/FilterSidebar';
import {
  ORDER_KINDS,
  OrderKind,
  ORDER_KIND_VALUE,
} from '@/app/ec/(core)/constants/orderKind';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useEcLoading } from '@/app/ec/(core)/contexts/EcLoadingContext';
import { StoreSelectionBanner } from '@/app/ec/(core)/components/banner/StoreSelectionBanner';
import {
  EcSessionStorageManager,
  type RestoredState,
} from '@/app/ec/(core)/utils/sessionStorage';
import {
  VIEW_TYPES,
  ViewType,
  getItemListViewType,
  saveItemListViewType,
} from '@/app/ec/(core)/utils/ecStorage';
import { useDevice } from '@/app/ec/(core)/contexts/DeviceContext';

/**
 * クエリパラメータの型定義
 */
type QueryParam = {
  key: string;
  value: string;
};

const ITEMS_PER_PAGE = 30;

/**
 * 商品一覧ページコンポーネント
 * グリッド表示とリスト表示の切り替え、並び替え、無限スクロールに対応
 */
export default function ItemsPage() {
  // デバイス判定
  const { isDesktop } = useDevice();

  // 保存された状態を復元
  const [restoredState, setRestoredState] = useState<RestoredState>({});
  // 初回ロードかどうかを追跡
  const isInitialLoadRef = useRef(true);
  // 前回のクエリパラメータを保存
  const prevSearchParamsRef = useRef<string>('');

  // 並び替えの状態管理
  const [orderBy, setOrderBy] = useState<string>('');
  // クエリパラメータの状態管理
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  // viewの状態管理（デフォルトはlocalStorageから取得、なければgrid）
  const [view, setView] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      return getItemListViewType();
    }
    return VIEW_TYPES.GRID;
  });
  // パスパラメータからgenreを取得
  const params = useParams();
  const genre = params.genre as string;
  const searchParams = useSearchParams();
  const router = useRouter();

  // 初期表示時にlocalStorageからviewを再取得（SSR対策）
  useEffect(() => {
    setView(getItemListViewType());
  }, []);

  // URLからviewパラメータを読み取って初期表示を設定
  // パラメータ未指定時はデフォルトでgrid表示
  useEffect(() => {
    // viewパラメータの取得・setView部分を削除
  }, [searchParams]);

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

  // 無限スクロールのカスタムフック
  const {
    items,
    isLoading,
    hasMore,
    observerTarget,
    initialLoadComplete,
    resetState,
  } = useInfiniteScroll(
    queryParams,
    ITEMS_PER_PAGE,
    restoredState.items,
    restoredState.page,
  );
  // ヘッダーコンテンツの制御
  const { setHeaderContent } = useHeader();
  // グローバルローディングの状態管理
  const { isEcLoading } = useEcLoading();

  // スクロール位置復元のための参照
  const scrollRestoredRef = useRef(false);

  /**
   * スクロール位置とアイテム状態の保存（統一されたecキーで管理）
   */
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

  /**
   * URLのクエリパラメータとパスパラメータが変更された時の処理
   * クエリパラメータを解析して状態を更新
   */
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
      // viewパラメータは除外（表示形式は別途管理）
      if (key !== 'view') {
        paramList.push({ key, value });
      }
    });
    setQueryParams(paramList);
    setOrderBy(
      (paramList.find((param) => param.key === 'orderBy')?.value as
        | OrderKind['value']
        | null) || '',
    );
  }, [searchParams, genre]);

  /**
   * 表示形式切り替えの処理
   * localStorageに保存
   */
  const handleViewChange = () => {
    const newView =
      view === VIEW_TYPES.GRID ? VIEW_TYPES.LIST : VIEW_TYPES.GRID;
    setView(newView);
    saveItemListViewType(newView);
  };

  /**
   * 商品データが読み込まれた後のスクロール位置復元
   */
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

  /**
   * ページ表示時にブラウザバックかどうかを検知
   */
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

  /**
   * 並び替え変更時の処理
   * URLのクエリパラメータを更新
   */
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

  /**
   * ヘッダーコンテンツの設定
   * フィルターボタン、並び替え、表示形式切り替え、店舗選択バナーを含む
   */
  useEffect(() => {
    setHeaderContent(
      <Box sx={{ width: '100%' }}>
        {/* フィルター・並び替えコントロール */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* PC版では絞り込みボタンを非表示、SP版では表示 */}
          <Box>
            {!isDesktop && <FilterButton />}
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
            {isDesktop ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={() => view !== VIEW_TYPES.GRID && handleViewChange()}
                  size="small"
                  sx={{
                    border:
                      view === VIEW_TYPES.GRID
                        ? '2px solid primary.main'
                        : '1px solid rgba(0, 0, 0, 0.23)',
                    borderRadius: '4px',
                    backgroundColor:
                      view === VIEW_TYPES.GRID
                        ? 'rgba(211, 47, 47, 0.08)'
                        : 'transparent',
                  }}
                  aria-label="グリッド表示"
                >
                  <ViewModuleIcon
                    color={view === VIEW_TYPES.GRID ? 'error' : 'inherit'}
                  />
                </IconButton>
                <IconButton
                  onClick={() => view !== VIEW_TYPES.LIST && handleViewChange()}
                  size="small"
                  sx={{
                    border:
                      view === VIEW_TYPES.LIST
                        ? '2px solid primary.main'
                        : '1px solid rgba(0, 0, 0, 0.23)',
                    borderRadius: '4px',
                    backgroundColor:
                      view === VIEW_TYPES.LIST
                        ? 'rgba(211, 47, 47, 0.08)'
                        : 'transparent',
                  }}
                  aria-label="リスト表示"
                >
                  <ViewListIcon
                    color={view === VIEW_TYPES.LIST ? 'primary' : 'inherit'}
                  />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                onClick={handleViewChange}
                size="small"
                sx={{
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: '4px',
                }}
              >
                {view === VIEW_TYPES.GRID ? (
                  <ViewModuleIcon />
                ) : (
                  <ViewListIcon />
                )}
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>,
    );

    // コンポーネントのアンマウント時にヘッダーコンテンツをクリア
    return () => setHeaderContent(null);
  }, [setHeaderContent, view, orderBy, isLoading, isDesktop]);

  return (
    <Container
      maxWidth={isDesktop ? false : 'md'}
      sx={{
        py: 3,
        my: 3,
        ...(isDesktop && {
          maxWidth: '95%',
          width: '100%',
        }),
      }}
    >
      {/* 店舗選択バナー */}
      <StoreSelectionBanner />

      {/* PC版とSP版で異なるレイアウト */}
      {isDesktop ? (
        // PC版: 絞り込みサイドメニューと商品一覧を横並びで表示
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* 絞り込みサイドメニュー */}
          <FilterSidebar />
          
          {/* 商品一覧エリア */}
          <Box sx={{ flex: 1 }}>
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
                {view === VIEW_TYPES.GRID ? (
                  // グリッド表示
                  <Grid container spacing={2}>
                    {items.map((item) => (
                      <Grid
                        item
                        xs={4} // モバイル: 3列
                        sm={4} // ~1200px: PC=3列, モバイル=3列
                        lg={3} // 1200px~1536px: PC=4列, モバイル=3列
                        xl={2.4} // 1536px~: PC=5列, モバイル=3列
                        key={item.id}
                      >
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
          </Box>
        </Box>
      ) : (
        // SP版: 従来通りのレイアウト
        <>
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
              {view === VIEW_TYPES.GRID ? (
                // グリッド表示
                <Grid container spacing={1}>
                  {items.map((item) => (
                    <Grid
                      item
                      xs={4} // モバイル: 3列
                      sm={4} // ~1200px: PC=3列, モバイル=3列
                      lg={4} // 1200px~1536px: PC=4列, モバイル=3列
                      xl={4} // 1536px~: PC=5列, モバイル=3列
                      key={item.id}
                    >
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
        </>
      )}
    </Container>
  );
}
