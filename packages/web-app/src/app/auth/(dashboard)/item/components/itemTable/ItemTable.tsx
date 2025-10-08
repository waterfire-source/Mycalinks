import { Box, TextField, Typography, Stack } from '@mui/material';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import theme from '@/theme';
import { useEffect, useMemo, useState } from 'react';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { ItemRegisterModal } from '@/app/auth/(dashboard)/item/components/ItemRegisterModal';
import {
  RightClickDataGrid,
  FormattedItem,
} from '@/components/dataGrid/RightClickDataGrid';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { StockDetailCell } from '@/app/auth/(dashboard)/item/components/itemTable/StockDetailCell';
import { DisplayNameCell } from '@/app/auth/(dashboard)/item/components/itemTable/DisplayNameCell';
import { ItemTableSort } from '@/app/auth/(dashboard)/item/components/itemTable/ItemTableSort';
import { ItemTableCategorySearch } from '@/app/auth/(dashboard)/item/components/itemTable/ItemTableCategorySelect';
import { GenreTabComponent } from '@/components/tabs/GenreTabComponent';
import { StockDetailModal } from '@/app/auth/(dashboard)/stock/components/detailModal/StockDetailModal';
import { FindOptionSelect } from '@/feature/item/components/select/FindOptionSelect';
import { ItemCategoryHandle } from '@prisma/client';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useUpdateItem } from '@/feature/item/hooks/useUpdateItem';
import { useStore } from '@/contexts/StoreContext';
import {
  ChangeFindOptionType,
  FindOptionType,
} from '@/feature/item/hooks/useSearchItemByFindOption';

type Props = {
  selectedStoreID: number | undefined;
  items: BackendItemAPI[0]['response']['200']['items'][0][];
  paginationModel: {
    page: number;
    pageSize: number;
    totalCount: number;
  };
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  isLoading: boolean;
  refetchItemsAfterUpdate: (isPageSkip?: boolean) => Promise<void>;
  isEditMode: boolean;
  editedPrices: { [key: number]: { sellPrice: number; buyPrice: number } };
  setEditedPrices: React.Dispatch<
    React.SetStateAction<{
      [key: number]: { sellPrice: number; buyPrice: number };
    }>
  >;
  setSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  selectedGenreID?: number | null;
  selectedFindOption: FindOptionType[];
  handleChangeFindOption: (values: ChangeFindOptionType) => void;
  isHiddenItems?: boolean;
};

export const ItemTable = ({
  selectedStoreID,
  items,
  paginationModel,
  onPageChange,
  onPageSizeChange,
  isLoading,
  refetchItemsAfterUpdate,
  isEditMode,
  editedPrices,
  setEditedPrices,
  setSearchState,
  selectedGenreID,
  selectedFindOption,
  handleChangeFindOption,
  isHiddenItems = false,
}: Props) => {
  const [selectedItem, setSelectedItem] = useState<FormattedItem | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const { genre, fetchGenreList } = useGenre();
  const { category, fetchCategoryList } = useCategory();
  const [tabIndex, setTabIndex] = useState(0); // タブのインデックス
  const [selectCategory, setSelectCategory] = useState<string | number | ''>(
    '',
  ); // カテゴリの状態を追加
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productId, setProductId] = useState<number>();
  const { updateItem, isLoading: updateItemLoading } = useUpdateItem();
  const { store } = useStore();

  // カテゴリー内の「カード」
  const cardCategory = useMemo(
    () =>
      category?.itemCategories.find(
        (category) => category.handle === ItemCategoryHandle.CARD,
      ),
    [category],
  );

  //初回読み込み
  useEffect(() => {
    fetchGenreList();
    fetchCategoryList();
  }, []);

  //columnの作成
  useEffect(() => {
    setColumns(
      getColumns(tabIndex, isEditMode, editedPrices, handlePriceChange),
    );
  }, [tabIndex, isEditMode, editedPrices]);

  const handleRowClick = (item: GridRowParams) => {
    if (!isEditMode) {
      setSelectedItem(item.row);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  // 在庫詳細モーダルを閉じる処理
  const handleCloseStockDetailModal = () => {
    setIsDetailModalOpen(false);
    setProductId(undefined);
  };

  const handlePriceChange = (
    itemId: number,
    priceType: 'sellPrice' | 'buyPrice',
    value: string,
  ) => {
    const price = parseFloat(value) || 0;

    setEditedPrices((prevState) => ({
      ...prevState,
      [itemId]: {
        ...prevState[itemId],
        [priceType]: price,
      },
    }));
  };

  // 再表示ボタンの処理
  const handleReDisplay = async (item: FormattedItem) => {
    if (!item) return;
    const updatedItem = { ...item, hide: false };
    const res = await updateItem(store.id, updatedItem);
    if (res) {
      await refetchItemsAfterUpdate();
    }
  };

  const getColumns = (
    tabIndex: number,
    isEditMode: boolean,
    editedPrices: { [key: number]: { sellPrice: number; buyPrice: number } },
    handlePriceChange: (
      itemId: number,
      priceType: 'sellPrice' | 'buyPrice',
      value: string,
    ) => void,
  ): GridColDef[] => {
    const columns: GridColDef[] = [
      {
        field: 'imageUrl',
        headerName: '画像',
        minWidth: 60,
        flex: 0.1,
        renderCell: (params) => {
          return <ItemImage imageUrl={params.value} />;
        },
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'displayName',
        headerName: '商品名',
        minWidth: 150,
        flex: 0.3,
        headerAlign: 'left',
        align: 'center',
        renderCell: (params) => {
          const displayName = params.row.products[0]?.displayNameWithMeta;
          const genreDisplayName = params.row.genreDisplayName;
          const categoryDisplayName = params.row.categoryDisplayName;
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
        field: 'sellPrice',
        headerName: '販売価格',
        type: 'number',
        minWidth: 100,
        flex: 0.1,
        headerAlign: 'left',
        align: 'center',
        renderHeader: () => (
          <Box display="flex" flexDirection="column" alignItems="left">
            <Typography color={'grey.700'}>販売価格</Typography>
            <Typography color={'grey.700'} variant="caption">
              相場価格
            </Typography>
          </Box>
        ),
        renderCell: (params) => {
          const editedSellPrice = editedPrices[params.row.id]?.sellPrice;
          const isPriceChanged =
            editedSellPrice !== undefined && editedSellPrice !== params.value;
          const marketPrice = params.row.marketPrice;
          // const percentageChange =
          //   ((params.value - marketPrice) / marketPrice) * 100;

          return isEditMode ? (
            <Stack alignItems="left" gap={1}>
              <TextField
                value={editedSellPrice ?? params.value}
                variant="outlined"
                size="small"
                fullWidth
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  handlePriceChange(params.row.id, 'sellPrice', e.target.value)
                }
                InputProps={{
                  style: {
                    color: isPriceChanged
                      ? theme.palette.primary.main
                      : 'inherit',
                    backgroundColor: 'white',
                  },
                }}
              />
              {marketPrice && (
                <Typography variant="caption">
                  {marketPrice.toLocaleString()}円
                </Typography>
              )}
            </Stack>
          ) : (
            <Box
              color="secondary.main"
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
            >
              {params.value.toLocaleString()}円
              {marketPrice && (
                <>
                  <Typography
                    component="span"
                    variant="caption"
                    color="grey.700"
                  >
                    {marketPrice.toLocaleString()}円
                  </Typography>
                  {/* 変動率 */}
                  {/* <Typography
                    component="span"
                    color="secondary.main"
                    variant="caption"
                  >
                    ({percentageChange > 0 ? '+' : ''}
                    {percentageChange.toFixed(1)}%)
                  </Typography> */}
                </>
              )}
            </Box>
          );
        },
      },
      {
        field: 'buyPrice',
        headerName: '買取価格',
        type: 'number',
        minWidth: 100,
        flex: 0.1,
        headerAlign: 'left',
        align: 'center',
        renderHeader: () => (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography color={'grey.700'}>買取価格</Typography>
            {/* <Typography color={'grey.700'} variant="caption">
              買取価格相場
            </Typography> */}
          </Box>
        ),
        renderCell: (params) => {
          const editedBuyPrice = editedPrices[params.row.id]?.buyPrice;
          const isPriceChanged =
            editedBuyPrice !== undefined && editedBuyPrice !== params.value;

          return isEditMode ? (
            <TextField
              value={editedBuyPrice ?? params.value}
              variant="outlined"
              size="small"
              fullWidth
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                handlePriceChange(params.row.id, 'buyPrice', e.target.value)
              }
              InputProps={{
                style: {
                  color: isPriceChanged
                    ? theme.palette.primary.main
                    : 'inherit',
                  backgroundColor: 'white',
                },
              }}
            />
          ) : (
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <Box color="primary.main">
                {params.value.toLocaleString()}円
                {/* <Typography component="span" color="secondary.main">
                  ({percentageChange > 0 ? '+' : ''}
                  {percentageChange.toFixed(1)}%)
                </Typography> */}
              </Box>
            </Box>
          );
        },
      },
      {
        field: 'productsStockNumber',
        headerName: '在庫数',
        minWidth: 100,
        flex: 0.1,
        headerAlign: 'left',
        align: 'left',
        renderCell: (params) => {
          return (
            <StockDetailCell
              products={params.row.products}
              productsStockNumber={params.row.productsStockNumber}
              infiniteStock={params.row.infiniteStock}
            />
          );
        },
      },
      {
        field: 'rarity',
        headerName: 'レアリティ',
        minWidth: 100,
        flex: 0.1,
        headerAlign: 'left',
        align: 'left',
      },
      {
        field: 'packName',
        headerName: 'パック名',
        minWidth: 120,
        flex: 0.3,
        headerAlign: 'left',
        align: 'left',
      },
    ];

    // タブが「すべて」でない場合のみ `option1Value` を追加
    if (tabIndex !== 0) {
      columns.push({
        field: 'option1Value',
        headerName: 'タイプ',
        minWidth: 120,
        flex: 0.1,
        headerAlign: 'left',
        align: 'left',
      });
    }

    // isHiddenItemsの場合、再表示項目を追加
    if (isHiddenItems) {
      columns.push({
        field: 'Redisplay',
        headerName: '再表示',
        minWidth: 100,
        flex: 0.1,
        headerAlign: 'left',
        align: 'left',
        renderCell: (params) => {
          return (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <SecondaryButtonWithIcon
                onClick={() => handleReDisplay(params.row)}
                sx={{ minWidth: '50px' }}
                loading={updateItemLoading}
                disabled={params.row.hide}
              >
                再表示
              </SecondaryButtonWithIcon>
            </Box>
          );
        },
      });
    }

    return columns;
  };

  return (
    <>
      {/* タブの表示 */}
      <GenreTabComponent setSearchState={setSearchState} />

      {/* 絞り込みの選択肢 ※コンポーネント化予定 */}
      <Stack
        direction="row"
        justifyContent="space-between" // 左右の端に配置
        alignItems="center"
        pt="8px"
      >
        <Stack direction="row" gap="8px">
          <ItemTableCategorySearch
            category={category}
            selectCategory={selectCategory}
            setSelectCategory={setSelectCategory}
            setSearchState={setSearchState}
          />
          <FindOptionSelect
            storeID={selectedStoreID}
            selectedGenreId={selectedGenreID}
            selectedCategoryId={Number(selectCategory)}
            selectedFindOption={selectedFindOption}
            handleChangeFindOption={handleChangeFindOption}
            cardCategoryId={cardCategory?.id}
          />
        </Stack>
        <ItemTableSort
          selectCategory={selectCategory}
          setSearchState={setSearchState}
          setSelectCategory={setSelectCategory}
        />
      </Stack>

      {/* データグリッド */}
      <Box
        sx={{ display: 'flex', gap: '10px', flex: 1, overflow: 'auto', mt: 1 }}
      >
        <RightClickDataGrid
          columns={columns}
          rows={items}
          handleRowClick={isHiddenItems ? undefined : handleRowClick}
          page="item"
          paginationModel={paginationModel}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          loading={isLoading}
          sx={{
            height: '100%',
            width: '100%',
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: 'white',
            },
            '& .MuiDataGrid-cell': {
              alignItems: 'center',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: 'grey.700',
            },
            '& .MuiDataGrid-row': {
              backgroundColor: isEditMode ? 'grey.200' : 'white',
            },
          }}
        />
      </Box>

      {/* モーダルの表示 */}
      <ItemRegisterModal
        open={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
        refetchItemsAfterUpdate={refetchItemsAfterUpdate}
        setProductId={setProductId}
        setIsDetailModalOpen={setIsDetailModalOpen}
      />
      {/* 在庫詳細モーダルの表示 */}
      {productId && category && genre && (
        <StockDetailModal
          productId={productId}
          isOpen={isDetailModalOpen}
          onClose={handleCloseStockDetailModal}
          category={category}
          genre={genre}
          customCancelButtonText={'商品詳細モーダルに戻る'}
        />
      )}
    </>
  );
};
