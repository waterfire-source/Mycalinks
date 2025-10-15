import { Grid, Box } from '@mui/material';
import { useTransactions } from '@/feature/transaction/hooks/useTransactions';
import { useStore } from '@/contexts/StoreContext';
import { useEffect, useMemo, useState } from 'react';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import DataTable from '@/components/tables/DataTable';
import { GridColDef } from '@mui/x-data-grid';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { DraftPurchaseDetail } from '@/feature/purchase/components/DraftPurchaseDetail';
import theme from '@/theme';
import { useErrorAlert } from '@/hooks/useErrorAlert';

type Props = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isIpadSize: boolean;
};

const DraftPurchaseList = ({ setIsOpen, isIpadSize }: Props) => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();
  const {
    transactions,
    fetchDraftPurchaseTransactions,
    cancelDraftPurchaseTransaction,
  } = useTransactions();
  // const router = useRouter();
  const [selectTransaction, setSelectTransaction] = useState<
    BackendTransactionAPI[5]['response']['200']['transactions'][0] | null
  >(null);

  useEffect(() => {
    fetchDraftPurchaseTransactions(store.id);
  }, [fetchDraftPurchaseTransactions, store.id]);

  // 削除ボタンの処理
  const handleDelete = async (id: number) => {
    try {
      await cancelDraftPurchaseTransaction({
        store_id: store.id,
        transaction_id: id,
      });
      setSelectTransaction(null);
    } catch (error) {
      handleError(error);
    }
  };

  const handleClick = (
    transaction: BackendTransactionAPI[5]['response']['200']['transactions'][0],
  ) => {
    setSelectTransaction(transaction);
    setIsOpen(true); // テーブル行がクリックされたときにモーダルを開くためにsetIsOpenを呼び出し
  };

  const columns: GridColDef[] = useMemo(
    () => {
      // 全てのカラムに適用する共通設定
      const commonProps: Partial<GridColDef> = {
        headerAlign: 'center',
        align: 'center',
        disableColumnMenu: true,
      };

      // PC向けの広々としたレイアウト定義
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
          flex: 2,
          renderCell: (params) =>
            params.row.transaction_carts
              ? `${params.row.transaction_carts.reduce(
                  (total: number, cart: any) => total + (cart.item_count || 0),
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
          field: 'staff_account_name',
          headerName: '担当者',
          minWidth: 100,
          flex: 2,
        },
        {
          ...commonProps,
          field: 'action',
          headerName: '',
          minWidth: 50, // アイコンのクリックエリアを考慮
          flex: 0.5,
          renderCell: () => <ChevronRightIcon />,
        },
      ];

      // iPad向けのコンパクトなレイアウト定義
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
          minWidth: 90,
          flex: 1.5,
          renderCell: (params) =>
            params.row.transaction_carts
              ? `${params.row.transaction_carts.reduce(
                  (total: number, cart: any) => total + (cart.item_count || 0),
                  0,
                )}点` // さらに短縮
              : '0点',
        },
        {
          ...commonProps,
          field: 'total_price',
          headerName: '合計', // ヘッダー名を短縮
          minWidth: 90,
          flex: 2,
          renderCell: (params) =>
            params.row.total_price
              ? `${params.row.total_price.toLocaleString()}円`
              : '0円',
        },
        {
          ...commonProps,
          field: 'staff_account_name',
          headerName: '担当者',
          minWidth: 80,
          flex: 1.5,
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

      // 画面サイズに応じて適切な定義を返す
      return isIpadSize ? ipadColumns : pcColumns;
    },
    [isIpadSize], // isIpadSizeが変更された時だけ再計算
  );

  return (
    <Grid container spacing={2} sx={{ height: '100%' }}>
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
        <DraftPurchaseDetail
          transactionID={selectTransaction ? selectTransaction.id : null}
          customerID={selectTransaction ? selectTransaction.customer_id : null}
          setIsOpen={setIsOpen} // DraftSaleDetail に setIsOpen を渡す
          handleDelete={handleDelete}
        />
      </Grid>
    </Grid>
  );
};

export default DraftPurchaseList;
