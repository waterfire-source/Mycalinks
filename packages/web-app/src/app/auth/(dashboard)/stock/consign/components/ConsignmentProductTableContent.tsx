import { Stack, TextField, Checkbox } from '@mui/material';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ConsignmentProduct } from '@/feature/consign/hooks/useConsignment';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { PaginationNav } from '@/components/pagination/PaginationNav';

type PrintCount = {
  id: number;
  count: number;
};

interface Props {
  data: ConsignmentProduct[];
  isLoading: boolean;
  selectedProducts: ConsignmentProduct[];
  printCounts: PrintCount[];
  onProductSelect: (product: ConsignmentProduct, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onCountChange: (id: number, value: string) => void;
  onSingleProductLabelPrint: (product: ConsignmentProduct) => Promise<void>;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ConsignmentProductTableContent({
  data,
  isLoading,
  selectedProducts,
  printCounts,
  onProductSelect,
  onSelectAll,
  onCountChange,
  onSingleProductLabelPrint,
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const columns: ColumnDef<ConsignmentProduct>[] = [
    {
      header: (
        <Checkbox
          checked={data.length > 0 && selectedProducts.length === data.length}
          sx={{
            '& .MuiSvgIcon-root': { color: 'primary.main' },
          }}
          indeterminate={
            selectedProducts.length > 0 && selectedProducts.length < data.length
          }
          onChange={(e) => onSelectAll(e.target.checked)}
        />
      ),
      render: (product: ConsignmentProduct) => (
        <Checkbox
          checked={selectedProducts.includes(product)}
          onChange={(e) => onProductSelect(product, e.target.checked)}
          sx={{
            '& .MuiSvgIcon-root': { color: 'primary.main' },
          }}
        />
      ),
      key: 'select',
      sx: { width: '60px' },
    },
    {
      header: '商品画像',
      render: (product: ConsignmentProduct) => (
        <ItemImage imageUrl={product.image_url || null} fill />
      ),
      key: 'image',
      sx: { width: '100px' },
    },
    {
      header: '商品名',
      render: (product: ConsignmentProduct) => (
        <ItemText
          text={product.displayNameWithMeta || product.display_name}
          wrap
        />
      ),
      key: 'display_name',
      sx: { minWidth: '180px' },
    },
    {
      header: '販売価格',
      render: (product: ConsignmentProduct) =>
        `${(product.specific_sell_price ?? 0).toLocaleString()}円`,
      key: 'specific_sell_price',
    },
    {
      header: '在庫数',
      render: (product: ConsignmentProduct) => `${product.stock_number || 0}点`,
      key: 'stock_number',
    },
    {
      header: '委託主',
      render: (product: ConsignmentProduct) =>
        product.consignment_client?.full_name || '-',
      key: 'consignment_client.full_name',
    },
    {
      header: 'ラベル印刷',
      render: (product: ConsignmentProduct) => (
        <Stack direction="row" gap={1}>
          <TextField
            sx={{
              flex: 1,
              minWidth: '40px',
            }}
            size="small"
            type="number"
            placeholder="枚数"
            onClick={(e) => e.stopPropagation()}
            value={printCounts.find((p) => p.id === product.id)?.count ?? ''}
            onChange={(e) => onCountChange(product.id, e.target.value)}
          />
          <PrimaryButton
            size="small"
            onClick={async (e) => {
              e.stopPropagation();
              await onSingleProductLabelPrint(product);
            }}
            sx={{ minWidth: '60px' }}
          >
            印刷
          </PrimaryButton>
        </Stack>
      ),
      key: 'print',
      sx: { width: '180px' },
    },
  ];

  return (
    <CustomTable
      rows={data}
      columns={columns}
      rowKey={(item: ConsignmentProduct) => item.id}
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
