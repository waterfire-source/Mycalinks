import { Box } from '@mui/material';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { FindOptionSelect } from '@/feature/item/components/select/FindOptionSelect';
import { ConsignmentProductFilter } from '@/feature/products/components/filters/ConsignmentProductFilter';
import {
  FindOptionType,
  ChangeFindOptionType,
} from '@/feature/item/hooks/useSearchItemByFindOption';
import { useMemo, useEffect } from 'react';
import { ItemCategoryHandle } from '@prisma/client';

// 個別フィルタコンポーネントのインポート
import { CategoryFilter } from '@/feature/products/components/filters/CategoryFilter';
import { ConditionFilter } from '@/feature/products/components/filters/ConditionFilter';
import { SpecialtyFilter } from '@/feature/products/components/filters/SpecialtyFilter';
import { StockStatusFilter } from '@/feature/products/components/filters/StockStatusFilter';
import { PriceUpdateDateFilter } from '@/feature/products/components/filters/PriceUpdateDateFilter';
import { SortOrderFilter } from '@/feature/products/components/filters/SortOrderFilter';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';

export interface FilterOptions {
  showCategoryFilter?: boolean;
  showConditionFilter?: boolean;
  showSpecialtyFilter?: boolean;
  showStockStatusFilter?: boolean;
  showConsignmentFilter?: boolean;
  showPriceUpdateDateFilter?: boolean;
  showFindOptionSelect?: boolean;
  showSortOrderFilter?: boolean;
}

interface Props {
  setProductSearchState: React.Dispatch<
    React.SetStateAction<ProductSearchState>
  >;
  searchState: ProductSearchState;
  storeId: number;
  selectedFindOption: FindOptionType[];
  handleChangeFindOption: (values: ChangeFindOptionType) => void;
  filterOptions?: FilterOptions;
}

export const FlexibleNarrowDownComponent = ({
  setProductSearchState,
  searchState,
  storeId,
  selectedFindOption,
  handleChangeFindOption,
  filterOptions = {}, // 空オブジェクトをデフォルト
}: Props) => {
  // propsを受け取るタイミングで個別プロパティを初期化
  const {
    showCategoryFilter = true,
    showConditionFilter = true,
    showSpecialtyFilter = true,
    showStockStatusFilter = true,
    showConsignmentFilter = true,
    showPriceUpdateDateFilter = true,
    showFindOptionSelect = true,
    showSortOrderFilter = true,
  } = filterOptions;
  const { category, fetchCategoryList } = useCategory();
  const { specialties, fetchSpecialty } = useGetSpecialty();

  // 初期化時にデータをfetch
  useEffect(() => {
    fetchCategoryList();
    fetchSpecialty();
  }, [storeId, fetchCategoryList, fetchSpecialty]);

  // カテゴリー内の「カード」
  const cardCategory = useMemo(
    () =>
      category?.itemCategories.find(
        (category) => category.handle === ItemCategoryHandle.CARD,
      ),
    [category],
  );

  // 少なくとも1つのフィルターが表示される場合のみコンポーネントを表示
  const hasVisibleFilters =
    showCategoryFilter ||
    showConditionFilter ||
    showSpecialtyFilter ||
    showStockStatusFilter ||
    showConsignmentFilter ||
    showPriceUpdateDateFilter ||
    showFindOptionSelect ||
    showSortOrderFilter;

  if (!hasVisibleFilters) {
    return null;
  }

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{ my: 1, px: 1 }}
      gap={2}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* 商品カテゴリ */}
        {showCategoryFilter && (
          <CategoryFilter
            setProductSearchState={setProductSearchState}
            category={category}
          />
        )}

        {/* 状態 */}
        {showConditionFilter && (
          <ConditionFilter
            setProductSearchState={setProductSearchState}
            category={category}
          />
        )}

        {/* 特殊状態 */}
        {showSpecialtyFilter && (
          <SpecialtyFilter
            setProductSearchState={setProductSearchState}
            specialties={specialties}
          />
        )}

        {/* 在庫状況 */}
        {showStockStatusFilter && (
          <StockStatusFilter setProductSearchState={setProductSearchState} />
        )}

        {/* 委託商品フィルタ */}
        {showConsignmentFilter && (
          <ConsignmentProductFilter
            setProductSearchState={setProductSearchState}
            formControlSx={{ minWidth: 120 }}
          />
        )}

        {/* 日付入力 */}
        {showPriceUpdateDateFilter && (
          <PriceUpdateDateFilter
            setProductSearchState={setProductSearchState}
          />
        )}

        {/* さらに詳細な絞り込み */}
        {showFindOptionSelect && (
          <FindOptionSelect
            storeID={storeId}
            selectedGenreId={searchState.itemGenreId}
            selectedCategoryId={searchState.itemCategoryId}
            selectedFindOption={selectedFindOption}
            handleChangeFindOption={handleChangeFindOption}
            cardCategoryId={cardCategory?.id}
          />
        )}
      </Box>

      {/* 並び替え */}
      {showSortOrderFilter && (
        <SortOrderFilter setProductSearchState={setProductSearchState} />
      )}
    </Box>
  );
};
