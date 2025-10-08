import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  SxProps,
  Theme,
  CircularProgress,
  Box,
} from '@mui/material';

/**
 * カラム定義
 *  - header: 表示するヘッダ
 *  - render: 1行ごとの表示ロジック
 *  - key:   カラムのキー
 *  - sx?:     セルのスタイル
 */
export interface ColumnDef<DataType> {
  header: React.ReactNode;
  render: (item: DataType) => React.ReactNode;
  key?: string;
  sx?: SxProps<Theme>;
}

export interface CustomTableProps<DataType> {
  columns: ColumnDef<DataType>[];
  rows: DataType[];
  isLoading?: boolean;
  rowKey: (item: DataType) => string | number;
  onRowClick?: (item: DataType) => void;
  selectedRow?: DataType | null;
  sx?: SxProps<Theme>;
}

export function InfiniteScrollCustomTable<DataType>(
  props: CustomTableProps<DataType>,
) {
  const {
    columns,
    rows,
    isLoading = false,
    rowKey,
    onRowClick,
    selectedRow,
    sx: tableContainerSx,
  } = props;

  const tableHeaderStyle: SxProps<Theme> = {
    backgroundColor: 'white',
    py: 1,
    color: 'grey.700',
    textAlign: 'center',
  };

  return (
    <TableContainer
      sx={{ flex: 1, overflow: 'auto', height: '100%', ...tableContainerSx }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col, idx) => (
              <TableCell key={idx} sx={{ ...tableHeaderStyle, ...col.sx }}>
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={{ backgroundColor: 'white' }}>
          {rows.map((item) => {
            const keyValue = rowKey(item);
            const isSelected = selectedRow
              ? rowKey(selectedRow) === keyValue
              : false;
            return (
              <TableRow
                key={keyValue}
                sx={{
                  backgroundColor: isSelected
                    ? 'rgba(255, 0, 0, 0.1)'
                    : 'inherit',
                  cursor: onRowClick ? 'pointer' : 'inherit',
                }}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col, cIndex) => (
                  <TableCell
                    key={cIndex}
                    sx={{ textAlign: 'center', ...(col.sx || {}) }}
                  >
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          {isLoading && (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress />
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
