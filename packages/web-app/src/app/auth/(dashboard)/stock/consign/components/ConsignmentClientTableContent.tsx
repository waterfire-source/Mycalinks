import { Stack } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { ConsignmentClient } from '@/feature/consign/hooks/useConsignment';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { PaginationNav } from '@/components/pagination/PaginationNav';

interface Props {
  data: ConsignmentClient[];
  isLoading: boolean;
  onOpenSalesHistory: (client: ConsignmentClient) => void;
  onOpenProductDetail: (client: ConsignmentClient) => void;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ConsignmentClientTableContent({
  data,
  isLoading,
  onOpenSalesHistory,
  onOpenProductDetail,
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: Props) {
  // カラム定義 (View)
  const columns: ColumnDef<ConsignmentClient>[] = [
    {
      header: '委託者',
      render: (item: ConsignmentClient) => item.full_name,
      key: 'full_name',
      sx: { width: '180px' },
    },
    {
      header: '売上',
      render: (item: ConsignmentClient) =>
        `${(item.summary?.totalSalePrice ?? 0).toLocaleString()}円`,
      key: 'totalSalePrice',
    },
    {
      header: '委託数',
      render: (item: ConsignmentClient) =>
        `${item.summary?.totalSaleItemCount || 0}点`,
      key: 'totalSaleItemCount',
    },
    {
      header: '残点数',
      render: (item: ConsignmentClient) =>
        `${item.summary?.totalStockNumber || 0}点`,
      key: 'totalStockNumber',
    },
    {
      header: '手数料',
      render: (item: ConsignmentClient) =>
        `${(item.summary?.totalCommissionPrice ?? 0).toLocaleString()}円`,
      key: 'totalCommissionPrice',
    },
    {
      header: '支払サイクル',
      render: (item: ConsignmentClient) => item.payment_cycle || '-',
      key: 'payment_cycle',
      sx: { width: '200px' },
    },
    {
      header: '',
      render: (item: ConsignmentClient) => (
        <Stack direction="row" gap={1}>
          <PrimaryButton onClick={() => onOpenSalesHistory(item)}>
            販売履歴
          </PrimaryButton>
          <SecondaryButton onClick={() => onOpenProductDetail(item)}>
            商品詳細
          </SecondaryButton>
        </Stack>
      ),
      key: 'actions',
      sx: { width: '250px' },
    },
  ];

  return (
    <CustomTable
      rows={data}
      columns={columns}
      rowKey={(item: ConsignmentClient) => item.id}
      isLoading={isLoading}
      customFooter={
        <PaginationNav
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      }
    />
  );
}
