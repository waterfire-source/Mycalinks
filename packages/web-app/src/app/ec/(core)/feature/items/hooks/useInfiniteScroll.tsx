import { useEffect, useRef, useState, useCallback } from 'react';
import { useEcItem, EcItem } from '@/app/ec/(core)/hooks/useEcItem';
import { ItemCategoryHandle, ConditionOptionHandle } from '@prisma/client';
import { useEcGenre } from '@/app/ec/(core)/hooks/useEcGenre';
import { MycaAppGenre } from 'backend-core';
import {
  cardCondition,
  boxCondition,
} from '@/app/ec/(core)/constants/condition';
import { itemCategory as itemCategoryList } from '@/app/ec/(core)/constants/itemCategory';
import { useAlert } from '@/contexts/AlertContext';
import { useEcLoading } from '@/app/ec/(core)/contexts/EcLoadingContext';
import { useEcStoreContext } from '@/app/ec/(core)/contexts/EcStoreContext';
type QueryParam = {
  key: string;
  value: string;
};

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
  const { stores } = useEcStoreContext();

  /**
   * クエリパラメータが変更されたとき（画面遷移時や検索条件変更時）の処理
   * - 状態をすべてリセットして初期状態に戻す
   * - ジャンルデータを取得する
   */
  useEffect(() => {
    /**
     * 状態をリセットする関数
     * 画面遷移や検索条件変更時に状態を初期化する
     */
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

  // 商品データ取得関数の定義
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

      // 在庫のクエリパラメータを取得
      const hasStock = queryParams.find((param) => param.key === 'hasStock')
        ?.value;

      // カードとボックスのコンディションのクエリパラメータを取得
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

      // ジャンルのクエリパラメータを取得
      const genreId = queryParams.find((param) => param.key === 'genre')?.value;

      // 商品カテゴリーのクエリパラメータを取得
      const itemCategory = Array.from(
        queryParams
          .find((param) => param.key === 'category')
          ?.value?.split(',') ||
          itemCategoryList.map((category) => category.value),
      ) as ItemCategoryHandle[];

      // レアリティのクエリパラメータを取得し、配列に変換
      const rarity = queryParams.find((param) => param.key === 'rarity')?.value;

      // タイプのクエリパラメータを取得
      const cardType =
        queryParams.find((param) => param.key === 'card_type')?.value ||
        undefined;

      // カードシリーズのクエリパラメータを取得
      const cardSeries =
        queryParams.find((param) => param.key === 'cardseries')?.value ||
        undefined;

      // ソート順のクエリパラメータを取得
      const orderBy =
        queryParams.find((param) => param.key === 'orderBy')?.value ||
        undefined;

      // カード名のクエリパラメータを取得
      const name =
        queryParams.find((param) => param.key === 'name')?.value || undefined;

      // オプションパラメータの取得
      const option1 =
        queryParams.find((param) => param.key === 'option1')?.value ||
        undefined;

      const option2 =
        queryParams.find((param) => param.key === 'option2')?.value ||
        undefined;

      const option3 =
        queryParams.find((param) => param.key === 'option3')?.value ||
        undefined;

      const option4 =
        Number(queryParams.find((param) => param.key === 'option4')?.value) ||
        undefined;

      const option5 =
        queryParams.find((param) => param.key === 'option5')?.value ||
        undefined;

      const option6 =
        queryParams.find((param) => param.key === 'option6')?.value ||
        undefined;

      // specialty パラメータの取得
      const specialty =
        queryParams.find((param) => param.key === 'specialty')?.value ||
        undefined;

      // displaytype2 パラメータの取得
      const displayType2 =
        queryParams.find((param) => param.key === 'displaytype2')?.value ||
        undefined;

      // myca_primary_pack_idのクエリパラメータを取得
      const mycaPrimaryPackId =
        queryParams.find((param) => param.key === 'myca_primary_pack_id')
          ?.value || undefined;

      // storeIds未設定の場合は、コンテキストから取得した全店舗をセット
      const storeIdsParam = queryParams.find(
        (param) => param.key === 'storeIds',
      )?.value;
      const storeIds =
        storeIdsParam ||
        (stores
          ? stores.map((store) => store.id.toString()).join(',')
          : undefined);

      try {
        // データ取得
        const newItems = await getEcItem({
          hasStock: Boolean(hasStock) || undefined,
          storeIds: storeIds,
          itemGenre: genre?.find((g) => g.id === Number(genreId))?.name || '',
          take: itemsPerPage,
          skip: currentPage * itemsPerPage,
          itemCategory,
          conditionOption,
          rarity,
          orderBy,
          name,
          cardType,
          cardSeries,
          option1,
          option2,
          option3,
          option4,
          option5,
          option6,
          specialty,
          displayType2,
          myca_primary_pack_id: mycaPrimaryPackId,
        });

        if (newItems === null || newItems.length === 0) {
          // データがない場合
          setHasMore(false);
        } else {
          // データがある場合は既存のアイテムに追加（重複を除外）
          setItems((prev) => {
            // 既存のアイテムIDのSetを作成
            const existingIds = new Set(prev.map((item) => item.id));

            // 新しいアイテムから重複を除外
            const uniqueNewItems = newItems.filter(
              (item) => !existingIds.has(item.id),
            );

            // 重複を除外した新しいアイテムを追加
            return [...prev, ...uniqueNewItems];
          });
          setPage(currentPage + 1);
        }

        // 初期ロード完了フラグを設定
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Failed to fetch items:', error);
        setAlertState({
          message: '商品の取得に失敗しました',
          severity: 'error',
        });

        // エラーが発生した場合でも初期ロード完了とする（エラーメッセージを表示するため）
        setInitialLoadComplete(true);
      } finally {
        setIsLoading(false);
        // ECグローバルローディングを終了
        setIsEcLoading(false);
        // リクエスト進行中フラグをリセット
        fetchInProgressRef.current = false;
      }
    },
    [
      genre,
      isLoading,
      hasMore,
      queryParams,
      itemsPerPage,
      getEcItem,
      setAlertState,
      initialLoadComplete,
      page,
      setIsEcLoading,
      stores,
    ],
  );

  // ジャンルデータが読み込まれたら初期データを取得（一度だけ実行）
  useEffect(() => {
    // ジャンルデータがあり、初期ロードが完了しておらず、ページが0の場合のみ実行
    if (
      genre &&
      !initialLoadComplete &&
      page === 0 &&
      !fetchInProgressRef.current
    ) {
      fetchItems(0);
    }
  }, [genre, initialLoadComplete, page, fetchItems]);

  // 無限スクロール処理の設定
  useEffect(() => {
    // 初期ロードが完了していない場合または追加データがない場合は監視を設定しない
    if (!initialLoadComplete || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 画面内に入ったら、かつリクエスト進行中でなければデータを取得
        if (entries[0].isIntersecting && !fetchInProgressRef.current) {
          fetchItems(page);
        }
      },
      {
        threshold: 0.01, // 監視対象が1%表示された時に発火
      },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [page, hasMore, initialLoadComplete, fetchItems]);

  const resetState = () => {
    setItems([]);
    setPage(0);
    setInitialLoadComplete(false);
    setIsLoading(true);
    setIsEcLoading(true);
    setHasMore(true);
    fetchInProgressRef.current = false;
  };

  return {
    items,
    isLoading,
    hasMore,
    observerTarget,
    initialLoadComplete,
    resetState,
  };
};
