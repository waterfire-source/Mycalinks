import { CountableProductType } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryCount';
import {
  ColumnDef,
  CustomTabTable,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import {
  DiffFilterType,
  OrderByType,
} from '@/feature/inventory-count/hook/useInventoryProducts';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { Stack, Typography } from '@mui/material';
import theme from '@/theme';
import { useEffect, useMemo } from 'react';

export interface InventoryProductTableContentProps {
  isLoading: boolean;
  rows: CountableProductType[];
  onGenreChange: (genreId: number | 'all') => void;
  onCategoryFilterChange: (categoryId: number | null) => void;
  onConditionFilterChange: (conditionName: string | null) => void;
  onDiffFilterChange: (diff: DiffFilterType) => void;
  onOrderChange: (
    orderBy: OrderByType,
    direction?: 'asc' | 'desc' | undefined,
  ) => void;
  currentPage: number;
  rowPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowPerPageChange: (rowPerPage: number) => void;
}

export const InventoryProductTableContent = ({
  isLoading,
  rows,
  onGenreChange,
  onCategoryFilterChange,
  onConditionFilterChange,
  onDiffFilterChange,
  onOrderChange,
  currentPage,
  rowPerPage,
  totalCount,
  onPageChange,
  onRowPerPageChange,
}: InventoryProductTableContentProps) => {
  // フィルタ選択肢取得用フック
  const { category, fetchCategoryList } = useCategory();
  const { genre, fetchGenreList } = useGenre();

  // 初回データ取得
  useEffect(() => {
    fetchCategoryList();
    fetchGenreList();
  }, [fetchCategoryList, fetchGenreList]);

  // カテゴリオプション生成
  const categoryOptions = useMemo(() => {
    if (!category?.itemCategories) return [];
    return category.itemCategories.map((cat) => ({
      id: cat.id,
      displayName: cat.display_name,
    }));
  }, [category]);

  // コンディションオプション生成（状態名で重複削除）
  const conditionOptions = useMemo(() => {
    if (!category?.itemCategories) return [];
    const allConditions = category.itemCategories.flatMap(
      (cat) => cat.condition_options?.map((cond) => cond.display_name) || [],
    );
    // 状態名で重複削除
    const uniqueConditionNames = Array.from(new Set(allConditions));
    return uniqueConditionNames;
  }, [category]);

  // 利用可能なジャンル
  const availableGenres = useMemo(() => {
    if (!genre?.itemGenres) return [];
    return genre.itemGenres.map((g) => ({
      id: g.id,
      displayName: g.display_name,
    }));
  }, [genre]);
  const columns: ColumnDef<CountableProductType>[] = [
    {
      header: '商品画像',
      key: 'image',
      render: (row) => <ItemImage imageUrl={row.image_url} height={70} />,
    },
    {
      header: '商品名',
      key: 'name',
      render: (row) => (
        <Stack direction="column" alignItems="center">
          <ItemText text={row.displayNameWithMeta ?? '-'} />
        </Stack>
      ),
    },
    {
      header: '状態',
      key: 'condition',
      render: (row) => (
        <Stack width="100%">
          <Typography>{row.condition.displayName}</Typography>
        </Stack>
      ),
      filterConditions: conditionOptions,
      onFilterConditionChange: (conditionName) => {
        onConditionFilterChange(
          conditionName === 'すべて' ? null : conditionName,
        );
      },
    },
    {
      header: 'カテゴリ',
      key: 'category',
      render: (row) => (
        <Stack width="100%">
          <Typography>{row.category.displayName}</Typography>
        </Stack>
      ),
      filterConditions: categoryOptions.map((option) => option.displayName),
      onFilterConditionChange: (categoryName) => {
        const category = categoryOptions.find(
          (option) => option.displayName === categoryName,
        );
        onCategoryFilterChange(category?.id ?? null);
      },
    },
    {
      header: '平均仕入れ値（当時）',
      key: 'wholesale_price',
      render: (row) => row.product__average_wholesale_price ?? '-',
      isSortable: true,
      onSortChange: (direction) => {
        onOrderChange('average_price', direction);
      },
    },
    {
      header: '登録数',
      key: 'stock_number',
      render: (row) => (
        <Stack width="100%">
          <Typography>{row.stock_number}</Typography>
        </Stack>
      ),
      isSortable: true,
      onSortChange: (direction) => {
        onOrderChange('item_count', direction);
      },
    },
    {
      header: '理論値',
      key: 'current_stock_number',
      render: (row) => row.current_stock_number ?? 0,
      isSortable: true,
      onSortChange: (direction) => {
        onOrderChange('stock_count', direction);
      },
    },
    {
      header: '差分',
      key: 'difference',
      render: (row) => {
        const diff = row.stock_number - (row.current_stock_number ?? 0);

        // 表示形式の整形
        const sign = diff === 0 ? '±' : diff > 0 ? '+' : '-';
        const padded = Math.abs(diff).toString().padStart(2, '0');
        const formatted = `${sign}${padded}`;

        // 色の設定
        let color = 'black';
        if (diff > 0) color = '#2570ba'; // 青
        else if (diff < 0) color = theme.palette.primary.main; // 赤

        return <Typography sx={{ color }}>{formatted}</Typography>;
      },
      filterConditions: ['差分あり', '差分なし', '差分プラス', '差分マイナス'],
      onFilterConditionChange: (diffType) => {
        const diffMap: Record<string, DiffFilterType> = {
          差分あり: 'hasDiff',
          差分なし: 'noDiff',
          差分プラス: 'plus',
          差分マイナス: 'minus',
        };
        onDiffFilterChange(diffMap[diffType] || undefined);
      },
      isSortable: true,
      onSortChange: (direction) => {
        onOrderChange('diff_count', direction);
      },
    },
  ];

  // ジャンルタブの定義
  const tabs: TabDef<CountableProductType>[] = [
    {
      label: '全て',
      value: 'all',
    },
    ...availableGenres.map((genre) => ({
      label: genre.displayName,
      value: genre.id.toString(),
    })),
  ];

  const handlePrevPagination = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPagination = () => {
    if ((currentPage + 1) * rowPerPage < totalCount) {
      onPageChange(currentPage + 1);
    }
  };

  const handleRowPerPageChange = (newRowPerPage: number) => {
    onRowPerPageChange(newRowPerPage);
    onPageChange(0); // ページサイズ変更時は1ページ目に戻る
  };

  return (
    <CustomTabTable<CountableProductType>
      tabs={tabs}
      data={rows}
      columns={columns}
      rowKey={(row) => `${row.id}`}
      isLoading={isLoading}
      onTabChange={(value) => {
        const genreId = value === 'all' ? 'all' : parseInt(value, 10);
        onGenreChange(genreId);
      }}
      isSingleSortMode={true}
      isShowFooterArea={true}
      currentPage={currentPage}
      rowPerPage={rowPerPage}
      totalRow={totalCount}
      handlePrevPagination={handlePrevPagination}
      handleNextPagination={handleNextPagination}
      handleRowPerPageChange={handleRowPerPageChange}
      tabTableWrapperSx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      tableWrapperSx={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
      }}
    />
  );
};
