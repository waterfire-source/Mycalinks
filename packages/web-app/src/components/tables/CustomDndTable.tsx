import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  SxProps,
  Theme,
} from '@mui/material';
import { palette } from '@/theme/palette';
import {
  DndProvider,
  useDrag,
  useDrop,
  DragSourceMonitor,
  DropTargetMonitor,
} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'dnd-multi-backend';
import { TouchTransition, MouseTransition } from 'dnd-multi-backend';

const ROW_TYPE = 'DRAGGABLE_ROW';

/**
 * カラム定義
 */
export interface DndColumnDef<DataType> {
  header: React.ReactNode;
  render: (item: DataType) => React.ReactNode;
  key?: string;
  sx?: SxProps<Theme>;
  isHideColumn?: boolean;
}

export interface CustomDndTableProps<DataType> {
  columns: DndColumnDef<DataType>[];
  rows: DataType[];
  isLoading?: boolean;
  rowKey: (item: DataType) => string | number;
  onRowClick?: (item: DataType) => void;
  selectedRow?: DataType | null;
  selectedRowKey?: string | number | null;
  onScrollToBottom?: () => void;
  sx?: SxProps<Theme>;
  hasRedLine?: boolean;
  onRowOrderChange: (newRows: DataType[]) => void;
  withDndProvider?: boolean;
}

/**
 * ドラッガブル行コンポーネント
 */
function DraggableRow<DataType>(props: {
  item: DataType;
  index: number;
  moveRow: (from: number, to: number) => void;
  columns: DndColumnDef<DataType>[];
  rowKey: (item: DataType) => string | number;
  selectedRow?: DataType | null;
  selectedRowKey?: string | number | null;
  onRowClick?: (item: DataType) => void;
}) {
  const {
    item,
    index,
    moveRow,
    columns,
    rowKey,
    selectedRow,
    selectedRowKey,
    onRowClick,
  } = props;

  const ref = useRef<HTMLTableRowElement>(null);

  const [, drop] = useDrop<{ index: number }, void>({
    accept: ROW_TYPE,
    hover(dragged, monitor: DropTargetMonitor) {
      if (!ref.current || dragged.index === index) return;
      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverY = clientOffset.y - hoverRect.top;
      if (
        (dragged.index < index && hoverY < hoverMiddleY) ||
        (dragged.index > index && hoverY > hoverMiddleY)
      ) {
        return;
      }
      moveRow(dragged.index, index);
      dragged.index = index;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ROW_TYPE,
    item: { index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const keyValue = rowKey(item);
  const isSelected = () => {
    if (selectedRow) return rowKey(selectedRow) === keyValue;
    if (selectedRowKey) return selectedRowKey === keyValue;
    return false;
  };

  return (
    <TableRow
      key={keyValue}
      ref={ref}
      sx={{
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (
          target.closest('button') ||
          target.closest('checkbox') ||
          target.closest('input')
        ) {
          return;
        }
        if (target.closest('td')) {
          onRowClick?.(item);
        }
      }}
    >
      {columns
        .filter((col) => !col.isHideColumn)
        .map((col, cIndex) => (
          <TableCell
            key={cIndex}
            sx={{
              '&.MuiTableCell-root': {
                backgroundColor: isSelected()
                  ? 'rgba(255, 0, 0, 0.1)'
                  : 'inherit',
              },
              textAlign: 'center',
              ...(col.sx || {}),
            }}
          >
            {col.render(item)}
          </TableCell>
        ))}
    </TableRow>
  );
}

export function CustomDndTable<DataType>(props: CustomDndTableProps<DataType>) {
  const {
    columns,
    rows,
    isLoading = false,
    rowKey,
    onRowClick,
    selectedRow,
    selectedRowKey,
    onScrollToBottom,
    sx: tableContainerSx,
    hasRedLine = false,
    onRowOrderChange,
    withDndProvider = true,
  } = props;

  const [orderedRows, setOrderedRows] = useState<DataType[]>(rows);

  // ドラッグアンドドロップのマルチバックエンド設定
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

  useEffect(() => {
    setOrderedRows(rows);
  }, [rows]);

  const moveRow = useCallback(
    (from: number, to: number) => {
      setOrderedRows((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        onRowOrderChange?.(updated);
        return updated;
      });
    },
    [onRowOrderChange],
  );

  const tableHeaderStyle: SxProps<Theme> = {
    backgroundColor: 'white',
    py: 1,
    color: 'grey.700',
    textAlign: 'center',
  };

  const tableRef = useRef<HTMLDivElement>(null);
  const handleScrollToBottom = useCallback(() => {
    if (!tableRef.current || !onScrollToBottom) return;
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      onScrollToBottom();
    }
  }, [onScrollToBottom]);

  useEffect(() => {
    const el = tableRef.current;
    if (el) {
      el.addEventListener('scroll', handleScrollToBottom);
      return () => el.removeEventListener('scroll', handleScrollToBottom);
    }
  }, [handleScrollToBottom]);

  const displayRows = orderedRows;

  const TableContent = (
    <Table stickyHeader>
      <TableHead>
        <TableRow>
          {columns
            .filter((col) => !col.isHideColumn)
            .map((col, idx) => (
              <TableCell key={idx} sx={{ ...tableHeaderStyle, ...col.sx }}>
                {col.header}
              </TableCell>
            ))}
        </TableRow>
      </TableHead>
      <TableBody sx={{ backgroundColor: 'white' }}>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={columns.length}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            </TableCell>
          </TableRow>
        ) : (
          displayRows.map((item, rowIndex) => (
            <DraggableRow
              key={rowKey(item)}
              item={item}
              index={rowIndex}
              moveRow={moveRow}
              columns={columns}
              rowKey={rowKey}
              selectedRow={selectedRow}
              selectedRowKey={selectedRowKey}
              onRowClick={onRowClick}
            />
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <TableContainer
      sx={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: palette.common.white,
        borderTop: hasRedLine ? `8px solid ${palette.primary.main}` : '',
        borderRadius: hasRedLine ? '4px' : '',
        ...tableContainerSx,
      }}
      ref={tableRef}
    >
      {withDndProvider ? (
        <DndProvider backend={MultiBackend} options={DnDBackends}>
          {TableContent}
        </DndProvider>
      ) : (
        TableContent
      )}
    </TableContainer>
  );
}
