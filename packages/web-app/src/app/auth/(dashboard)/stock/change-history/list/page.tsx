'use client';

import { useEffect, useState } from 'react';
import { Tooltip, Typography, Stack } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import dayjs from 'dayjs';
// NoImgコンポーネントをインポート
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { jaJP } from '@mui/x-data-grid/locales';
import { useChangeHistory } from '@/feature/stock/changeHistory/useChangeHistory';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';

export default function StockChangeHistoryPage() {
  const { histories, setParams, totalCount, isLoading } = useChangeHistory();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 30,
  });

  useEffect(() => {
    setParams({
      sourceKind: 'product',
      skip: paginationModel.page * paginationModel.pageSize,
      take: paginationModel.pageSize,
    });
  }, [setParams, paginationModel]);

  const columns: GridColDef[] = [
    {
      field: 'image_url',
      headerName: '画像',
      minWidth: 50,
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <Stack direction="row" alignItems="center" sx={{ height: '100%' }}>
          <ItemImage imageUrl={params.row.product.image_url} />
        </Stack>
      ),
    },
    {
      field: 'display_name',
      headerName: '商品名',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      flex: 0.15,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" sx={{ height: '100%' }}>
          <ItemText text={params.row.product.displayNameWithMeta || ''} />
        </Stack>
      ),
    },
    {
      field: 'datetime',
      headerName: '変更日時',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      flex: 0.15,
      valueGetter: (value) => dayjs(value).format('YYYY/MM/DD HH:mm:ss'),
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" sx={{ height: '100%' }}>
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: 'item_count',
      headerName: '変更在庫数',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      flex: 0.15,
      renderCell: (params) => {
        const itemCount = params.row.item_count ?? 0;
        const resultStockNumber = params.row.result_stock_number ?? 0;
        const stockChange =
          itemCount > 0
            ? `${(
                resultStockNumber - itemCount
              ).toLocaleString()}個 → ${resultStockNumber.toLocaleString()}個`
            : `${(
                resultStockNumber + Math.abs(itemCount)
              ).toLocaleString()}個 → ${resultStockNumber.toLocaleString()}個`;

        return (
          <Stack direction="row" alignItems="center" sx={{ height: '100%' }}>
            <Typography variant="body2">{stockChange}</Typography>
          </Stack>
        );
      },
    },
    {
      field: 'unit_price',
      headerName: '仕入れ値',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      flex: 0.15,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" sx={{ height: '100%' }}>
          <Typography variant="body2">
            {params.value.toLocaleString()}円
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'description',
      headerName: '理由',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      flex: 0.3,
      renderCell: (params) => {
        const description = params.value || '';
        const reasonIndex = description.indexOf('理由：');
        const reasonText =
          reasonIndex !== -1 ? description.slice(reasonIndex + 3) : ''; // 「理由：」以降を抽出

        return (
          <Stack direction="row" alignItems="center" sx={{ height: '100%' }}>
            <Tooltip title={reasonText}>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {reasonText}
              </Typography>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  return (
    <ContainerLayout title="在庫数変更履歴">
      <DataGrid
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
        pageSizeOptions={[10, 30, 50]}
        disableColumnMenu
        disableColumnSorting
        disableColumnFilter
        disableColumnSelector
        rowHeight={80}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        rows={histories}
        columns={columns}
        disableRowSelectionOnClick
        rowCount={totalCount}
        sx={{
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'grey.700',
            color: 'white',
          },
        }}
      />
    </ContainerLayout>
  );
}
