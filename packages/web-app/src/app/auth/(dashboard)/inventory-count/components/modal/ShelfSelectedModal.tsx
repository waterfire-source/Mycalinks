import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { ShelfButtons } from '@/feature/inventory-count/components/edit/ShelfButtons';
import { Inventory_Shelf } from '@prisma/client';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (shelfId: number | 'all') => void | Promise<void>;
  shelfs: Inventory_Shelf[];
  isLoading?: boolean;
}

export const ShelfSelectedModal = ({
  open,
  onClose,
  onConfirm,
  shelfs,
  isLoading,
}: Props) => {
  const [selectedShelfId, setSelectedShelfId] = useState<number | 'all'>('all');

  const handleShelfChange = (shelfId: number | 'all') => {
    setSelectedShelfId(shelfId);
  };

  const handleClose = () => {
    setSelectedShelfId('all');
    onClose();
  };

  return (
    <ConfirmationDialog
      title="棚を選択"
      open={open}
      onClose={handleClose}
      confirmButtonText="開始"
      cancelButtonText="もどる"
      onConfirm={() => onConfirm(selectedShelfId)}
      message="この端末で棚卸を行う棚を選択してください"
      isLoading={isLoading}
      content={
        <ShelfButtons
          shelfs={shelfs}
          selectedShelfId={selectedShelfId}
          onShelfChange={handleShelfChange}
          isGrid
          noneAll
        />
      }
    />
  );
};
