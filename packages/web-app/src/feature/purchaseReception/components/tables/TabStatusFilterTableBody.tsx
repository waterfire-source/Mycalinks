import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { DeletePurchaseReceptionButton } from '@/feature/purchaseReception/components/buttons/DeletePurchaseReceptionButton';
import { Typography, Box } from '@mui/material';
import dayjs from 'dayjs';

// displayStatusを追加した型を定義
type TransactionWithDisplayStatus =
  BackendTransactionAPI[5]['response']['200']['transactions'][0] & {
    displayStatus: string;
  };

interface Props {
  filteredData: TransactionWithDisplayStatus[];
  setTransaction: (transaction: TransactionWithDisplayStatus) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  refetch: () => void;
}

export const TabStatusFilterTableBody = ({
  filteredData,
  setTransaction,
  setIsModalOpen,
  refetch,
}: Props) => {
  //個数計算
  const calculateTotalItemCount = (
    transaction: BackendTransactionAPI[5]['response']['200']['transactions'][0],
  ) => {
    return transaction.transaction_customer_carts?.length
      ? transaction.transaction_customer_carts.reduce(
          (total, customerCartDetail) =>
            total + (customerCartDetail.item_count || 0),
          0,
        )
      : transaction.transaction_carts?.reduce(
          (total, cart) => total + (cart.item_count || 0),
          0,
        ) ?? 0;
  };
  //金額計算
  const calculateTotalAppraisalAmount = (
    transaction: BackendTransactionAPI[5]['response']['200']['transactions'][0],
  ) => {
    return transaction.transaction_customer_carts?.length
      ? transaction.transaction_customer_carts.reduce(
          (sum, customerCartDetail) => {
            return (
              sum +
              customerCartDetail.item_count *
                (customerCartDetail.unit_price +
                  (customerCartDetail.discount_price ?? 0))
            );
          },
          0,
        )
      : transaction.transaction_carts.reduce((sum, item) => {
          return (
            sum +
            item.item_count * (item.unit_price + (item.discount_price ?? 0))
          );
        }, 0);
  };

  const columns: ColumnDef<TransactionWithDisplayStatus>[] = [
    {
      header: '買取番号',
      key: 'reception_number',
      render: (row) => row.reception_number,
    },
    {
      header: 'ステータス',
      key: 'displayStatus',
      render: (row) => row.displayStatus,
    },
    {
      header: 'お客様',
      key: 'customer_name_ruby',
      render: (row) => row.customer_name_ruby,
    },
    {
      header: '受付時間',
      key: 'created_at',
      render: (row) => dayjs(row.created_at).format('YYYY-MM-DD HH:mm'),
    },
    {
      header: '査定商品',
      key: 'item_name',
      render: (row) => {
        return (
          <Box>
            <Typography>
              {row.transaction_customer_carts?.[0]
                ?.product__displayNameWithMeta ||
                row.transaction_carts?.[0]?.product__displayNameWithMeta ||
                ''}
            </Typography>
            {row.transaction_customer_carts?.length > 1 ||
            row.transaction_carts?.length > 1 ? (
              <Box
                sx={{
                  backgroundColor: '#f0f0f0',
                  padding: '2px 2px',
                  borderRadius: '4px',
                  marginTop: '4px',
                  display: 'inline-block',
                }}
              >
                <Typography variant="caption">
                  他{' '}
                  {(row.transaction_customer_carts?.length ||
                    row.transaction_carts?.length) - 1}
                  商品
                </Typography>
              </Box>
            ) : null}
          </Box>
        );
      },
    },
    {
      header: '査定点数',
      key: 'item_count',
      render: (row) => calculateTotalItemCount(row),
    },
    {
      header: '査定額合計',
      key: 'total_appraisal_amount',
      render: (row) => `${calculateTotalAppraisalAmount(row)}円`,
    },
    {
      header: '受付',
      key: 'reception_staff_account_name',
      render: (row) => row.reception_staff_account_name,
    },
    {
      header: '査定',
      key: 'input_staff_account_name',
      render: (row) => row.input_staff_account_name,
    },
    {
      header: '会計',
      key: 'staff_account_name',
      render: (row) => row.staff_account_name,
    },
    {
      header: 'お客様による変更',
      key: 'changed_by_customer',
      render: (row) => {
        const isChangedByCustomer = row.transaction_customer_carts?.some(
          (cart) => cart.item_count !== cart.original_item_count,
        );
        return isChangedByCustomer ? 'あり' : 'なし';
      },
    },
    {
      header: '',
      key: 'delete',
      render: (row) => (
        <DeletePurchaseReceptionButton
          transactionId={row.id}
          refetch={refetch}
        />
      ),
    },
  ];

  return (
    <CustomTable<TransactionWithDisplayStatus>
      columns={columns}
      rows={filteredData}
      rowKey={(row) => row.id}
      onRowClick={(row) => {
        setTransaction(row);
        setIsModalOpen(true);
      }}
    />
  );
};
