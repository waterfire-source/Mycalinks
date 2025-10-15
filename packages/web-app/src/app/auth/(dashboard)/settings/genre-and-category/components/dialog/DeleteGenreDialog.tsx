import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

type DeleteGenreDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  genreName: string;
};

export const DeleteGenreDialog = ({
  open,
  onClose,
  onConfirm,
  genreName,
}: DeleteGenreDialogProps) => {
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="確認"
      message={`「${genreName}」を削除してもよろしいですか？`}
      confirmButtonText="削除する"
    />
  );
};
