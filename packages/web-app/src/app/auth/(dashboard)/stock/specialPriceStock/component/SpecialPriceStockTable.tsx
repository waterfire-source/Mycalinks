import { StockDataGrid } from '@/app/auth/(dashboard)/stock/components/StockDataGrid';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { Box, Checkbox, TextField, Typography } from '@mui/material';
import {
  GridColDef,
  GridPaginationModel,
  GridRowParams,
} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';

interface Props {
  searchState: ProductSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  onRowClick?: (params: GridRowParams, event: React.MouseEvent) => void;
}

interface PrintCount {
  id?: number;
  printCount?: number;
}

export const SpecialPriceStockTable = ({
  searchState,
  setSearchState,
  selectedIds,
  setSelectedIds,
  onRowClick,
}: Props) => {
  const { pushQueue } = useLabelPrinterHistory();
  const [printCounts, setPrintCounts] = useState<PrintCount[]>([]);
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '',
      flex: 0.075,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => {
        const allSelected =
          searchState.searchResults.length > 0 &&
          searchState.searchResults.every((row) =>
            selectedIds.includes(row.id),
          );
        const someSelected =
          searchState.searchResults.some((row) =>
            selectedIds.includes(row.id),
          ) && !allSelected;

        return (
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected}
            onChange={(event) => {
              if (event.target.checked) {
                // すべて選択
                const allIds = searchState.searchResults.map((row) => row.id);
                setSelectedIds(allIds);
              } else {
                // すべて解除
                setSelectedIds([]);
              }
            }}
            sx={{
              color: 'primary.main',
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />
        );
      },
      renderCell: (params) => {
        return (
          <Checkbox
            checked={selectedIds.includes(params.row.id)}
            onChange={(event) => {
              event.stopPropagation();
              handleCheckboxClick(params.row.id);
            }}
            sx={{
              color: 'primary.main',
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />
        );
      },
    },
    {
      field: 'productImage',
      headerName: '商品画像',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 40,
      renderCell: (params) => <ItemImage imageUrl={params.value} />,
    },
    {
      field: 'productName',
      headerName: '商品名',
      minWidth: 200,
      flex: 0.2,
      headerAlign: 'left',
      align: 'center',
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <ItemText text={params.row.productName} />
          </Box>
        );
      },
    },
    {
      field: 'createDate',
      headerName: '特価作成日',
      flex: 0.1,
      headerAlign: 'left',
      align: 'center',
      minWidth: 120,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography>{params.row.createDate}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'specialPrice',
      headerName: '特価価格',
      flex: 0.1,
      headerAlign: 'left',
      align: 'center',
      minWidth: 120,
      renderCell: (params) => {
        const specialPrice = params.row.specialPrice;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography>{specialPrice.toLocaleString()}円</Typography>
          </Box>
        );
      },
    },
    {
      field: 'productStock',
      headerName: '特価在庫数',
      flex: 0.1,
      headerAlign: 'left',
      align: 'center',
      minWidth: 120,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography>
              {params.row.itemInfiniteStock
                ? '∞'
                : params.row.productStock.toLocaleString()}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'print',
      headerName: 'ラベル印刷',
      flex: 0.1,
      headerAlign: 'left',
      align: 'center',
      minWidth: 100,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <TextField
            sx={{
              flex: 1,
              minWidth: '50px',
              '& .MuiInputBase-input': {
                fontSize: 14,
                px: 1,
              },
            }}
            size="small"
            type="number"
            placeholder="枚数"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              setPrintCounts((prev) => {
                const updatedRows = prev.map((row) => {
                  // 一致する行があれば更新
                  if (row.id === params.row?.id) {
                    return {
                      ...row,
                      printCount: e.target.value
                        ? Math.max(Number(e.target.value), 0)
                        : undefined,
                    };
                  }
                  return row;
                });

                // 一致しない行がなければ新しく追加
                if (!prev.some((row) => row.id === params.row?.id)) {
                  return [
                    ...updatedRows,
                    {
                      id: params.row?.id,
                      printCount: e.target.value
                        ? Math.max(Number(e.target.value), 0)
                        : undefined,
                      // 他の必要なプロパティも追加
                    },
                  ];
                }

                return updatedRows;
              });
            }}
          />
          <PrimaryButtonWithIcon
            sx={{
              minWidth: '50px',
            }}
            onClick={async (e) => {
              e.stopPropagation();

              //在庫数>指定した枚数の場合→価格無しラベルのみ
              //在庫数=指定した枚数の場合→価格ありラベル1枚+残り価格無しラベル

              const productId = params.row?.id;
              const printCount =
                printCounts.find((product) => product.id === productId)
                  ?.printCount ?? 1;
              const stockNumber = params.row.productStock ?? 0;

              let isFirstStock = stockNumber <= printCount;

              for (let i = 0; i < printCount; i++) {
                pushQueue({
                  template: 'product',
                  data: productId,
                  meta: {
                    isFirstStock,
                    isManual: true,
                  },
                });
                isFirstStock = false; //2枚目以降はfalseで
              }
            }}
          >
            印刷
          </PrimaryButtonWithIcon>
        </Box>
      ),
    },
  ];

  const itemList = useMemo(
    () =>
      searchState.searchResults.map((element) => {
        return {
          id: element.id,
          productImage: element.image_url,
          productName: element.displayNameWithMeta,
          productStock: element.stock_number ?? 0,
          specialPrice: element.actual_sell_price,
          createDate: element.created_at
            ? dayjs(element.updated_at).format('YYYY/MM/DD')
            : '',
          itemInfiniteStock: element.item_infinite_stock,
        };
      }),
    [searchState.searchResults],
  );

  // チェックボックスクリック時の処理
  const handleCheckboxClick = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        // IDが既に配列に存在する場合は削除
        return prev.filter((existingId) => existingId !== id);
      } else {
        // 存在しない場合は追加
        return [...prev, id];
      }
    });
  };

  //ページネーションの処理
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
      rowCount={searchState.totalValues.itemCount}
      rows={itemList}
      columns={columns}
      onRowClick={onRowClick}
    />
  );
};
