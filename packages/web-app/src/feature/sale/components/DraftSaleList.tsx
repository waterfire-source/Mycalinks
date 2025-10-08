import React, { useEffect, useMemo, useState } from 'react';
import { Grid, Box } from '@mui/material';
import {
  GetTransactionResponse,
  useSellTransactions,
} from '@/feature/transaction/hooks/useSellTransactions';
import { useStore } from '@/contexts/StoreContext';
import { DraftSaleDetail } from '@/feature/sale/components/DraftSaleDetail';
import { DraftSaleSearch } from '@/feature/sale/components/DraftSaleSearch';
import DataTable from '@/components/tables/DataTable';
import { GridColDef } from '@mui/x-data-grid';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import theme from '@/theme';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';

interface DraftSaleListProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isIpadSize: boolean;
}

export const DraftSaleList = ({
  setIsOpen,
  isIpadSize,
}: DraftSaleListProps) => {
  const { store } = useStore();
  const {
    transactions,
    fetchDraftSellTransactions,
    cancelDraftSellTransaction,
  } = useSellTransactions();
  const [selectTransaction, setSelectTransaction] = useState<
    GetTransactionResponse['transactions'][number] | null
  >(null);
  const [searchParams, setSearchParams] = useState<{
    productName?: string;
    customerName?: string;
    description?: string;
  }>({});

  useEffect(() => {
    fetchDraftSellTransactions({
      storeId: store.id,
      customerName: searchParams.customerName,
      description: searchParams.description,
      productName: searchParams.productName,
    });
  }, [store.id, searchParams, fetchDraftSellTransactions]);

  const handleClick = (
    transaction: GetTransactionResponse['transactions'][number],
  ) => {
    setSelectTransaction(transaction);
    setIsOpen(true); // テーブル行がクリックされたときにモーダルを開くためにsetIsOpenを呼び出し
  };

  // 削除ボタンの処理
  const handleDelete = async (id: number) => {
    await cancelDraftSellTransaction({
      store_id: store.id,
      transaction_id: id,
    });
    setSelectTransaction(null);
  };

  // 検索処理
  const handleSearch = (params: {
    productName?: string;
    customerName?: string;
    memo?: string;
  }) => {
    setSearchParams(params);
  };

  const columns: GridColDef[] = useMemo(() => {
    // 共通のカラム設定
    const commonProps: Partial<GridColDef> = {
      headerAlign: 'center',
      align: 'center',
      disableColumnMenu: true,
    };

    // PC用のカラム定義
    const pcColumns: GridColDef[] = [
      {
        ...commonProps,
        field: 'id',
        headerName: '取引ID',
        minWidth: 100,
        flex: 2,
      },
      {
        ...commonProps,
        field: 'reception_number',
        headerName: '受付番号',
        minWidth: 100,
        flex: 2,
      },
      {
        ...commonProps,
        field: 'date',
        headerName: '最終入力時間',
        minWidth: 150,
        flex: 3,
        renderCell: (params) =>
          new Date(params.row.created_at).toLocaleString(),
      },
      {
        ...commonProps,
        field: 'count',
        headerName: '商品点数（商品数）',
        minWidth: 160,
        flex: 3,
        renderCell: (params) =>
          params.row.transaction_carts
            ? `${params.row.transaction_carts.reduce(
                (
                  total: number,
                  cart: BackendTransactionAPI[5]['response']['200']['transactions'][0]['transaction_carts'][0],
                ) => total + (cart.item_count || 0),
                0,
              )}点(${params.row.transaction_carts.length}商品)`
            : '0 点(0商品)',
      },
      {
        ...commonProps,
        field: 'total_price',
        headerName: '合計金額',
        minWidth: 100,
        flex: 2,
        renderCell: (params) =>
          params.row.total_price
            ? `${params.row.total_price.toLocaleString()}円`
            : '0円',
      },
      {
        ...commonProps,
        field: 'reception_staff_account_name',
        headerName: '担当者',
        minWidth: 100,
        flex: 2,
        renderCell: (params) =>
          params.row.reception_staff_account_name || 'タブレットから入力',
      },
      {
        ...commonProps,
        field: 'action',
        headerName: '',
        minWidth: 50,
        flex: 0.5,
        renderCell: () => <ChevronRightIcon />,
      },
    ];
    // iPad用のカラム定義
    const ipadColumns: GridColDef[] = [
      {
        ...commonProps,
        field: 'id',
        headerName: '取引ID',
        minWidth: 80,
        flex: 1.5,
      },
      {
        ...commonProps,
        field: 'reception_number',
        headerName: '受付番号',
        minWidth: 80,
        flex: 1.5,
      },
      {
        ...commonProps,
        field: 'date',
        headerName: '最終入力時間',
        minWidth: 140,
        flex: 2.5,
        renderCell: (params) =>
          new Date(params.row.created_at).toLocaleString(),
      },
      {
        ...commonProps,
        field: 'count',
        headerName: '点数', // ヘッダー名を短縮
        minWidth: 90, // 大幅に縮小
        flex: 2,
        renderCell: (params) =>
          params.row.transaction_carts
            ? `${params.row.transaction_carts.reduce(
                (total: number, cart: any) => total + (cart.item_count || 0),
                0,
              )}点(${params.row.transaction_carts.length})` // "商品"を削除して短縮
            : '0点(0)',
      },
      {
        ...commonProps,
        field: 'total_price',
        headerName: '合計金額',
        minWidth: 90,
        flex: 2,
        renderCell: (params) =>
          params.row.total_price
            ? `${params.row.total_price.toLocaleString()}円`
            : '0円',
      },
      {
        ...commonProps,
        field: 'reception_staff_account_name',
        headerName: '担当者',
        minWidth: 80,
        flex: 1.5,
        renderCell: (params) =>
          params.row.reception_staff_account_name || 'タブレット', // 短縮
      },
      {
        ...commonProps,
        field: 'action',
        headerName: '',
        minWidth: 40,
        flex: 0.5,
        renderCell: () => <ChevronRightIcon />,
      },
    ];

    return isIpadSize ? ipadColumns : pcColumns;
  }, [isIpadSize]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 検索エリア */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <DraftSaleSearch onSearch={handleSearch} />
      </Box>

      {/* テーブルと詳細エリア */}
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Grid item xs={7} sx={{ height: '100%' }}>
          <Box
            sx={{
              borderTop: `8px solid ${theme.palette.primary.main}`,
              bgcolor: 'white',
              height: '100%',
              width: '100%',
            }}
          >
            <DataTable
              columns={columns}
              rows={transactions || []}
              onRowClick={(params) => handleClick(params.row as any)}
              sx={{ height: '100%', width: '100%' }}
            />
          </Box>
        </Grid>

        <Grid item xs={5} sx={{ height: '100%' }}>
          <DraftSaleDetail
            transactionID={selectTransaction ? selectTransaction.id : null}
            customerID={
              selectTransaction ? selectTransaction.customer_id : null
            }
            setIsOpen={setIsOpen} // DraftSaleDetail に setIsOpen を渡す
            handleDelete={handleDelete}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
