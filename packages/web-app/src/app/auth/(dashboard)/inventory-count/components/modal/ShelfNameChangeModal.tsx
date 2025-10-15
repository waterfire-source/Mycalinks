import { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import { InventoryAPIRes } from '@/api/frontend/inventory/api';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { Delete } from '@mui/icons-material';
import { TextField, IconButton } from '@mui/material';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { ColumnDef, DraggableTable } from '@/components/tables/DraggableTable';

// モーダルのプロップスインターフェース
interface ShelfNameChangeModalProps {
  open: boolean;
  onClose: () => void;
  currentShelfs: InventoryAPIRes['getShelfs']['shelfs'];
  onSave: (shelfs: InventoryAPIRes['getShelfs']['shelfs']) => void;
}

export const ShelfNameChangeModal = ({
  open,
  onClose,
  currentShelfs,
  onSave,
}: ShelfNameChangeModalProps) => {
  const [shelfs, setShelfs] = useState<InventoryAPIRes['getShelfs']['shelfs']>(
    [],
  );
  type EditedShelfName = { id: number; shelfName: string };
  const [editedShelfNames, setEditedShelfNames] = useState<EditedShelfName[]>(
    [],
  ); // 棚名を保持
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // モーダルが開かれたときに棚のリストを初期化
  useEffect(() => {
    if (!open) return;
    setShelfs(currentShelfs);
    setEditedShelfNames(
      currentShelfs.map((shelf) => ({
        id: shelf.id,
        shelfName: shelf.display_name,
      })),
    );
  }, [open, currentShelfs]);

  // 指定されたインデックスの棚の名前を変更する関数
  const handleChangeShelfName = useCallback((id: number, newName: string) => {
    setEditedShelfNames((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, shelfName: newName } : entry,
      ),
    );
  }, []);

  // 名前を確定して棚情報を更新する
  const handleBlurShelfName = useCallback(() => {
    setShelfs((prevShelfs) =>
      prevShelfs.map((shelf) => {
        const edited = editedShelfNames.find((e) => e.id === shelf.id);
        return edited ? { ...shelf, display_name: edited.shelfName } : shelf;
      }),
    );
  }, [editedShelfNames]);

  // 新しい棚を追加する関数
  const handleAddShelf = useCallback(() => {
    const newId = Math.max(...shelfs.map((shelf) => shelf.id), 0) + 1;
    setShelfs((prevShelfs) => [
      ...prevShelfs,
      {
        id: newId,
        display_name: '',
        store_id: 0,
        is_deleted: false,
        created_at: dayjs().toDate(),
        updated_at: dayjs().toDate(),
        order_number: prevShelfs.length + 1,
      },
    ]);
    setEditedShelfNames((prev) => [...prev, { id: newId, shelfName: '' }]);
  }, [shelfs]);

  const handleDeleteShelf = useCallback((id: number) => {
    setShelfs((prevShelfs) => prevShelfs.filter((shelf) => shelf.id !== id));
    setEditedShelfNames((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // 変更を保存する関数
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    await onSave(shelfs);
    onClose();
    setIsLoading(false);
  }, [shelfs, onSave, onClose]);

  const columns: ColumnDef<InventoryAPIRes['getShelfs']['shelfs'][number]>[] = [
    {
      header: 'ID',
      key: 'id',
      render: (row) => row.id,
    },
    {
      header: '棚名',
      key: 'display_name',
      render: (row) => (
        <TextField
          fullWidth
          value={
            editedShelfNames.find((e) => e.id === row.id)?.shelfName ??
            row.display_name
          }
          onChange={(e) => handleChangeShelfName(row.id, e.target.value)}
          onBlur={() => handleBlurShelfName()}
        />
      ),
    },
    {
      header: '削除',
      key: 'delete',
      render: (row) => (
        <IconButton onClick={() => handleDeleteShelf(row.id)}>
          <Delete />
        </IconButton>
      ),
    },
  ];

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      width="90%"
      height="85%"
      title="棚変更・追加"
      onCancelClick={onClose}
      cancelButtonText="キャンセル"
      onActionButtonClick={handleSave}
      actionButtonText="棚変更を保存"
      isAble={!isLoading && !shelfs.some((shelf) => shelf.display_name === '')}
    >
      <DraggableTable<InventoryAPIRes['getShelfs']['shelfs'][number]>
        columns={columns}
        rows={shelfs}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        hasRedLine
        onReorder={(newRows) => {
          setShelfs(newRows);
        }}
      />

      <SecondaryButtonWithIcon
        variant="contained"
        sx={{
          mt: 2,
          width: '400px',
          height: '40px',
          maxWidth: '100%',
          mx: 'auto',
        }}
        onClick={handleAddShelf}
        disabled={editedShelfNames.some((entry) => entry.shelfName === '')}
      >
        棚を追加する
      </SecondaryButtonWithIcon>
    </CustomModalWithIcon>
  );
};
