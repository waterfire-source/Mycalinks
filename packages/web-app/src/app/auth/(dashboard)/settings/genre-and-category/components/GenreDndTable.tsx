import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  TableRow,
  TableCell,
  CircularProgress,
  TextField,
  Switch,
  IconButton,
  SxProps,
  Theme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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

// カラム定義
export interface DndColumnDef<Genre> {
  header: React.ReactNode;
  render?: (item: Genre) => React.ReactNode;
  key?: string;
  sx?: SxProps<Theme>;
  isHideColumn?: boolean;
}

// props型
export interface GenreDndTableProps<Genre extends GenreBase> {
  genres: Genre[];
  isLoading?: boolean;
  onRowOrderChange: (newGenres: Genre[]) => Promise<void>;
  onNameChange: (id: number, value: string) => void;
  onSave: (id: number) => void;
  onToggleDisplay: (id: number) => void;
  onDelete: (id: number) => void;
}

// Genre型ベース
export interface GenreBase {
  id: number;
  displayNameInput: string;
  isUpdating?: boolean;
  handle?: string | null;
  hidden: boolean;
}

// ドラッグ可能行
function DraggableRow<Genre extends GenreBase>(props: {
  item: Genre;
  index: number;
  moveRow: (from: number, to: number) => void;
  rowKey: (item: Genre) => string | number;
  onNameChange: (id: number, value: string) => void;
  onSave: (id: number) => void;
  onToggleDisplay: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const {
    item,
    index,
    moveRow,
    rowKey,
    onNameChange,
    onSave,
    onToggleDisplay,
    onDelete,
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
  const [name, setName] = useState(item.displayNameInput);

  return (
    <TableRow
      key={rowKey(item)}
      ref={ref}
      sx={{
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <TableCell sx={{ width: '45%', paddingLeft: '4%' }}>
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onNameChange(item.id, name);
              }
            }}
            onBlur={() => onSave(item.id)}
            disabled={item.isUpdating}
            placeholder="表示名を入力"
            sx={{ '& .MuiInputBase-input': { textOverflow: 'ellipsis' } }}
          />
          {item.isUpdating && (
            <CircularProgress
              size={20}
              sx={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                marginTop: '-10px',
              }}
            />
          )}
        </Box>
      </TableCell>
      <TableCell sx={{ width: '8%' }}>{item.handle || ''}</TableCell>
      <TableCell sx={{ width: '4%', textAlign: 'center' }}>
        <Switch
          checked={!item.hidden}
          onChange={() => onToggleDisplay(item.id)}
          disabled={item.isUpdating}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#b82a2a',
              '&:hover': { backgroundColor: 'rgba(184, 42, 42, 0.08)' },
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#b82a2a',
            },
          }}
        />
      </TableCell>
      <TableCell sx={{ width: '4%', textAlign: 'center', paddingRight: '4%' }}>
        <IconButton
          onClick={() => onDelete(item.id)}
          disabled={item.isUpdating}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

// テーブル本体
export function GenreDndTable<Genre extends GenreBase>({
  genres,
  isLoading = false,
  onRowOrderChange,
  onNameChange,
  onSave,
  onToggleDisplay,
  onDelete,
}: GenreDndTableProps<Genre>) {
  const [orderedRows, setOrderedRows] = useState<Genre[]>(genres);

  const DnDBackends = {
    backends: [
      { backend: HTML5Backend, transition: MouseTransition },
      {
        backend: TouchBackend,
        options: { enableMouseEvents: true },
        transition: TouchTransition,
      },
    ],
  };

  useEffect(() => {
    setOrderedRows(genres);
  }, [genres]);

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

  return (
    <DndProvider backend={MultiBackend} options={DnDBackends}>
      {isLoading ? (
        <TableRow>
          <TableCell colSpan={4}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          </TableCell>
        </TableRow>
      ) : (
        orderedRows.map((item, index) => (
          <DraggableRow<Genre>
            key={item.id}
            item={item}
            index={index}
            moveRow={moveRow}
            rowKey={(row) => row.id}
            onNameChange={onNameChange}
            onSave={onSave}
            onToggleDisplay={onToggleDisplay}
            onDelete={onDelete}
          />
        ))
      )}
    </DndProvider>
  );
}
