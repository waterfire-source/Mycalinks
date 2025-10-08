import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { SxProps } from '@mui/system';

interface InfiniteScrollTableProps<T> {
  columns: GridColDef[];
  items: T[];
  loadMoreItems: () => void;
  hasMore: boolean;
  isLoading: boolean;
  maxHeight?: string;
  rowHeight?: number;
  headerCellSx?: SxProps;
}

export const InfiniteScrollTable = <T extends Record<string, any>>({
  columns,
  items,
  loadMoreItems,
  hasMore,
  isLoading,
  maxHeight,
  rowHeight = 80,
  headerCellSx,
}: InfiniteScrollTableProps<T>) => {
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      hasMore &&
      !isLoading
    ) {
      loadMoreItems();
    }
  };
  return (
    <TableContainer
      component={Paper}
      onScroll={handleScroll}
      sx={{
        height: '100%',
        maxHeight: maxHeight,
        overflow: 'auto',
        boxShadow: 3,
        borderRadius: '4px',
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.field}
                align={column.headerAlign || 'left'} // ヘッダーの位置を反映
                sx={{
                  backgroundColor: 'common.white',
                  color: 'grey.700',
                  textAlign: column.headerAlign || 'left', // ヘッダーの位置を適用
                  borderTop: '5px solid', // 上部ボーダー
                  borderTopColor: 'primary.main',
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                  flex: column.flex || undefined, // `flex`も考慮
                  ...headerCellSx,
                }}
              >
                {column.headerName || column.field}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length > 0 ? (
            items.map((item, idx) => (
              <TableRow
                key={idx}
                sx={{
                  backgroundColor: idx % 2 === 0 ? 'common.white' : 'grey.100',
                  height: rowHeight,
                }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    align={column.align || 'left'} // セルの位置を反映
                    sx={{
                      textAlign: column.align || 'left', // セルの位置を適用
                    }}
                  >
                    {column.renderCell
                      ? column.renderCell({
                          row: item,
                          field: column.field,
                          value: item[column.field],
                          api: {} as any,
                          id: idx,
                          rowNode: {} as any,
                          colDef: column,
                          cellMode: 'view',
                          hasFocus: false,
                          tabIndex: -1,
                        } as GridRenderCellParams)
                      : item[column.field as keyof T] ?? ''}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : !isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography variant="body2">データがありません</Typography>
              </TableCell>
            </TableRow>
          ) : null}
          {isLoading && (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
