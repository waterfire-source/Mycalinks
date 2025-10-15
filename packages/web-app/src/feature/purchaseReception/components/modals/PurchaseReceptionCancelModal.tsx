import { useTransactions } from '@/feature/transaction/hooks/useTransactions';
import { useAlert } from '@/contexts/AlertContext';
import { useState } from 'react';
import { CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
interface Props {
  open: boolean;
  onClose: () => void;
  transactionId: number;
  refetch: () => void;
}

export const PurchaseReceptionCancelModal = ({
  open,
  onClose,
  transactionId,
  refetch,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { cancelDraftPurchaseTransaction } = useTransactions();
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const onCancel = async () => {
    setIsLoading(true);
    try {
      await cancelDraftPurchaseTransaction({
        store_id: store.id,
        transaction_id: transactionId,
      });
      setAlertState({
        message: '買取受付をキャンセルしました',
        severity: 'success',
      });
      onClose();
      refetch();
    } catch (error) {
      if (error instanceof CustomError) {
        setAlertState({
          message: `${error.status}:${error.message}`,
          severity: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ConfirmationDialog
      title="買取受付削除"
      message="本当に削除しますか？"
      confirmButtonText="削除する"
      cancelButtonText="削除しない"
      open={open}
      onClose={onClose}
      onConfirm={onCancel}
      isLoading={isLoading}
    />
  );
};
