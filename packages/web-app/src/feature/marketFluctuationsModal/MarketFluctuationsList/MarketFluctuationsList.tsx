import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  ColumnDef,
  CustomTabTable,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import { GenreAPIRes } from '@/api/frontend/genre/api';
import {
  MarketFluctuationsItem,
  SearchParams,
} from '@/feature/marketFluctuationsModal/type';
import { Box, TextField, Tooltip, Typography } from '@mui/material';
import theme from '@/theme';
import { DisplayNameCell } from '@/app/auth/(dashboard)/item/components/itemTable/DisplayNameCell';
import { StockDetailCell } from '@/app/auth/(dashboard)/item/components/itemTable/StockDetailCell';
import { FilterSection } from '@/feature/marketFluctuationsModal/MarketFluctuationsList';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { FindOptionSelect } from '@/feature/item/components/select/FindOptionSelect';
import { useStore } from '@/contexts/StoreContext';
import { useSearchItemByFindOption } from '@/feature/item/hooks/useSearchItemByFindOption';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ItemCategoryHandle } from '@prisma/client';

interface MarketFluctuationsModalProps {
  marketPriceGapItems: MarketFluctuationsItem[];
  searchParams: SearchParams;
  setSearchParams: Dispatch<SetStateAction<SearchParams>>;
  isLoadingList: boolean;
  genre?: GenreAPIRes['getGenreAll'];
  handleTabChange: (value: string) => void;
  handleSort: (direction: 'asc' | 'desc' | undefined, sortBy: string) => void;
  isEditPrice: boolean;
  editedPrices: {
    [key: number]: {
      sellPrice: number;
      buyPrice: number;
    };
  };
  setEditedPrices: React.Dispatch<
    React.SetStateAction<{
      [key: number]: { sellPrice: number; buyPrice: number };
    }>
  >;
  alreadyUpdate: number[];
  handleSubmitUpdateItem: (item: MarketFluctuationsItem) => Promise<void>;
}

export const MarketFluctuationsList = ({
  marketPriceGapItems,
  searchParams,
  setSearchParams,
  isLoadingList,
  genre,
  handleTabChange,
  handleSort,
  isEditPrice,
  editedPrices,
  setEditedPrices,
  alreadyUpdate,
  handleSubmitUpdateItem,
}: MarketFluctuationsModalProps) => {
  // 価格変更
  const handlePriceChange = useCallback(
    (itemId: number, priceType: 'sellPrice' | 'buyPrice', value: string) => {
      const price = parseFloat(value) || 0;
      setEditedPrices((prevState) => ({
        ...prevState,
        [itemId]: {
          ...prevState[itemId],
          [priceType]: price,
        },
      }));
    },
    [setEditedPrices],
  );

  const getIsAlreadyUpdate = useCallback(
    (itemId: number) => alreadyUpdate.includes(itemId),
    [alreadyUpdate],
  );

  // ------------------------------------------
  // タブの定義
  // ------------------------------------------
  const genreTabs: TabDef<MarketFluctuationsItem>[] = useMemo(() => {
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
  const productColumns: ColumnDef<MarketFluctuationsItem>[] = useMemo(() => {
    return [
      {
        header: '画像',
        key: 'image',
        render: (item) => <ItemImage imageUrl={item.image_url} height={60} />,
      },
      {
        header: '商品名',
        key: 'displayName',
        render: (item) => {
          const displayName = item.display_name ?? '';
          const genreDisplayName = item.genre_display_name;
          const categoryDisplayName = item.category_display_name;
          return (
            <DisplayNameCell
              displayName={displayName}
              genreDisplayName={genreDisplayName}
              categoryDisplayName={categoryDisplayName}
            />
          );
        },
      },
      {
        header: '相場価格',
        key: 'marketPrice',
        render: (item) => {
          const previousMarketPrice =
            item.previous_market_price ?? item.market_price;
          return (
            <Box display="flex" flexDirection="column">
              <Typography>{item.market_price?.toLocaleString()}円</Typography>
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
          const gapRate = item.market_price_gap_rate;
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
        render: (item) => {
          const editedSellPrice = editedPrices[item.id]?.sellPrice;
          const viewSellPrice = getIsAlreadyUpdate(item.id)
            ? item.market_price
            : item.sell_price;
          const isPriceChanged =
            editedSellPrice !== undefined && editedSellPrice !== viewSellPrice;

          return isEditPrice ? (
            <TextField
              value={editedSellPrice ?? viewSellPrice}
              variant="outlined"
              size="small"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                handlePriceChange(item.id, 'sellPrice', e.target.value)
              }
              InputProps={{
                style: {
                  width: '80px',
                  color: isPriceChanged
                    ? theme.palette.primary.main
                    : 'inherit',
                  backgroundColor: 'white',
                },
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Typography
                sx={{
                  width: '80px',
                  color: 'secondary.main',
                  textAlign: 'center',
                }}
              >
                {viewSellPrice?.toLocaleString()}円
              </Typography>
            </Box>
          );
        },
      },
      {
        header: '買取価格',
        key: 'buyPrice',
        render: (item) => {
          const editedBuyPrice = editedPrices[item.id]?.buyPrice;
          const isPriceChanged =
            editedBuyPrice !== undefined && editedBuyPrice !== item.buy_price;

          return isEditPrice ? (
            <TextField
              value={editedBuyPrice ?? item.buy_price}
              variant="outlined"
              size="small"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                handlePriceChange(item.id, 'buyPrice', e.target.value)
              }
              InputProps={{
                style: {
                  width: '80px',
                  color: isPriceChanged
                    ? theme.palette.primary.main
                    : 'inherit',
                  backgroundColor: 'white',
                },
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Typography
                sx={{
                  width: '80px',
                  color: 'primary.main',
                  textAlign: 'center',
                }}
              >
                {item.buy_price.toLocaleString()}円
              </Typography>
            </Box>
          );
        },
      },
      {
        header: '平均仕入れ値',
        key: 'averageWholesalePrice',
        render: (item) => {
          const totalAverageWholesalePrice = item.products.reduce(
            (sum, product) => {
              return (
                sum +
                (product.average_wholesale_price ?? 0) *
                  (product.stock_number ?? 0)
              );
            },
            0,
          );
          const averageWholesalePrice =
            totalAverageWholesalePrice / item.products_stock_number;
          const result =
            isNaN(averageWholesalePrice) || item.products_stock_number === 0
              ? '-'
              : `${averageWholesalePrice.toLocaleString()}円`;
          return <Typography>{result}</Typography>;
        },
      },
      {
        header: '総在庫数',
        key: 'productsStockNumber',
        render: (item) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StockDetailCell
              products={item.products}
              productsStockNumber={item.products_stock_number}
              infiniteStock={item.infinite_stock}
            />
          </Box>
        ),
        isSortable: true,
        onSortChange: (direction: 'asc' | 'desc' | undefined) => {
          handleSort(direction, 'products_stock_number');
        },
      },
      {
        header: '',
        key: 'adaptationButton',
        render: (item) => (
          <Tooltip
            title={`販売価格を相場価格に設定${
              getIsAlreadyUpdate(item.id) ? '済みです' : 'します'
            }`}
            arrow
          >
            <span>
              <PrimaryButton
                sx={{ width: '110px' }}
                onClick={() => {
                  handleSubmitUpdateItem(item);
                }}
                disabled={getIsAlreadyUpdate(item.id)}
              >
                {getIsAlreadyUpdate(item.id) ? '相場適用済み' : '相場適用'}
              </PrimaryButton>
            </span>
          </Tooltip>
        ),
      },
    ];
  }, [
    handleSort,
    editedPrices,
    isEditPrice,
    handlePriceChange,
    getIsAlreadyUpdate,
    handleSubmitUpdateItem,
  ]);

  // ---- FindOptionSelect hooks ----
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

  // sync searchParams with selectedFindOptionObject
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
    <CustomTabTable<MarketFluctuationsItem>
      data={marketPriceGapItems}
      columns={productColumns}
      tabs={genreTabs}
      defaultSelectedTabIndex={selectTab}
      isLoading={isLoadingList}
      rowKey={(item) => item.id}
      onTabChange={handleTabChange}
      variant="scrollable"
      scrollButtons={false}
      isSingleSortMode
      tableContainerSx={{
        '& .MuiTableRow-root': {
          backgroundColor: isEditPrice ? 'grey.200' : 'white',
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
  );
};
