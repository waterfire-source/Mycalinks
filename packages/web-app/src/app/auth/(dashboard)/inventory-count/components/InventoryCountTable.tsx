import { DetailViewType } from '@/app/auth/(dashboard)/inventory-count/page';
import { InventoryCountData } from '@/feature/inventory-count/hook/useInventoryCount';
import {
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';
import { InventoryCountTableContent } from '@/app/auth/(dashboard)/inventory-count/components/InventoryCountTableContent';

import { z } from 'zod';
import { getInventoriesApi } from '@/../../api-generator/src/defs/inventory/def';
import { useStore } from '@/contexts/StoreContext';

type InventoryFetchArg = z.infer<typeof getInventoriesApi.request.query>;

interface InventoryCountTableProps {
  isLoading: boolean;
  rows: InventoryCountData[];
  genreIds: number[];
  genreNames: string[];
  categoryIds: number[];
  categoryNames: string[];
  handleOpenDetailModal: (data: InventoryCountData) => void;
  setDetailViewType: Dispatch<SetStateAction<DetailViewType>>;
  fetchData: (arg?: InventoryFetchArg) => Promise<void>;
  totalCount?: number;
}

export const InventoryCountTable = ({
  isLoading,
  rows,
  genreIds,
  genreNames,
  categoryIds,
  categoryNames,
  handleOpenDetailModal,
  setDetailViewType,
  fetchData,
  totalCount = 0,
}: InventoryCountTableProps) => {
  const { store } = useStore();
  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(30);

  // フィルタ状態
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  // フィルタやページネーションが変更されたときにデータを取得
  useEffect(() => {
    const params: InventoryFetchArg = {
      skip: currentPage * rowPerPage,
      take: rowPerPage,
    };

    // ステータスフィルタ
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'paused') {
        params.status = 'DRAFT';
      } else if (selectedStatus === 'completed') {
        params.status = 'FINISHED';
      }
    }

    // ジャンルフィルタ
    if (selectedGenreId) {
      params.genre_id = selectedGenreId;
    }

    // カテゴリフィルタ
    if (selectedCategoryId) {
      params.category_id = selectedCategoryId;
    }

    fetchData(params);
  }, [
    currentPage,
    rowPerPage,
    selectedStatus,
    selectedGenreId,
    selectedCategoryId,
    store.id,
  ]);

  // ページ変更ハンドラ
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // ページサイズ変更ハンドラ
  const handleRowPerPageChange = useCallback((newRowPerPage: number) => {
    setRowPerPage(newRowPerPage);
    setCurrentPage(0); // ページサイズ変更時は1ページ目に戻る
  }, []);

  // タブ変更ハンドラ（ステータスフィルタ）
  const handleTabChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setCurrentPage(0); // フィルタ変更時は1ページ目に戻る
  }, []);

  // ジャンルフィルタ変更ハンドラ
  const handleGenreFilterChange = useCallback((genreId: number | null) => {
    setSelectedGenreId(genreId);
    setCurrentPage(0); // フィルタ変更時は1ページ目に戻る
  }, []);

  // カテゴリフィルタ変更ハンドラ
  const handleCategoryFilterChange = useCallback(
    (categoryId: number | null) => {
      setSelectedCategoryId(categoryId);
      setCurrentPage(0); // フィルタ変更時は1ページ目に戻る
    },
    [],
  );

  return (
    <InventoryCountTableContent
      isLoading={isLoading}
      rows={rows}
      genreIds={genreIds}
      genreNames={genreNames}
      categoryIds={categoryIds}
      categoryNames={categoryNames}
      handleOpenDetailModal={handleOpenDetailModal}
      setDetailViewType={setDetailViewType}
      currentPage={currentPage}
      rowPerPage={rowPerPage}
      totalCount={totalCount}
      onPageChange={handlePageChange}
      onRowPerPageChange={handleRowPerPageChange}
      onTabChange={handleTabChange}
      onGenreFilterChange={handleGenreFilterChange}
      onCategoryFilterChange={handleCategoryFilterChange}
    />
  );
};
