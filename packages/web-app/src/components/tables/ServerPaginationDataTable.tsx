import React, { useState, useEffect } from 'react';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowsProp,
} from '@mui/x-data-grid';

interface Props {
  columns: GridColDef[];
  fetchData: (page: number, pageSize: number) => Promise<any>;
}

export const ServerSidePaginationGrid: React.FC<Props> = ({
  columns,
  fetchData,
}) => {
  const [data, setData] = useState<GridRowsProp>([]);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(50);
  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchData(page, pageSize);
        setData(result.data);
        setRowCount(result.totalCount);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [page, pageSize, fetchData]);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={data}
        pagination
        pageSizeOptions={[50, 100]}
        rowCount={rowCount}
        paginationMode="server"
        filterMode="server"
        onPaginationModelChange={(model: GridPaginationModel) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        // onPageChange={(newPage) => setPage(newPage)}
        // onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        loading={loading}
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
        columns={columns}
      />
    </div>
  );
};
