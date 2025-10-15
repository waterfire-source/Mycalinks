import { CustomTabTable, ColumnDef } from '@/components/tabs/CustomTabTable';
import { EcSalesStat } from '@/feature/ec/hooks/useListSalesStats';
import { Typography } from '@mui/material';
import { customDayjs } from 'common';

type Props = {
  ecSalesStats: EcSalesStat[];
  loading: boolean;
  totalCount: number;
  currentPage: number;
  rowPerPage: number;
  onTabChange: (value: string) => void;
  onRowPerPageChange: (newRowPerPage: number) => void;
  onPrevPagination: () => void;
  onNextPagination: () => void;
  onSortChange: (
    field: string,
  ) => (direction: 'asc' | 'desc' | undefined) => void;
  onRowClick?: (item: EcSalesStat) => void;
  isTaxIncluded?: boolean;
};

export const EcSalesStatsTableContent = ({
  ecSalesStats,
  loading,
  totalCount,
  currentPage,
  rowPerPage,
  onTabChange,
  onRowPerPageChange,
  onPrevPagination,
  onNextPagination,
  onSortChange,
  onRowClick,
  isTaxIncluded = true,
}: Props) => {
  const formatPrice = (price: number) => {
    const displayPrice = isTaxIncluded ? price : Math.round(price / 1.1);
    return `¥${displayPrice.toLocaleString()}`;
  };

  const columns: ColumnDef<EcSalesStat>[] = [
    {
      key: 'start_day', // 実在するフィールドを指定
      header: '日付',
      render: (item) => {
        const startString = customDayjs(item.start_day)
          .tz()
          .format('YYYY/MM/DD');
        const endString = customDayjs(item.end_day).tz().format('YYYY/MM/DD');

        return startString === endString ? (
          <Typography>{startString}</Typography>
        ) : (
          <Typography>
            {startString} - <br />
            {endString}
          </Typography>
        );
      },
    },
    {
      key: 'total_sales',
      header: '総売上',
      render: (item) => formatPrice(item.total_sales),
      isSortable: true,
      onSortChange: onSortChange('total_sales'),
    },
    {
      key: 'product_sales',
      header: '商品売上',
      render: (item) => formatPrice(item.product_sales),
      isSortable: true,
      onSortChange: onSortChange('product_sales'),
    },
    {
      key: 'shipping_fee_total',
      header: '送料合計',
      render: (item) => formatPrice(item.shipping_fee_total),
      isSortable: true,
      onSortChange: onSortChange('shipping_fee_total'),
    },
    {
      key: 'confirmed_order_count',
      header: '確定注文数',
      render: (item) => `${item.confirmed_order_count}件`,
      isSortable: true,
      onSortChange: onSortChange('confirmed_order_count'),
    },
  ];

  const tabs = [
    { label: '日別', value: 'day' },
    { label: '週別', value: 'week' },
    { label: '月別', value: 'month' },
  ];

  return (
    <CustomTabTable
      data={ecSalesStats}
      tabs={tabs}
      isSingleSortMode
      columns={columns}
      rowKey={(item) => `${item.start_day.getTime()}-${item.end_day.getTime()}`}
      onTabChange={onTabChange}
      isLoading={loading}
      isShowFooterArea={true}
      currentPage={currentPage}
      rowPerPage={rowPerPage}
      totalRow={totalCount}
      handleRowPerPageChange={onRowPerPageChange}
      handlePrevPagination={onPrevPagination}
      handleNextPagination={onNextPagination}
      onRowClick={onRowClick}
      tabTableWrapperSx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      tableContainerSx={{
        flex: '1 1 0',
        overflow: 'auto',
        minHeight: 0,
      }}
    />
  );
};
