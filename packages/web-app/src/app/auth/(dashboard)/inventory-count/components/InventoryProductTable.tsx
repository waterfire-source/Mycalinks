import { CountableProductType } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryCount';
import {
  useInventoryProducts,
  DiffFilterType,
  OrderByType,
  OrderDirectionType,
} from '@/feature/inventory-count/hook/useInventoryProducts';
import { InventoryCountData } from '@/feature/inventory-count/hook/useInventoryCount';
import { useState, useCallback, useEffect } from 'react';
import { InventoryProductTableContent } from '@/app/auth/(dashboard)/inventory-count/components/InventoryProductTableContent';

interface InventoryProductTableProps {
  selectedInventoryCount: InventoryCountData | null;
  selectedShelfId: number | 'all';
  isLoading: boolean;
}

export const InventoryProductTable = ({
  selectedInventoryCount,
  selectedShelfId,
  isLoading,
}: InventoryProductTableProps) => {
  const { fetchInventoryProducts, isLoadingInventoryProducts } =
    useInventoryProducts();

  // 表示用データ（フィルタリング済み）
  const [displayProducts, setDisplayProducts] = useState<
    CountableProductType[]
  >([]);

  // サーバーサイドページネーション用の状態
  const [currentPage, setCurrentPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(30);
  const [totalCount, setTotalCount] = useState(0);

  // サーバーサイドフィルタリング用の状態
  const [selectedGenreId, setSelectedGenreId] = useState<number | 'all'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedConditionName, setSelectedConditionName] = useState<
    string | null
  >(null);
  const [selectedDiff, setSelectedDiff] = useState<DiffFilterType>(undefined);

  // 並び替え用の状態
  const [orderBy, setOrderBy] = useState<OrderByType>(undefined);
  const [orderDirection, setOrderDirection] =
    useState<OrderDirectionType>(undefined);

  // サーバーサイドフィルタリング用のAPI呼び出し
  const fetchFilteredProducts = useCallback(async () => {
    if (!selectedInventoryCount) return;

    const params: any = {
      inventoryId: selectedInventoryCount.id,
      skip: currentPage * rowPerPage,
      take: rowPerPage,
    };

    // フィルタパラメータを追加
    if (selectedGenreId !== 'all') {
      params.genre_id = selectedGenreId;
    }
    if (selectedCategoryId) {
      params.category_id = selectedCategoryId;
    }
    if (selectedConditionName) {
      params.condition_option_name = selectedConditionName;
    }
    if (selectedShelfId !== 'all') {
      params.shelfId = selectedShelfId;
    }

    // 差分フィルタ
    if (selectedDiff) {
      params.diff_filter = selectedDiff;
    }

    // 並び替え
    if (orderBy) {
      params.orderBy = orderBy;
      params.orderDirection = orderDirection;
    }

    const result = await fetchInventoryProducts(params);
    if (result) {
      const convertedProducts = result.products.map(
        (inventoryProduct): CountableProductType => {
          const averageWholesalePrice =
            inventoryProduct.average_wholesale_price ??
            (inventoryProduct.input_total_wholesale_price === null
              ? 0
              : Math.round(
                  inventoryProduct.input_total_wholesale_price /
                    inventoryProduct.item_count,
                ));

          console.log('average', averageWholesalePrice);
          return {
            id: inventoryProduct.product_id,
            display_name: inventoryProduct.product.display_name,
            displayNameWithMeta: inventoryProduct.product.displayNameWithMeta,
            genre: {
              id: inventoryProduct.product.item.genre.id,
              displayName:
                inventoryProduct.product.item.genre?.display_name || '',
            },
            category: {
              id: inventoryProduct.product.item.category.id,
              displayName:
                inventoryProduct.product.item.category?.display_name || '',
            },
            expansion: inventoryProduct.product.item.expansion,
            cardnumber: inventoryProduct.product.item.cardnumber,
            rarity: inventoryProduct.product.item.rarity,
            stock_number: inventoryProduct.item_count,
            sell_price: inventoryProduct.product.sell_price,
            specific_sell_price: inventoryProduct.product.specific_sell_price,
            condition: {
              id: inventoryProduct.product.condition_option_id,
              displayName: inventoryProduct.product.condition?.display_name,
            },
            image_url: inventoryProduct.product.image_url,
            current_stock_number: inventoryProduct.current_stock_number || null,
            product__average_wholesale_price: averageWholesalePrice,
            is_injected_wholesale_price:
              inventoryProduct.wholesale_price_injected ?? undefined,
            wholesale_price_history_id:
              inventoryProduct.wholesale_price_history_id ?? undefined,
          };
        },
      );

      // フィルタリング結果は表示用データのみを更新（allInventoryProductsは更新しない）
      setDisplayProducts(convertedProducts);

      setTotalCount(result.total_count);
    }
  }, [
    selectedInventoryCount,
    selectedGenreId,
    selectedCategoryId,
    selectedConditionName,
    selectedShelfId,
    selectedDiff,
    orderBy,
    orderDirection,
    currentPage,
    rowPerPage,
    fetchInventoryProducts,
  ]);

  // フィルター変更時のAPI再取得
  useEffect(() => {
    fetchFilteredProducts();
  }, [
    selectedGenreId,
    selectedCategoryId,
    selectedConditionName,
    selectedShelfId,
    selectedDiff,
    orderBy,
    orderDirection,
    currentPage,
    rowPerPage,
    fetchFilteredProducts,
  ]);

  // ページネーション用のハンドラ
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowPerPageChange = useCallback((newRowPerPage: number) => {
    setRowPerPage(newRowPerPage);
    setCurrentPage(0); // ページサイズ変更時は1ページ目に戻る
  }, []);

  // フィルタ変更ハンドラ
  const handleGenreChange = useCallback((genreId: number | 'all') => {
    setSelectedGenreId(genreId);
    setCurrentPage(0); // フィルタ変更時は1ページ目に戻る
  }, []);

  const handleCategoryFilterChange = useCallback(
    (categoryId: number | null) => {
      setSelectedCategoryId(categoryId);
      setCurrentPage(0); // フィルタ変更時は1ページ目に戻る
    },
    [],
  );

  const handleConditionFilterChange = useCallback(
    (conditionName: string | null) => {
      setSelectedConditionName(conditionName);
      setCurrentPage(0); // フィルタ変更時は1ページ目に戻る
    },
    [],
  );

  const handleDiffFilterChange = useCallback((diff: DiffFilterType) => {
    setSelectedDiff(diff);
    setCurrentPage(0); // フィルタ変更時は1ページ目に戻る
  }, []);

  // 並び替え変更ハンドラ
  const handleOrderChange = useCallback(
    (newOrderBy: OrderByType, direction?: 'asc' | 'desc' | undefined) => {
      setOrderBy(direction ? newOrderBy : undefined);
      setOrderDirection(direction);
      setCurrentPage(0); // 並び替え変更時は1ページ目に戻る
    },
    [],
  );

  // 状態リセット関数（外部から呼び出し用）
  const resetFilters = useCallback(() => {
    setSelectedGenreId('all');
    setSelectedCategoryId(null);
    setSelectedConditionName(null);
    setSelectedDiff(undefined);
    setDisplayProducts([]);
    setCurrentPage(0);
    setRowPerPage(30);
    setTotalCount(0);
  }, []);

  return (
    <InventoryProductTableContent
      isLoading={isLoading || isLoadingInventoryProducts}
      rows={displayProducts}
      onGenreChange={handleGenreChange}
      onCategoryFilterChange={handleCategoryFilterChange}
      onConditionFilterChange={handleConditionFilterChange}
      onDiffFilterChange={handleDiffFilterChange}
      onOrderChange={handleOrderChange}
      currentPage={currentPage}
      rowPerPage={rowPerPage}
      totalCount={totalCount}
      onPageChange={handlePageChange}
      onRowPerPageChange={handleRowPerPageChange}
    />
  );
};
