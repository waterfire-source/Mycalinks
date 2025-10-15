// TODO: 一覧の来店回数と最多取引種類を表示する（バックエンド待ち）
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import dayjs from 'dayjs';

import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { CustomerDetail } from '@/feature/customers/components/CustomerDetail';
import { CustomError, createClientAPI } from '@/api/implement';
import { Customer, TransactionKind } from '@prisma/client';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PrimaryButton from '@/components/buttons/PrimaryButton';

export interface CustomerData {
  id: number;
  email: string | null;
  myca_user_id: number | null;
  birthday: Date | null;
  registration_date: Date | null;
  owned_point: number;
  point_exp: Date | null;
  address: string | null;
  zip_code: string | null;
  prefecture: string | null;
  address2: string | null;
  city: string | null;
  building: string | null;
  phone_number: string | null;
  gender: string | null;
  career: string | null;
  full_name: string | null;
  full_name_ruby: string | null;
  is_active: boolean;
  lastUsedDate?: Date | null;
  memo?: string | null;
}

export interface TransactionStats {
  groupByDepartmentTransactionKind: Array<{
    department_display_name: string | null;
    total_count: number;
    transaction_kind: TransactionKind;
  }>;
  numberOfVisits: number;
}

export default function CustomerManagementPage() {
  const { store } = useStore();
  const { setAlertState } = useAlert();

  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [fullName, setFullName] = useState('');
  const [memo, setMemo] = useState('');

  const [loading, setLoading] = useState(true);
  const clientAPI = useMemo(() => createClientAPI(), []);

  const fetchCustomerData = useCallback(async () => {
    setLoading(true);
    const res = await clientAPI.customer.getAllCustomer({
      store_id: store.id,
      includesTransactionStats: true,
      fullName: fullName || undefined,
      memo: memo || undefined,
    });
    if (res instanceof CustomError) {
      setAlertState({ message: res.message, severity: 'error' });
      setLoading(false);
      return;
    }
    setCustomers(res);
    setLoading(false);
    // エンター押した時、検索ボタン押した時だけ検索する
  }, [clientAPI.customer, store.id, setAlertState, fullName, memo]);
  useEffect(() => {
    fetchCustomerData();
  }, []);

  const columns: GridColDef[] = [
    {
      field: 'full_name',
      headerName: '顧客名',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      valueGetter: (params) => params || '-',
      renderHeader: (params) => <Box pl={2}>{params.colDef.headerName}</Box>,
      renderCell: (params) => <Box pl={2}>{params.value}</Box>,
    },
    {
      field: 'full_name_ruby',
      headerName: 'フリガナ',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      valueGetter: (params) => params || '-',
      renderHeader: (params) => <Box pl={1}>{params.colDef.headerName}</Box>,
      renderCell: (params) => <Box pl={1}>{params.value}</Box>,
    },
    {
      field: 'lastUsedDate',
      headerName: '最新来店日時',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      valueGetter: (params) => {
        const lastUsedDate = params;
        return lastUsedDate
          ? dayjs(lastUsedDate).format('YYYY/MM/DD HH:mm:ss')
          : '-';
      },
      renderHeader: (params) => <Box pl={1}>{params.colDef.headerName}</Box>,
      renderCell: (params) => {
        const formattedDate = dayjs(params.value);
        if (!formattedDate.isValid()) {
          return <Box pl={1}>{'-'}</Box>;
        }
        const date = formattedDate.format('YYYY/MM/DD');
        const time = formattedDate.format('HH:mm:ss');
        return (
          <Box
            pl={1}
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            height="100%"
          >
            <Typography>{date}</Typography>
            <Typography variant="caption">{time}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'numberOfVisits',
      headerName: '来店回数',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderHeader: (params) => <Box pl={1}>{params.colDef.headerName}</Box>,
      renderCell: (params) => (
        <Box pl={1}>{params.row.transactionStats.numberOfVisits || '-'}</Box>
      ),
    },
    {
      field: 'transactionStats',
      headerName: '最多取引種類',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderHeader: (params) => <Box pl={1}>{params.colDef.headerName}</Box>,
      renderCell: (params) => {
        const mostFrequentTransaction =
          Array.isArray(
            params.row.transactionStats.groupByItemGenreTransactionKind,
          ) &&
          params.row.transactionStats.groupByItemGenreTransactionKind.length > 0
            ? params.row.transactionStats.groupByItemGenreTransactionKind.reduce(
                (
                  prev: { total_count: number },
                  current: { total_count: number },
                ) => (prev.total_count > current.total_count ? prev : current),
              )
            : null;
        if (!mostFrequentTransaction) return <Box pl={1}>{'-'}</Box>;
        return (
          <Box pl={1}>{`${mostFrequentTransaction.genre_display_name}`}</Box>
        );
      },
    },
    {
      field: 'details',
      headerName: '',
      flex: 0.5,
      headerAlign: 'center',
      align: 'center',
      renderCell: () => (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ height: '100%' }}
        >
          <ArrowForwardIosIcon color="disabled" />
        </Box>
      ),
    },
  ];

  const handleRowClick = (params: GridRowParams) => {
    setSelectedCustomer(params.row);
  };

  return (
    <ContainerLayout title="顧客管理" helpArchivesNumber={836}>
      <Box sx={{ width: '100%', display: 'flex', height: '100%' }}>
        <Box
          sx={{
            flex: 1,
            minWidth: '600px',
            pr: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="顧客名で検索"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchCustomerData();
                }
              }}
              sx={{ flex: 0.5 }}
            />
            <TextField
              size="small"
              variant="outlined"
              placeholder="メモで検索"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchCustomerData();
                }
              }}
              sx={{ flex: 0.5 }}
            />
            <PrimaryButton
              onClick={() => fetchCustomerData()}
              loading={loading}
            >
              検索
            </PrimaryButton>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataGrid
              rows={customers}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 50 } },
              }}
              pageSizeOptions={[50]}
              onRowClick={handleRowClick}
              localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
              disableColumnMenu
              disableColumnSorting
              loading={loading}
              rowHeight={50}
              components={{
                LoadingOverlay: CircularProgress,
              }}
              sx={{
                height: '100%',
                flex: 1,
                // overflow: 'scroll',
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: 'white',
                  borderTop: '8px solid #b82a2a',
                  color: 'grey.700',
                },
                '& .MuiDataGrid-row': {
                  backgroundColor: 'white',
                },
                '& .MuiDataGrid-filler': {
                  backgroundColor: 'white',
                },
                '& .MuiDataGrid-overlayWrapperInner': {
                  backgroundColor: 'white',
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: 'white',
                  borderRadius: '2px',
                },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ flex: 0.35, height: '100%', minWidth: '300px' }}>
          <CustomerDetail
            customer={selectedCustomer}
            fetchCustomerData={fetchCustomerData}
          />
        </Box>
      </Box>
    </ContainerLayout>
  );
}
