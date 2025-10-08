import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { Box } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';

interface Props {
  searchState: ProductSearchState | ItemSearchState;
  rowCount?: number;
  rows: GridRowsProp;
  columns: GridColDef[];
  onRowClick?: (params: any, event: React.MouseEvent) => void;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  getRowClassName?: (params: any) => string;
}

export const StockDataGrid = ({
  searchState,
  rowCount,
  rows,
  columns,
  onRowClick,
  onPaginationModelChange,
  getRowClassName,
}: Props) => {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        pagination
        paginationMode="server"
        paginationModel={{
          page: searchState.currentPage,
          pageSize: searchState.itemsPerPage,
        }}
        disableColumnMenu
        disableColumnSorting
        rowCount={rowCount}
        onPaginationModelChange={onPaginationModelChange}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        pageSizeOptions={[30, 50, 100]}
        rows={rows}
        columns={columns}
        loading={searchState.isLoading}
        disableRowSelectionOnClick
        rowHeight={100}
        onRowClick={onRowClick}
        getRowClassName={getRowClassName}
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
            backgroundColor: 'white',
            borderBottomColor: 'transparent',
          },
          // グループ内の最後以外の行のボーダーを削除
          '& .MuiDataGrid-row.no-bottom-border': {
            '& .MuiDataGrid-cell': {
              borderBottom: 'none !important',
            },
          },
          // グループ内の最初以外の行の上ボーダーを削除
          '& .MuiDataGrid-row.no-top-border': {
            '& .MuiDataGrid-cell': {
              borderTop: 'none !important',
            },
          },
        }}
      />
    </Box>
  );
};
