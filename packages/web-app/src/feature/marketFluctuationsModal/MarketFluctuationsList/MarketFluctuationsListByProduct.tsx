import { Dispatch, SetStateAction, useMemo, useEffect } from 'react';
import {
  ColumnDef,
  CustomTabTable,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import {
  MarketFluctuationsItem,
  MarketFluctuationsItemAndProduct,
  MarketFluctuationsProduct,
  SearchParams,
} from '@/feature/marketFluctuationsModal/type';
import { Box, Typography } from '@mui/material';
import { GenreAPIRes } from '@/api/frontend/genre/api';
import { ChangeInventoryPrice } from '@/feature/marketFluctuationsModal/ChangeInventoryPrice';
import { ConfirmationChangeInventoryPriceModal } from '@/feature/marketFluctuationsModal/ConfirmationChangeInventoryPriceModal';
import { Product } from '@prisma/client';
import { FilterSection } from '@/feature/marketFluctuationsModal/MarketFluctuationsList';
import { ConditionChip } from '@/feature/products/components/ConditionChip';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { FindOptionSelect } from '@/feature/item/components/select/FindOptionSelect';
import { useStore } from '@/contexts/StoreContext';
import { useSearchItemByFindOption } from '@/feature/item/hooks/useSearchItemByFindOption';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ItemCategoryHandle } from '@prisma/client';

interface MarketFluctuationsListByProductProps {
  marketPriceGapItems: MarketFluctuationsItem[];
  searchParams: SearchParams;
  setSearchParams: Dispatch<SetStateAction<SearchParams>>;
  isLoadingList: boolean;
  genre?: GenreAPIRes['getGenreAll'];
  handleTabChange: (value: string) => void;
  handleSort: (direction: 'asc' | 'desc' | undefined, sortBy: string) => void;
  formData?: Partial<Product>;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<Product> | undefined>
  >;
  selectedProduct?: MarketFluctuationsProduct;
  setSelectedProduct: React.Dispatch<
    React.SetStateAction<MarketFluctuationsProduct | undefined>
  >;
  isOpenConfirmationModal: boolean;
  handleCloseConfirmationModal: () => void;
  handleUpdateProduct: () => Promise<void>;
  isLoadingUpdateProduct: boolean;
}

export const MarketFluctuationsListByProduct = ({
  marketPriceGapItems,
  searchParams,
  setSearchParams,
  isLoadingList,
  genre,
  handleTabChange,
  handleSort,
  formData,
  setFormData,
  selectedProduct,
  setSelectedProduct,
  isOpenConfirmationModal,
  handleCloseConfirmationModal,
  handleUpdateProduct,
  isLoadingUpdateProduct,
}: MarketFluctuationsListByProductProps) => {
  // リスト表示用にプロダクトごとに整形
  const marketPriceGapProducts: MarketFluctuationsItemAndProduct[] =
    useMemo(() => {
      return marketPriceGapItems.flatMap((item) =>
        item.products.map((product) => ({
          item: item,
          product: product,
        })),
      );
    }, [marketPriceGapItems]);

  // ------------------------------------------
  // タブの定義
  // ------------------------------------------
  const genreTabs: TabDef<MarketFluctuationsItemAndProduct>[] = useMemo(() => {
    const tabs = [{ label: 'すべて', value: 'all' }];
    const genreOptions = genre?.itemGenres.map((genre) => ({
      label: genre.display_name,
      value: genre.id.toString(),
    }));
    return genreOptions ? tabs.concat(genreOptions) : tabs;
  }, [genre]);

  const selectTab = useMemo(
    () =>
      genreTabs.findIndex(
        (tab) => tab.value === searchParams.genreId?.toString(),
      ),
    [genreTabs],
  );

  // ------------------------------------------
  // カラム定義
  // ------------------------------------------
  const productColumns: ColumnDef<MarketFluctuationsItemAndProduct>[] =
    useMemo(() => {
      return [
        {
          header: '画像',
          key: 'image',
          render: (item) => (
            <ItemImage imageUrl={item.product.image_url} height={60} />
          ),
        },
        {
          header: '商品名',
          key: 'displayName',
          render: (item) => (
            <ItemText text={item.product.displayNameWithMeta} />
          ),
        },
        {
          header: '状態',
          key: 'condition',
          render: (item) => (
            <ConditionChip
              condition={item.product.condition_option_display_name ?? 'N/A'}
            />
          ),
        },
        {
          header: '相場価格',
          key: 'marketPrice',
          render: (item) => {
            const previousMarketPrice =
              item.item.previous_market_price ?? item.item.market_price;
            return (
              <Box display="flex" flexDirection="column">
                <Typography>
                  {item.item.market_price?.toLocaleString()}円
                </Typography>
                <Typography sx={{ fontSize: '12px' }}>
                  （{previousMarketPrice?.toLocaleString()}円）
                </Typography>
              </Box>
            );
          },
          isSortable: true,
          onSortChange: (direction: 'asc' | 'desc' | undefined) => {
            handleSort(direction, 'market_price');
          },
        },
        {
          header: '相場価格変動率',
          key: 'marketPriceGapRate',
          render: (item) => {
            const gapRate = item.item.market_price_gap_rate;
            const isPositive = gapRate != null && gapRate > 0;
            const isNegative = gapRate != null && gapRate < 0;
            return (
              <Typography
                sx={{
                  color: isPositive
                    ? 'secondary.main'
                    : isNegative
                    ? 'primary.main'
                    : undefined,
                  textAlign: 'center',
                }}
              >
                {gapRate == null
                  ? '-'
                  : isPositive
                  ? `+${gapRate}%`
                  : `${gapRate}%`}
              </Typography>
            );
          },
          isSortable: true,
          onSortChange: (direction: 'asc' | 'desc' | undefined) => {
            handleSort(direction, 'market_price_gap_rate');
          },
        },
        {
          header: '販売価格',
          key: 'sellPrice',
          render: (item) => (
            <NumericTextField
              value={
                item.product.specific_sell_price ?? item.product.sell_price ?? 0
              }
              onChange={(e) => setSelectedProduct(item.product)}
              onClick={(e) => setSelectedProduct(item.product)}
              sx={{ width: '80px', backgroundColor: 'white' }}
            />
          ),
        },
        {
          header: '買取価格',
          key: 'buyPrice',
          render: (item) => (
            <NumericTextField
              value={
                item.product.specific_buy_price ?? item.product.buy_price ?? 0
              }
              onChange={(e) => setSelectedProduct(item.product)}
              onClick={(e) => setSelectedProduct(item.product)}
              sx={{ width: '80px', backgroundColor: 'white' }}
            />
          ),
        },
        {
          header: '平均仕入れ値',
          key: 'averageWholesalePrice',
          render: (item) => {
            const wholesalePrice = item.product.average_wholesale_price
              ? `${item.product.average_wholesale_price.toLocaleString()}円`
              : '-';
            return <Typography>{wholesalePrice}</Typography>;
          },
        },
        {
          header: '総在庫数',
          key: 'productsStockNumber',
          render: (item) => (
            <Typography>{item.product.stock_number}</Typography>
          ),
          isSortable: true,
          onSortChange: (direction: 'asc' | 'desc' | undefined) => {
            handleSort(direction, 'products_stock_number');
          },
        },
      ];
    }, [handleSort, setSelectedProduct]);

  // additional hooks for FindOptionSelect
  const { store } = useStore();
  const {
    selectedFindOption,
    selectedFindOptionObject,
    handleChangeFindOption,
  } = useSearchItemByFindOption();
  const { category, fetchCategoryList } = useCategory();
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);
  const cardCategoryId = useMemo(() => {
    return category?.itemCategories.find(
      (cat) => cat.handle === ItemCategoryHandle.CARD,
    )?.id;
  }, [category]);

  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      findOption:
        Object.keys(selectedFindOptionObject).length > 0
          ? selectedFindOptionObject
          : undefined,
    }));
  }, [selectedFindOptionObject, setSearchParams]);

  return (
    <>
      <ConfirmationChangeInventoryPriceModal
        open={isOpenConfirmationModal}
        onClose={handleCloseConfirmationModal}
        handleUpdateProduct={handleUpdateProduct}
        isLoadingUpdateProduct={isLoadingUpdateProduct}
      />
      {selectedProduct ? (
        <ChangeInventoryPrice
          detailData={selectedProduct}
          formData={formData}
          setFormData={setFormData}
        />
      ) : (
        <CustomTabTable<MarketFluctuationsItemAndProduct>
          data={marketPriceGapProducts}
          columns={productColumns}
          tabs={genreTabs}
          defaultSelectedTabIndex={selectTab}
          isLoading={isLoadingList}
          rowKey={(item) => item.product.id}
          onTabChange={handleTabChange}
          variant="scrollable"
          scrollButtons={false}
          isSingleSortMode
          tableContainerSx={{
            '& .MuiTableRow-root': {
              backgroundColor: 'grey.200',
            },
          }}
          addFilter={
            <Box display="flex" flexWrap="wrap" gap={1}>
              <FilterSection
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              />
              <FindOptionSelect
                storeID={store.id}
                selectedGenreId={searchParams.genreId ?? null}
                selectedCategoryId={searchParams.categoryId ?? null}
                selectedFindOption={selectedFindOption}
                handleChangeFindOption={handleChangeFindOption}
                cardCategoryId={cardCategoryId}
              />
            </Box>
          }
        />
      )}
    </>
  );
};
