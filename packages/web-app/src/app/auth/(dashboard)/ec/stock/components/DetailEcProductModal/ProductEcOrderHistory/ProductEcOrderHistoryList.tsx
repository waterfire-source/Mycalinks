import { Box } from '@mui/material';
import { ProductEcOrderHistorySearchState } from '@/feature/products/hooks/useGetProductEcOrderHistory';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';

interface Props {
  productEcOrderHistoryInfo: ProductEcOrderHistorySearchState;
  setSearchState: React.Dispatch<
    React.SetStateAction<ProductEcOrderHistorySearchState>
  >;
}

interface TableRowData {
  orderDate: string;
  price: number;
  stockNumber: number;
  platform?: string;
}

export const ProductEcOrderHistoryList = ({
  productEcOrderHistoryInfo,
  setSearchState,
}: Props) => {
  const rows: TableRowData[] = useMemo(
    () =>
      productEcOrderHistoryInfo.searchResults.map((element) => ({
        orderDate: dayjs(element.order_store.order.ordered_at).format(
          'YYYY/MM/DD',
        ),
        price: element.total_unit_price,
        stockNumber: element.item_count,
        platform: '', // platformデータがないので空で仮対応（必要なら追加して）
      })),
    [productEcOrderHistoryInfo.searchResults],
  );

  const columns: ColumnDef<TableRowData>[] = [
    {
      header: '受注日時',
      render: (item) => item.orderDate,
    },
    {
      header: '販売価格',
      render: (item) =>
        item.price != null ? `${item.price.toLocaleString()}円` : '',
    },
    {
      header: '販売数',
      render: (item) => item.stockNumber.toString(),
    },
    {
      header: 'プラットフォーム',
      render: (item) => item.platform ?? '',
    },
  ];

  //ページネーションの処理
  const handleScrollToBottom = () => {
    setSearchState((prev) => ({
      ...prev,
      currentPage: prev.currentPage + 1,
    }));
  };

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <CustomTable<TableRowData>
        columns={columns}
        rows={rows}
        rowKey={(row) => `${row.orderDate}-${row.price}-${row.stockNumber}`}
        onScrollToBottom={handleScrollToBottom}
        isLoading={productEcOrderHistoryInfo.isLoading}
      />
    </Box>
  );
};
