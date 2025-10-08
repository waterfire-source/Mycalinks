import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { Box } from '@mui/material';

interface InventoryCountInfoProps {
  totals: {
    totalAmount: number | bigint;
    totalQuantity: number;
  };
  stockTotals: {
    totalAmount: number | bigint;
    totalQuantity: number;
  };
}

interface DisplayInfo {
  quantity: string;
  quantityDiff: string;
  amount: string;
  amountDiff: string;
}

export const InventoryCountInfo = ({
  totals,
  stockTotals,
}: InventoryCountInfoProps) => {
  const data = [
    {
      quantity: `${totals.totalQuantity.toLocaleString()}点/${stockTotals.totalQuantity.toLocaleString()}点`,
      quantityDiff: `${(
        totals.totalQuantity - stockTotals.totalQuantity
      ).toLocaleString()}点`,
      amount: `${(totals?.totalAmount || 0).toLocaleString()}円/${(
        stockTotals?.totalAmount || 0
      ).toLocaleString()}円`,
      amountDiff: `${(
        BigInt(totals?.totalAmount || 0) - BigInt(stockTotals?.totalAmount || 0)
      ).toLocaleString()}円`,
    },
  ];

  const columns: ColumnDef<DisplayInfo>[] = [
    {
      header: '入力在庫数/POS上の在庫数',
      render: (row) => row.quantity,
    },
    {
      header: '在庫数差異',
      render: (row) => row.quantityDiff,
    },
    {
      header: '入力仕入れ値合計/理論仕入れ値合計',
      render: (row) => row.amount,
    },
    {
      header: '仕入れ値合計差異',
      render: (row) => row.amountDiff,
    },
  ];
  return (
    <Box
      sx={{
        display: 'flex',
        gap: '20px',
        borderTop: '8px solid',
        borderTopColor: 'primary.main',
      }}
    >
      <CustomTable<DisplayInfo>
        columns={columns}
        rows={data}
        rowKey={() => 0}
      />
    </Box>
  );
};
