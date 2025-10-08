import { DeleteButton } from '@/components/buttons/DeleteButton';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { MycaPosApiClient } from 'api-generator/client';
import { useState } from 'react';
import { PurchaseTableResponse } from '@/feature/purchaseTable/hooks/usePurchaseTable';
import { Box } from '@mui/material';

interface Props {
  purchaseTableId: number;
  fetchPurchaseTable: (
    take?: number,
    skip?: number,
  ) => Promise<PurchaseTableResponse | undefined>;
}
export const DeletePurchaseTableButton = ({
  purchaseTableId,
  fetchPurchaseTable,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { store } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const { setAlertState } = useAlert();
  const client = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await client.purchaseTable.deletePurchaseTable({
        storeId: store.id,
        purchaseTableId,
      });
      setAlertState({
        message: '買取表を削除しました',
        severity: 'success',
      });
      // 買取表一覧を再取得
      await fetchPurchaseTable();
    } catch (error) {
      setAlertState({
        message: '買取表の削除に失敗しました',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <DeleteButton
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      />
      <ConfirmationDialog
        open={isOpen}
        isLoading={isLoading}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="買取表を削除しますか？"
        message="買取表を削除すると、買取表のデータを復元することはできません。"
        confirmButtonText="削除する"
      />
    </Box>
  );
};
