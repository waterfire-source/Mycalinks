import { Row } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventorySearchTable';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Dispatch, SetStateAction } from 'react';

type Props = {
  searchState: ProductSearchState;
  setSearchState: Dispatch<SetStateAction<ProductSearchState>>;
  rows: Row[];
  setRows: Dispatch<SetStateAction<Row[]>>;
  handleChangeQuantity: (rowId: number, count: number) => void;
  handleClickAddButton: (rowId: number) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export const InventorySearchResultTableContent = ({
  searchState,
  rows,
  handleChangeQuantity,
  handleClickAddButton,
  onPageChange,
  onPageSizeChange,
}: Props) => {
  // ページネーションイベント
  const handlePaginationModelChange = (model: GridPaginationModel): void => {
    if (searchState.currentPage !== model.page) {
      onPageChange(model.page);
    } else if (searchState.itemsPerPage !== model.pageSize) {
      onPageSizeChange(model.pageSize);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'product_image',
      headerName: '商品画像',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => <ItemImage imageUrl={params.row.productImage} />,
    },
    {
      field: 'product_name',
      headerName: '商品名',
      headerAlign: 'center',
      align: 'center',
      flex: 2.5,
      renderCell: (params) => <Typography>{params.row.productName}</Typography>,
    },
    {
      field: 'status',
      headerName: '状態',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => <Typography>{params.row.status}</Typography>,
    },
    {
      field: 'stock',
      headerName: '理論在庫',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params.row.stock}</Typography>;
      },
    },
    {
      field: 'sell_price',
      headerName: '販売価格',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => (
        <Typography>{params.row.sellPrice.toLocaleString()}円</Typography>
      ),
    },
    {
      field: 'count',
      headerName: '登録数',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => {
        return (
          <NumericTextField
            label="登録数"
            sx={{ width: '100%' }}
            InputProps={{ sx: { padding: '6px', height: '40px' } }}
            value={params.row.quantity}
            onChange={(e) => handleChangeQuantity(params.row.rowId, e)}
          />
        );
      },
    },
    {
      field: 'register',
      headerName: '',
      headerAlign: 'center',
      align: 'center',
      flex: 0,
      renderCell: (params) => (
        <PrimaryButton onClick={() => handleClickAddButton(params.row.rowId)}>
          登録
        </PrimaryButton>
      ),
    },
  ];

  return (
    <DataGrid
      columns={columns}
      loading={searchState.isLoading}
      rows={rows}
      getRowId={(row) => row.rowId}
      pagination
      paginationMode="server"
      paginationModel={{
        page: searchState.currentPage,
        pageSize: searchState.itemsPerPage,
      }}
      rowCount={searchState.totalValues.itemCount}
      pageSizeOptions={[30, 50, 100]}
      onPaginationModelChange={handlePaginationModelChange}
      disableRowSelectionOnClick
      disableColumnSorting
      disableColumnResize
      disableColumnMenu
      rowHeight={100}
      localeText={{
        MuiTablePagination: {
          labelRowsPerPage: '1ページあたりの行数:',
          labelDisplayedRows: ({ from, to, count }) => `${from}-${to} / ${count}`,
        },
      }}
      sx={{
        width: '100%',
        '& .MuiDataGrid-columnHeaders': {
          color: 'grey',
        },
        '& .MuiDataGrid-cell': {
          whiteSpace: 'normal',
          display: 'flex',
          alignItems: 'center',
        },
      }}
    ></DataGrid>
  );
};
