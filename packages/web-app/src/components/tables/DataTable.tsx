import * as React from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import { SxProps, Theme, Box } from '@mui/material';

interface DataTableProps {
  columns: GridColDef[];
  rows: any[];
  sx?: SxProps<Theme>;
  isLoading?: boolean;
  rowSelection?: boolean;
  onRowClick?: (params: any) => void;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  totalCount?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  sx,
  isLoading = false,
  rowSelection = true,
  onRowClick,
  paginationModel = undefined,
  onPaginationModelChange,
  totalCount = undefined,
}) => {
  return (
    <Box sx={{ height: 550, width: '100%', ...sx }}>
      <DataGrid
        getRowHeight={() => 'auto'}
        rowSelection={rowSelection}
        rows={rows}
        columns={columns}
        loading={isLoading}
        disableAutosize
        disableColumnMenu
        disableColumnResize
        disableColumnSorting
        disableColumnSelector
        disableDensitySelector
        pagination
        paginationMode={
          paginationModel && totalCount !== undefined ? 'server' : undefined
        }
        initialState={
          paginationModel
            ? undefined
            : {
                pagination: {
                  paginationModel: { page: 0, pageSize: 50 },
                },
              }
        }
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        pageSizeOptions={[30, 50, 100]} // 無料版では上限が100のため、100より大きい数字は入れてはいけない
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={totalCount}
        onRowClick={onRowClick}
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
            p: 1,
          },
          backgroundColor: 'common.white',
          color: 'text.primary',
        }}
      />
    </Box>
  );
};

export default DataTable;
