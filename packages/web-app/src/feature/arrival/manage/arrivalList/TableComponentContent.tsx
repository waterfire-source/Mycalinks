import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridPaginationModel,
} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { StockingStatus } from '@prisma/client';
import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { jaJP } from '@mui/x-data-grid/locales';
import { ArrivalDetailModal } from '@/feature/arrival/manage/arrivalList/ArrivalDetailModal';
import { StockingApplyModal } from '@/feature/arrival/manage/arrivalList/cell/actions/register/StockingApplyModal';
import { calcArrivalPricesByStockingProduct } from '@/feature/arrival/utils';
import { ArrivalProductsCell } from '@/feature/arrival/manage/arrivalList/cell/Products';
import { StockingData } from '@/feature/arrival/hooks/useListStocking';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  stockings: StockingData[];
  isLoading: boolean;
  fetchStockings: () => Promise<void>;
  totalCount?: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

export const TableComponentContent = ({
  stockings,
  isLoading,
  fetchStockings,
  totalCount,
  paginationModel,
  onPaginationModelChange,
}: Props) => {
  const [selectedStocking, setSelectedStocking] = useState<
    BackendStockingAPI[5]['response']['200'][0] | null
  >(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleCloseModal = () => {
    setSelectedStocking(null);
    setIsApplyModalOpen(false);
    fetchStockings();
  };

  const handleOpenApplyModal = (
    stocking: BackendStockingAPI[5]['response']['200'][0],
  ) => {
    setSelectedStocking(stocking);
    setIsApplyModalOpen(true);
  };

  const statusLabelMap: Record<Exclude<StockingStatus, 'ROLLBACK'>, string> = {
    [StockingStatus.NOT_YET]: '未納品',
    [StockingStatus.FINISHED]: '納品済み',
    [StockingStatus.CANCELED]: 'キャンセル',
  };

  const columns: GridColDef[] = [
    {
      field: 'status',
      headerName: 'ステータス',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      renderCell: (params) => (
        <Stack alignItems="center" justifyContent="center" height="100%">
          <Box
            sx={{
              backgroundColor:
                params.value === StockingStatus.NOT_YET
                  ? 'primary.main'
                  : 'grey.500',
              color: 'text.secondary',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              lineHeight: 1,
            }}
          >
            <Typography variant="caption">
              {statusLabelMap[
                params.value as Exclude<StockingStatus, 'ROLLBACK'>
              ] ?? '不明'}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'stocking_products_for_name',
      headerName: '商品',
      flex: 0.3,
      headerAlign: 'left',
      align: 'left',
      minWidth: 200,
      renderCell: (params) => (
        <Stack justifyContent="center" height="100%" width={'100%'}>
          <ArrivalProductsCell
            products={params.value}
            hasMultipleStore={false}
          />
        </Stack>
      ),
    },
    {
      field: 'stocking_products_for_price',
      headerName: '合計仕入れ値',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 100,
      renderCell: (params) => {
        const totalArrivalPrice: number = calcArrivalPricesByStockingProduct(
          params.value,
        ).totalArrivalPrice;
        const isTaxIncluded = params.value[0]?.unit_price_without_tax !== null;
        return (
          <Stack alignItems="left" justifyContent="center" height="100%">
            <Typography>{totalArrivalPrice.toLocaleString()} 円</Typography>
            <Typography>{isTaxIncluded ? '(税抜)' : '(税込)'}</Typography>
          </Stack>
        );
      },
    },
    {
      field: 'planned_date',
      headerName: '入荷予定日',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 100,
      renderCell: (params) => {
        try {
          const formattedDate = params.value
            ? dayjs(params.value).format('YYYY/MM/DD')
            : '-';
          return <Typography>{formattedDate}</Typography>;
        } catch (error) {
          return <Typography>-</Typography>;
        }
      },
    },
    {
      field: 'actual_date',
      headerName: '納品日',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 100,
      renderCell: (params) => (
        <Typography>
          {params.value ? dayjs(params.value).format('YYYY/MM/DD') : '-'}
        </Typography>
      ),
    },
    {
      field: 'supplier_name',
      headerName: '仕入れ先',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 150,
      renderCell: (params) => (
        <Typography>{params.value ? params.value : '-'}</Typography>
      ),
    },
    {
      field: 'delivery',
      headerName: '',
      flex: 0.05,
      align: 'center',
      headerAlign: 'center',
      minWidth: 100,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <HelpIcon helpArchivesNumber={1364} />,
      renderCell: (params) =>
        params.row.status === StockingStatus.NOT_YET ? (
          <Stack alignItems="center" justifyContent="center" height="100%">
            <PrimaryButtonWithIcon
              sx={{ maxHeight: '40px', minWidth: '0', maxWidth: '60px' }}
              onClick={() => handleOpenApplyModal(params.row.stocking)}
            >
              納品
            </PrimaryButtonWithIcon>
          </Stack>
        ) : null,
    },
  ];

  const rows: GridRowsProp = stockings.map((stocking) => ({
    id: stocking.id,
    status: stocking.status,
    planned_date: stocking.planned_date,
    actual_date: stocking.actual_date,
    supplier_name: stocking.supplier_name,
    stocking,
    stocking_products_for_price: stocking.stocking_products,
    stocking_products_for_name: stocking.stocking_products,
  }));

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        disableColumnMenu
        loading={isLoading}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        pageSizeOptions={[30, 50, 100]}
        rowHeight={80}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={totalCount ?? -1}
        disableColumnFilter
        disableColumnSorting
        onRowClick={(params) => {
          setSelectedStocking(params.row.stocking);
        }}
        sx={{
          height: '100%',
          width: '100%',
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'white',
          },
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: 'grey.700',
          },
          '& .MuiDataGrid-row': {
            backgroundColor: 'white',
            cursor: 'pointer',
          },
        }}
      />

      {selectedStocking && (
        <ArrivalDetailModal
          isOpen={Boolean(selectedStocking)}
          onClose={handleCloseModal}
          stocking={selectedStocking}
          search={fetchStockings}
        />
      )}

      {isApplyModalOpen && selectedStocking && (
        <StockingApplyModal
          isOpen={isApplyModalOpen}
          onClose={handleCloseModal}
          defaultStocking={selectedStocking}
          search={fetchStockings}
        />
      )}
    </>
  );
};
