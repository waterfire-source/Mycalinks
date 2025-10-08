import { CustomTable, CustomTableProps } from '@/components/tables/CustomTable';
import { Typography } from '@mui/material';

export const InquiryTabTable = <DataType,>({
  columns,
  rows,
  isLoading = false,
  rowKey,
  onRowClick,
  selectedRow,
  onScrollToBottom,
  sx: tableContainerSx,
  hasRedLine = false,
}: CustomTableProps<DataType>) => {
  return rows.length > 0 || isLoading ? (
    <CustomTable<DataType>
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      rowKey={rowKey}
      onRowClick={onRowClick}
      selectedRow={selectedRow}
      onScrollToBottom={onScrollToBottom}
      sx={tableContainerSx}
      hasRedLine={hasRedLine}
    />
  ) : (
    <Typography
      variant="body1"
      sx={{ textAlign: 'center', padding: 2, color: 'text.primary' }}
    >
      お問い合わせはありません
    </Typography>
  );
};
