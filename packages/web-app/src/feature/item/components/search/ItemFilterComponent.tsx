import { useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { ItemCategoryFilter } from '@/feature/item/components/search/filters/ItemCategoryFilter';
import { FindOptionSelect } from '@/feature/item/components/select/FindOptionSelect';
import { useCategory } from '@/feature/category/hooks/useCategory';
import {
  FindOptionType,
  ChangeFindOptionType,
} from '@/feature/item/hooks/useSearchItemByFindOption';
import { ItemCategoryHandle } from '@prisma/client';
import { TableRow } from '@/feature/item/components/search/ItemSearchLayout';
import { ItemSpecialtyFilter } from '@/feature/item/components/search/filters/ItemSpecialtyFilter';
import { ManagementNumberCheck } from '@/feature/products/components/ManagementNumberCheck';

export interface FilterOptions {
  showSpecialtyFilter?: boolean;
  showManagementCheckBox?: boolean;
  showFindOption?: boolean;
}
interface Props {
  setItemSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  searchState: ItemSearchState;
  storeId: number;
  setTableData: React.Dispatch<React.SetStateAction<TableRow[]>>;
  selectedFindOption: FindOptionType[];
  hasManagementNumber: boolean;
  setHasManagementNumber: React.Dispatch<React.SetStateAction<boolean>>;
  handleChangeFindOption: (values: ChangeFindOptionType) => void;
  filterOptions?: FilterOptions;
}

export const ItemFilterComponent = ({
  setItemSearchState,
  searchState,
  storeId,
  setTableData,
  selectedFindOption,
  hasManagementNumber,
  setHasManagementNumber,
  handleChangeFindOption,
  filterOptions = {},
}: Props) => {
  // propsを受け取るタイミングで個別プロパティを初期化
  const { category, fetchCategoryList } = useCategory();

  // 初期化時にデータをfetch
  useEffect(() => {
    fetchCategoryList();
  }, [storeId, fetchCategoryList]);

  // カテゴリー内の「カード」
  const cardCategory = useMemo(
    () =>
      category?.itemCategories.find(
        (category) => category.handle === ItemCategoryHandle.CARD,
      ),
    [category],
  );

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 1, mt: 1 }}
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
        {/* カテゴリ選択 */}
        <ItemCategoryFilter
          setItemSearchState={setItemSearchState}
          formControlSx={{ minWidth: 120 }}
        />

        {/* 特殊状態フィルター */}
        {filterOptions.showSpecialtyFilter && (
          <ItemSpecialtyFilter
            setItemSearchState={setItemSearchState}
            setTableData={setTableData}
          />
        )}

        {/* さらに詳細な絞り込み */}
        {filterOptions.showFindOption && (
          <FindOptionSelect
            storeID={storeId}
            selectedGenreId={searchState.selectedGenreId}
            selectedCategoryId={searchState.selectedCategoryId}
            selectedFindOption={selectedFindOption}
            handleChangeFindOption={handleChangeFindOption}
            cardCategoryId={cardCategory?.id}
          />
        )}
      </Box>
      <Box>
        {filterOptions.showManagementCheckBox && (
          <ManagementNumberCheck
            checked={hasManagementNumber}
            onChange={() => setHasManagementNumber((prev) => !prev)}
          />
        )}
      </Box>
    </Box>
  );
};
