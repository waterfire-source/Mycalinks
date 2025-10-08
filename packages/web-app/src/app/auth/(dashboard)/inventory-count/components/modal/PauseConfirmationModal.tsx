import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

interface PauseConfirmationModalProps {
  isConfirmModalOpen: boolean;
  setIsConfirmModalOpen: (open: boolean) => void;
  handlePauseComplete: () => void;
}
export const PauseConfirmationModal = ({
  isConfirmModalOpen,
  setIsConfirmModalOpen,
  handlePauseComplete,
}: PauseConfirmationModalProps) => {
  return (
    <ConfirmationDialog
      title="棚卸を一時中断"
      open={isConfirmModalOpen}
      onClose={() => setIsConfirmModalOpen(false)}
      confirmButtonText="一時中断"
      onConfirm={handlePauseComplete}
      cancelButtonText="キャンセル"
      onCancel={() => setIsConfirmModalOpen(false)}
      message="一時中断しますか?\n一時中断した棚卸しは後から再開できます"
      width="400px"
    />
  );
};
