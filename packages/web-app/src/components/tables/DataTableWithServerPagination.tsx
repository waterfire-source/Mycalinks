import * as React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import { SxProps, Theme, Box } from '@mui/material';

interface Props {
  columns: GridColDef[];
  rows: any[];
  sx?: SxProps<Theme>;
  paginationMode: { page: number; pageSize: number; totalCount: number };
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  loading: boolean;
  onRowClick?: (params: GridRowParams) => void;
  showSelectionCount?: boolean;
}

export const DataTableWithServerPagination: React.FC<Props> = ({
  columns,
  rows,
  sx,
  paginationMode,
  onPageChange,
  onPageSizeChange,
  loading,
  onRowClick,
  showSelectionCount = true,
}) => {
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (paginationMode.page !== model.page) {
      onPageChange(model.page);
    } else {
      onPageSizeChange(model.pageSize);
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        ...sx,
      }}
    >
      <DataGrid
        getRowHeight={() => 'auto'}
        rows={rows}
        columns={columns}
        paginationMode="server"
        paginationModel={{
          page: paginationMode.page,
          pageSize: paginationMode.pageSize,
        }}
        rowCount={paginationMode.totalCount}
        onPaginationModelChange={handlePaginationModelChange}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        pageSizeOptions={[30, 50, 100]}
        loading={loading}
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
          ...(showSelectionCount
            ? {}
            : {
                '& .MuiDataGrid-selectedRowCount': {
                  display: 'none',
                },
                '& .MuiTablePagination-root': {
                  marginLeft: 'auto',
                  marginRight: '0',
                },
              }),
        }}
      />
    </Box>
  );
};
