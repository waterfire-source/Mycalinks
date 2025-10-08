import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

interface ConfirmationListCloseModalProps {
  open: boolean;
  onClose: () => void;
  onCloseMarketFluctuationsModal: () => void;
}

export const ConfirmationListCloseModal = ({
  open,
  onClose,
  onCloseMarketFluctuationsModal,
}: ConfirmationListCloseModalProps) => {
  const handleModalAllClose = () => {
    onClose();
    onCloseMarketFluctuationsModal();
  };
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="相場変動リストを閉じますか？"
      message="価格の変更が保存されていない可能性があります。"
      confirmButtonText="キャンセル"
      onConfirm={onClose}
      cancelButtonText="リストを閉じる"
      onCancel={handleModalAllClose}
    />
  );
};
