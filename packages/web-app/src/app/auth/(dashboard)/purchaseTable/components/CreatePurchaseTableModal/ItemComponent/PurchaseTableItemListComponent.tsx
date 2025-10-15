import { SelectedProduct } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/CreatePurchaseTableModal';
import { StockDataGrid } from '@/app/auth/(dashboard)/stock/components/StockDataGrid';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { Box, Checkbox, Stack, TextField, Typography } from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useState } from 'react';

interface Props {
  searchState: ItemSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  setSelectedProduct: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
}

export const PurchaseTableItemList = ({
  searchState,
  setSearchState,
  setSelectedProduct,
}: Props) => {
  const [displayPrice, setDisplayPrice] = useState<
    { itemId: number; displayPrice: string }[]
  >([]);
  const [anyModelNumber, setAnyModelNumber] = useState<
    { itemId: number; anyModelNumber: boolean }[]
  >([]);
  const [isPsa10, setIsPsa10] = useState<
    { itemId: number; isPsa10: boolean }[]
  >([]);

  // アイテムリスト作成、表示データの指定
  const itemList = searchState.searchResults.map((element, index) => ({
    id: index,
    itemImage: element.image_url,
    itemName: element.display_name ?? '',
    itemId: element.id,
    itemStockNumber: element.products_stock_number.toString(),
    buyPrice: element.buy_price,
    infiniteStock: element.infinite_stock ?? false,
    expansion: element.expansion,
    cardNumber: element.cardnumber,
    rarity: element.rarity,
  }));

  const columns: GridColDef[] = [
    {
      field: 'itemImage',
      headerName: '商品',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) => <ItemImage imageUrl={params.value} />,
    },
    {
      field: 'itemName',
      headerName: '商品',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 200,
      renderCell: (params) => {
        return (
          <Stack
            direction="column"
            gap={0.5}
            sx={{
              height: '100%',
              justifyContent: 'center',
              alignItems: 'left',
            }}
          >
            <ItemText text={params.row.itemName} />
            <Typography variant="caption">
              {params.row.expansion} {params.row.cardNumber} {params.row.rarity}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'buyPrice',
      headerName: '買取価格',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 70,
    },
    {
      field: 'itemStockNumber',
      headerName: '在庫数',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 70,
    },
    {
      field: 'displayPrice',
      headerName: '掲載価格',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 150,
      renderCell: (params) => {
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            width="100%"
            height="100%"
            gap={0.5}
          >
            <TextField
              size="small"
              type="text"
              required
              sx={{ width: '90px' }}
              value={
                displayPrice.find((row) => row.itemId === params.row.itemId)
                  ?.displayPrice ?? ''
              }
              onChange={(e) =>
                handleTextFiledChange(params.row.itemId, e.target.value)
              }
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                style: { textAlign: 'right' },
              }}
            />
            <Typography>円</Typography>
          </Box>
        );
      },
    },
    {
      field: 'anyModelNumber',
      headerName: '型番を問わない',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 50,
      renderCell: (params) => {
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            width="60px"
            height="100%"
          >
            <Checkbox
              onChange={(e) =>
                handleCheckBoxChange(params.row.itemId, e.target.checked)
              }
              sx={{
                color: 'primary.main',
                '&.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'isPsa10',
      headerName: 'PSA10',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 50,
      renderCell: (params) => {
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            width="60px"
            height="100%"
          >
            <Checkbox
              onChange={(e) =>
                handlePsa10CheckBoxChange(params.row.itemId, e.target.checked)
              }
              sx={{
                color: 'primary.main',
                '&.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'addButton',
      headerName: '',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 50,
      renderCell: (params) => {
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            width="50px"
            height="100%"
          >
            <SecondaryButtonWithIcon
              onClick={() =>
                handleAddButtonClick(
                  params.row.itemId,
                  params.row.itemImage,
                  params.row.itemName,
                  params.row.buyPrice,
                )
              }
              sx={{
                width: '50px',
                minWidth: '50px',
              }}
            >
              追加
            </SecondaryButtonWithIcon>
          </Box>
        );
      },
    },
  ];

  //掲載価格の処理
  const handleTextFiledChange = (itemId: number, value: string) => {
    setDisplayPrice((prev) => {
      // `itemId` が一致する商品を検索
      const rowExists = prev.find((row) => row.itemId === itemId);

      if (rowExists) {
        // 既存の商品の `displayPrice` を更新
        return prev.map((row) =>
          row.itemId === itemId ? { ...row, displayPrice: value } : row,
        );
      }

      // `itemId` に該当する商品がない場合、新規追加
      return [...prev, { itemId, displayPrice: value }];
    });
  };

  //型番を問わないの処理
  const handleCheckBoxChange = (itemId: number, value: boolean) => {
    setAnyModelNumber((prev) => {
      // `itemId` が一致する商品を検索
      const rowExists = prev.find((row) => row.itemId === itemId);

      if (rowExists) {
        // 既存の商品の `anyModelNumber` を更新
        return prev.map((row) =>
          row.itemId === itemId ? { ...row, anyModelNumber: value } : row,
        );
      }

      // `itemId` に該当する商品がない場合、新規追加
      return [...prev, { itemId, anyModelNumber: value }];
    });
  };

  //PSA10の処理
  const handlePsa10CheckBoxChange = (itemId: number, value: boolean) => {
    setIsPsa10((prev) => {
      // `itemId` が一致する商品を検索
      const rowExists = prev.find((row) => row.itemId === itemId);

      if (rowExists) {
        // 既存の商品の `isPsa10` を更新
        return prev.map((row) =>
          row.itemId === itemId ? { ...row, isPsa10: value } : row,
        );
      }

      // `itemId` に該当する商品がない場合、新規追加
      return [...prev, { itemId, isPsa10: value }];
    });
  };

  // 追加ボタンの処理
  const handleAddButtonClick = (
    itemId: number,
    itemImage: string,
    itemName: string,
    buyPrice: number,
  ) => {
    setSelectedProduct((prev) => {
      // `index` が一致する商品を検索
      const rowExists = prev.find((row) => row.itemId === itemId);
      // `index` が一致する掲載価格を検索
      const foundDisplayPrice = displayPrice.find(
        (row) => row.itemId === itemId,
      );
      // `index` が一致する型番を問わないを検索
      const foundAnyModelNumber = anyModelNumber.find(
        (row) => row.itemId === itemId,
      );
      // `index` が一致するPSA10を検索
      const foundIsPsa10 = isPsa10.find((row) => row.itemId === itemId);

      if (rowExists) {
        // 既存の商品を更新
        return prev.map((row) =>
          row.itemId === itemId
            ? {
                ...row,
                itemImage: itemImage,
                itemName: itemName,
                displayPrice:
                  foundDisplayPrice?.displayPrice || rowExists?.displayPrice,
                anyModelNumber:
                  foundAnyModelNumber?.anyModelNumber ??
                  rowExists?.anyModelNumber ??
                  false,
                isPsa10: foundIsPsa10?.isPsa10 ?? rowExists?.isPsa10 ?? false,
              }
            : row,
        );
      }

      // `itemId` に該当する商品がない場合、新規追加
      return [
        ...prev,
        {
          itemId: itemId,
          itemImage: itemImage,
          itemName: itemName,
          displayPrice: foundDisplayPrice?.displayPrice || buyPrice.toString(),
          anyModelNumber: foundAnyModelNumber?.anyModelNumber ?? false,
          isPsa10: foundIsPsa10?.isPsa10 ?? false,
        },
      ];
    });
  };

  // ページネーション
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (searchState.currentPage !== model.page) {
      handlePageChange(model.page);
    } else {
      handlePageSizeChange(model.pageSize);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchState((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchState((prev) => ({
      ...prev,
      itemsPerPage: newSize,
    }));
  };
  return (
    <StockDataGrid
      searchState={searchState}
      onPaginationModelChange={handlePaginationModelChange}
      rowCount={searchState.totalCount}
      rows={itemList}
      columns={columns}
    />
  );
};
