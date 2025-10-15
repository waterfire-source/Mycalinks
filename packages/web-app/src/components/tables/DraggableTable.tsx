import { palette } from '@/theme/palette';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  CircularProgress,
} from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'dnd-multi-backend';
import { TouchTransition, MouseTransition } from 'dnd-multi-backend';

import React, { useCallback, useEffect, useState } from 'react';
import { DraggableTableRow } from '@/components/tables/DraggableTableRow';

export type ColumnDef<T> = {
  header: React.ReactNode;
  render: (item: T) => React.ReactNode;
  key?: string;
};
interface RowData {
  order_number: number | null;
}

export type DraggableTableProps<T extends RowData> = {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey: (item: T) => string | number;
  hasRedLine?: boolean;
  isLoading?: boolean;
  onReorder?: (newRows: T[]) => void;
};

/**
 * ドラッグアンドドロップで行を移動できるテーブルコンポーネント
 */
export function DraggableTable<T extends RowData>({
  columns,
  rows,
  rowKey,
  hasRedLine = false,
  isLoading = false,
  onReorder, // 行を移動した後のコールバック関数
}: DraggableTableProps<T>) {
  // ドラッグアンドドロップのバックエンドを設定
  const DnDBackends = {
    backends: [
      {
        backend: HTML5Backend,
        transition: MouseTransition,
      },
      {
        backend: TouchBackend,
        options: { enableMouseEvents: true },
        transition: TouchTransition,
      },
    ],
  };

  // 現在の行データを管理するステート
  const [currentRows, setCurrentRows] = useState(rows);

  // 行追加ボタンが押されときにもステートを更新
  useEffect(() => {
    const sortedRows = [...rows].sort((a, b) => {
      if (a.order_number === null) return 1;
      if (b.order_number === null) return -1;
      return a.order_number - b.order_number;
    });
    setCurrentRows(sortedRows);
  }, [rows]);

  /**
   * 行を移動する関数
   * @param fromIndex 移動元のインデックス
   * @param toIndex 移動先のインデックス
   */
  const moveRow = useCallback(
    (fromIndex: number, toIndex: number) => {
      const updated = [...currentRows];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      const reordered = updated.map((row, idx) => ({
        ...row,
        order_number: idx,
      }));
      setCurrentRows(reordered);
      onReorder?.(reordered);
    },
    [currentRows, onReorder],
  );

  return (
    <DndProvider backend={MultiBackend} options={DnDBackends}>
      <TableContainer
        sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: palette.common.white,
          borderTop: hasRedLine ? `8px solid ${palette.primary.main}` : '',
          borderRadius: hasRedLine ? '4px' : '',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell key={idx}>{col.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ backgroundColor: 'white' }}>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', py: 2 }}
                  >
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              currentRows.map((item, index) => (
                <DraggableTableRow
                  key={rowKey(item)}
                  item={item}
                  index={index}
                  moveRow={moveRow}
                  columns={columns}
                  rowKey={rowKey(item)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </DndProvider>
  );
}
