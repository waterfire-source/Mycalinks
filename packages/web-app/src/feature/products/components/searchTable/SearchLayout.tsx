import { useEffect, FC } from 'react';
import { Box, Stack } from '@mui/material';
import { ProductSearch } from '@/app/auth/(dashboard)/stock/components/ProductSearch';
import { GenreTabComponent } from '@/components/tabs/GenreTabComponent';
import { useStore } from '@/contexts/StoreContext';
import {
  useStockSearch,
  UseStockSearchOptions,
} from '@/feature/products/hooks/useNewProductSearch';
import {
  FilterOptions,
  FlexibleNarrowDownComponent,
} from '@/feature/products/components/filters/FlexibleNarrowDownComponent';
import {
  ProductDataTable,
  ColumnVisibility,
} from '@/feature/products/components/searchTable/ProductDataTable';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ReturnProductInfo } from '@/feature/item/components/search/ItemSearchLayout';

type searchMode = 'existProduct'; //現状はこれのみ
interface Props {
  searchMode?: searchMode;
  filterOptions?: FilterOptions;
  columnVisibility?: ColumnVisibility;
  searchStateOption?: UseStockSearchOptions;
  actionButtonText?: string;
  onClickActionButton?: (returnProductInfo: ReturnProductInfo[]) => void;
  isAllStockRegister?: boolean; //今後使うかも？
}

export const SearchLayout: FC<Props> = ({
  searchMode,
  filterOptions,
  columnVisibility,
  onClickActionButton,
  actionButtonText,
  searchStateOption,
}) => {
  const { store } = useStore();

  //こちら、初期化の段階で一度しか実行されないため、初期化条件を全てfetchし切った上でsearchStateOptionを渡すこと。
  const {
    searchState,
    setSearchState,
    fetchProducts,
    selectedFindOption,
    handleChangeFindOption,
  } = useStockSearch(store.id, {
    itemPerPage: 30,
    currentPage: 0,
    isActive: true,
    stockNumberGte: 1,
    isConsignmentProduct: false,
    ...searchStateOption,
  });

  useEffect(() => {
    fetchProducts();
  }, [searchState.itemGenreId, fetchProducts, store.id]);

  //特定のモードの時にデフォルトのために使用するオプション
  let modeFilterOption: FilterOptions = {};
  let modeColumnVisibility: ColumnVisibility = {};

  if (!searchMode) {
    modeFilterOption = {
      showConsignmentFilter: false,
      showConditionFilter: false,
      showStockStatusFilter: false,
      showPriceUpdateDateFilter: false,
    };
    modeColumnVisibility = {
      showCheckBox: false,
      showAverageWholesalePrice: false,
      showManagementNumber: false,
      showBuyPrice: false,
      showResidencePeriod: false,
      showPriceUpdate: false,
    };
  }

  if (filterOptions) {
    modeFilterOption = { ...modeFilterOption, ...filterOptions };
  }

  if (columnVisibility) {
    modeColumnVisibility = { ...modeColumnVisibility, ...columnVisibility };
  }

  const handleClickAction = onClickActionButton
    ? (
        product: BackendProductAPI[0]['response']['200']['products'][0],
        count: number,
        customFieldValues: Record<string, number>,
      ) => {
        onClickActionButton([
          {
            product: product,
            count: count,
            customFieldValues: customFieldValues,
          },
        ]);
      }
    : undefined;

  return (
    <Stack
      sx={{
        flex: 1,
        minHeight: 0,
        gap: 1,
        height: '100%',
      }}
    >
      <ProductSearch
        setSearchState={setSearchState}
        isShowAdvancedButton={false}
      />
      <GenreTabComponent setSearchState={setSearchState} />
      <Stack sx={{ backgroundColor: 'white', flex: 1, minHeight: 0 }}>
        <FlexibleNarrowDownComponent
          setProductSearchState={setSearchState}
          searchState={searchState}
          selectedFindOption={selectedFindOption}
          storeId={store.id}
          handleChangeFindOption={handleChangeFindOption}
          filterOptions={modeFilterOption}
        />
        <Box sx={{ flex: 1, minHeight: 0, padding: 0, margin: 0 }}>
          <ProductDataTable
            searchState={searchState}
            setSearchState={setSearchState}
            columnVisibility={modeColumnVisibility}
            onClickActionButton={handleClickAction}
            actionButtonText={actionButtonText}
          />
        </Box>
      </Stack>
    </Stack>
  );
};
