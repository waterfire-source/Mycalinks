'use client';

import { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { OrderActionButtons } from '@/feature/ec/OrderActionButtons';
import { ScanToggle } from '@/feature/ec/ScanToggle';
import { Box } from '@mui/material';
import { mockOrders } from '@/feature/ec/mockOrderDetail';
import {
  ShippingStatusToggle,
  STATUS_MAP,
  type StatusKey,
} from '@/feature/ec/ShippingStatusToggle';

// 注文データの型定義
interface OrderData {
  id: string;
  orderNumber: string;
  receivedDate: string;
  deadline: string;
  deliveryMethod: string;
  status: string;
}

export default function ECManagementPage() {
  const [status, setStatus] = useState<StatusKey>('all'); // ステータスの初期値を設定
  const [orders, setOrders] = useState<OrderData[]>([]); // 注文データの初期値を空配列に
  const [loading, setLoading] = useState(true); // ローディング状態を追加
  const [scanEnabled, setScanEnabled] = useState(false); // スキャン機能の初期値を設定
  useState(false); // 発送準備モーダルの初期値を設定

  // データ取得関数を修正
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // TODO: モックデータを使用(APIから取得するように修正)
      const filteredOrders =
        status === 'all'
          ? mockOrders
          : mockOrders.filter((order) => {
              // ステータスの日本語表記を比較
              return (
                order.status === STATUS_MAP[status as keyof typeof STATUS_MAP]
              );
            });

      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初回レンダリング時とステータス変更時にデータを取得
  useEffect(() => {
    fetchOrders();
    // ステータスが変更された場合のみデータを取得
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const columns: GridColDef[] = [
    {
      field: 'status',
      headerName: 'ステータス',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'orderNumber',
      headerName: '注文番号',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'receivedDate',
      headerName: '受注日',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'deadline',
      headerName: '集荷期限',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'deliveryMethod',
      headerName: '配送方法',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'actions',
      headerName: '',
      flex: 2,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <OrderActionButtons
          status={params.row.status}
          orderId={params.row.id}
          scanEnabled={scanEnabled}
        />
      ),
    },
  ];

  return (
    <ContainerLayout title="EC・フリマ">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
        }}
      >
        <Box sx={{ pt: '20px' }}>
          <ShippingStatusToggle
            status={status}
            onChange={(newStatus) => setStatus(newStatus)}
          />
        </Box>
        <ScanToggle enabled={scanEnabled} onChange={setScanEnabled} />
      </Box>
      <DataGrid
        rows={orders}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 50 },
          },
        }}
        pageSizeOptions={[50]}
        disableRowSelectionOnClick
        loading={loading} // ローディング状態を追加
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'grey.700',
            color: 'white',
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
    </ContainerLayout>
  );
}
