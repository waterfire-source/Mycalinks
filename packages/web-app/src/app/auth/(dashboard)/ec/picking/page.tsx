'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, TextField } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import Image from 'next/image';
import { mockOrderDetail } from '@/feature/ec/mockOrderDetail';
import { OrderItem } from '@/components/modals/ec/OrderDetailModal';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import AlertConfirmationModal from '@/components/modals/common/AlertConfirmationModal';
import { PATH } from '@/constants/paths';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/contexts/AlertContext';

interface PickingItem extends OrderItem {
  id: string;
  scannedQuantity: number;
}

export default function PickingChecklistPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();
  const [items, setItems] = useState<PickingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const { setAlertState } = useAlert();

  useEffect(() => {
    // TODO:実際のAPIコールの代わりにモックデータを使用
    const pickingItems = mockOrderDetail.items.map((item, index) => ({
      ...item,
      id: `${index}`,
      scannedQuantity: 0,
    }));
    setItems(pickingItems);
    setLoading(false);
  }, [orderId]);

  // スキャン完了時の処理
  const handleScanComplete = (id: string) => {
    setItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            scannedQuantity: Math.min(item.scannedQuantity + 1, item.quantity),
          };
        }
        return item;
      });
    });
  };

  // ピッキング完了ボタン押下時の処理
  const handlePickingComplete = () => {
    const hasInsufficientItems = items.some(
      (item) => item.scannedQuantity < item.quantity,
    );
    // 数量に達していない商品がある場合はアラートモーダルを表示
    if (hasInsufficientItems) {
      setIsAlertModalOpen(true);
    } else {
      submitPicking();
    }
  };

  // ピッキング完了APIコール
  const submitPicking = () => {
    // TODO: ピッキング完了APIコール
    setAlertState({
      message: 'ピッキングが完了しました',
      severity: 'success',
    });
    router.push(PATH.EC.root);
  };

  const columns: GridColDef[] = [
    {
      field: 'product',
      headerName: '商品',
      flex: 3,
      headerAlign: 'center',
      align: 'left',
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'left',
            gap: 2,
            height: '100%', // セルの高さいっぱいに広げる
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              pl: 2,
            }}
          >
            <Image
              src={params.row.image}
              alt={params.row.name}
              width={60}
              height={90}
              style={{ objectFit: 'contain', height: '100%' }}
            />
            <Typography variant="body2">{params.row.name}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'modelNumber',
      headerName: '型番',
      flex: 2,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'rarity',
      headerName: 'レアリティ',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'condition',
      headerName: '状態',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'price',
      headerName: '価格',
      flex: 1,
      headerAlign: 'right',
      align: 'right',
      valueFormatter: (params: number) => `¥${params.toLocaleString()}`,
    },
    {
      field: 'scanStatus',
      headerName: 'スキャン数/数量',
      flex: 2,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        // スキャン数/数量のセル
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
          }}
          onClick={(e) => {
            e.stopPropagation(); // 行のクリックイベントを防止
          }}
        >
          <TextField
            type="number"
            size="small"
            value={params.row.scannedQuantity}
            inputProps={{
              min: 0,
              max: params.row.quantity,
              step: 1,
            }}
            onChange={(e) => {
              const value = Math.min(
                Math.max(0, parseInt(e.target.value) || 0),
                params.row.quantity,
              );
              setItems((prevItems) =>
                prevItems.map((item) =>
                  item.id === params.row.id
                    ? { ...item, scannedQuantity: value }
                    : item,
                ),
              );
            }}
            sx={{
              width: '60px',
              '& input': {
                textAlign: 'center',
                p: 1,
                color:
                  params.row.scannedQuantity === params.row.quantity
                    ? 'red'
                    : 'inherit',
              },
            }}
          />
          <Typography variant="body2">/</Typography>
          <Typography variant="body2">{params.row.quantity}</Typography>
        </Box>
      ),
    },
  ];

  return (
    <ContainerLayout title="">
      <Box sx={{ display: 'flex' }}>
        <Typography sx={{ fontSize: '1.3rem' }} variant="body1">
          {'注文番号 ' + orderId}
        </Typography>
        <Typography sx={{ fontSize: '1.3rem', ml: 4 }} variant="body1">
          {'集荷予定日 ' + mockOrderDetail.pickupDate}
        </Typography>
      </Box>

      <DataGrid
        rows={items}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 50 },
          },
        }}
        pageSizeOptions={[50]}
        disableRowSelectionOnClick
        loading={loading}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        onRowClick={(params) => handleScanComplete(params.id.toString())}
        rowHeight={100}
        sx={{
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'grey.700',
            color: 'white',
          },
          '& .MuiDataGrid-row': {
            backgroundColor: 'white',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'grey.50',
            },
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
      <Box sx={{ display: 'flex', justifyContent: 'right' }}>
        <PrimaryButton
          sx={{ width: 200, fontSize: '1rem' }}
          onClick={handlePickingComplete}
        >
          ピッキング完了
        </PrimaryButton>
      </Box>
      {/* 数量に達していない商品がある場合のアラートモーダル */}
      <AlertConfirmationModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onConfirm={submitPicking}
        title={`発送準備（注文番号${orderId}）`}
        message="数量に達していない商品があります"
        confirmButtonText="ピッキング完了"
        cancelButtonText="戻る"
      />
    </ContainerLayout>
  );
}
