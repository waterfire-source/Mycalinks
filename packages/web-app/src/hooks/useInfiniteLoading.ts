import { useState, useCallback } from 'react';

interface InfiniteLoaderProps<T> {
  fetchItems: (
    page: number,
    itemsPerPage: number,
    isPack?: true,
  ) => Promise<T[]>; // ページ取得関数
  itemsPerPage: number; // 1ページあたりの取得アイテム数
  isPackItem?: boolean; //パックアイテムかどうか
}

export const useInfiniteLoader = <T>({
  fetchItems,
  itemsPerPage,
  isPackItem = false,
}: InfiniteLoaderProps<T>) => {
  const [items, setItems] = useState<T[]>([]); // 累積結果
  const [currentPage, setCurrentPage] = useState(0); // 現在のページ番号
  const [isLoading, setIsLoading] = useState(false); // ローディング状態
  const [hasMore, setHasMore] = useState(true); // 追加データの有無
  const [newItems, setNewItems] = useState<T[]>([]); // 新しいページのアイテム

  // 新しいページのアイテムを取得する関数
  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const fetchedNewItems = await fetchItems(
        currentPage + 1,
        itemsPerPage,
        isPackItem ? true : undefined,
      );
      setNewItems(fetchedNewItems);
      setItems((prevItems) => [...prevItems, ...fetchedNewItems]);
      setCurrentPage((prevPage) => prevPage + 1);
      setHasMore(fetchedNewItems.length === itemsPerPage); // 取得件数が itemsPerPage 未満の場合、データがもうないと判定
    } catch (error) {
      console.error('Error fetching items:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, fetchItems, currentPage, itemsPerPage, isPackItem]);

  // 検索結果をリセットして新しい検索を開始する関数
  const resetItemsAndSearch = useCallback(async () => {
    if (isLoading) return;

    setItems([]);
    setCurrentPage(0);
    setHasMore(true);
    setIsLoading(true);
    setNewItems([]);
    // 通常はありえないが、短時間でこの関数が呼ばれると、全く同じデータが二回分入ることがある。これを防ぐための保険。
    let isCurrent = true; // リクエストが最新かどうか

    try {
      const newItems = await fetchItems(
        0,
        itemsPerPage,
        isPackItem ? true : undefined,
      );
      if (!isCurrent) return; // もし古いリクエストなら何もしない
      setItems(newItems);
      setNewItems(newItems);
      setHasMore(newItems.length === itemsPerPage);
    } catch (error) {
      if (isCurrent) {
        console.error('Error fetching items:', error);
        setHasMore(false);
      }
    } finally {
      if (isCurrent) setIsLoading(false);
      isCurrent = false;
    }
  }, [isLoading, fetchItems, itemsPerPage, isPackItem]);

  return {
    items,
    isLoading,
    loadMoreItems,
    resetItemsAndSearch,
    hasMore,
    newItems,
  };
};
