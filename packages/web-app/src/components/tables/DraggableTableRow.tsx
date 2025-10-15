import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { TableRow, TableCell } from '@mui/material';

type DragItem<T> = {
  index: number;
  item: T;
  type: string;
};

type DraggableTableRowProps<T> = {
  item: T;
  index: number;
  moveRow: (from: number, to: number) => void;
  columns: {
    render: (item: T) => React.ReactNode;
    key?: string;
  }[];
  rowKey: string | number;
};

/**
 * ドラッグアンドドロップで移動できるテーブル行コンポーネント
 */
export function DraggableTableRow<T>({
  item,
  index,
  moveRow,
  columns,
  rowKey,
}: DraggableTableRowProps<T>) {
  const ref = React.useRef<HTMLTableRowElement>(null);

  const [, drop] = useDrop<DragItem<T>>({
    accept: 'row',
    hover(dragged) {
      if (dragged.index !== index) {
        moveRow(dragged.index, index);
        dragged.index = index;
      }
    },
  });

  const [, drag] = useDrag({
    type: 'row',
    item: { index, item, type: 'row' },
  });

  drag(drop(ref));

  return (
    <TableRow ref={ref} key={rowKey}>
      {columns.map((col, i) => (
        <TableCell key={i} sx={{ textAlign: 'center' }}>
          {col.render(item)}
        </TableCell>
      ))}
    </TableRow>
  );
}
