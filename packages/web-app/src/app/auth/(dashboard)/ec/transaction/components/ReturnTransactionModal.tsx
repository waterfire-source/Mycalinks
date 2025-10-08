import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transactionId: number | null;
};

export const ReturnTransactionModal = ({
  open,
  onClose,
  onConfirm,
  transactionId,
}: Props) => {
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="取引を返品"
      message={`取引ID${transactionId}を返品処理しても大丈夫でしょうか？（この操作は取り消せません）\n返品処理と同時に、在庫も元に戻ります`}
      confirmButtonText="返品"
    />
  );
};
