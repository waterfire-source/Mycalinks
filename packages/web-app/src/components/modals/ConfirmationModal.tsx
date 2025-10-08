import CustomDialog from '@/components/dialogs/CustomDialog';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import TertiaryButton from '@/components/buttons/TertiaryButton';
import { Box } from '@mui/material';

type ConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isLoading?: boolean;
  hideCancelButton?: boolean;
};

//確認モーダル
export const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title = '確認',
  description = '本当にこの操作を行いますか？',
  confirmButtonText = 'はい',
  cancelButtonText = 'キャンセル',
  isLoading = false,
  hideCancelButton = false,
}: ConfirmationModalProps) => {
  return (
    <CustomDialog
      isOpen={open}
      onClose={onClose}
      title={title}
      size="small"
      actions={
        <Box display="flex" justifyContent="space-between" gap={2}>
          {!hideCancelButton && (
            <TertiaryButton onClick={onClose} color="primary">
              {cancelButtonText}
            </TertiaryButton>
          )}
          <PrimaryButton
            onClick={onConfirm}
            color="primary"
            autoFocus
            loading={isLoading}
          >
            {confirmButtonText}
          </PrimaryButton>
        </Box>
      }
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        {description
          .replace(/\\n/g, '\n')
          .split('\n')
          .map((line, index) => (
            <Box
              key={index}
              sx={{
                width: '100%',
                textAlign: 'center',
              }}
            >
              {line}
              {index <
                description.replace(/\\n/g, '\n').split('\n').length - 1 && (
                <br />
              )}
            </Box>
          ))}
      </Box>
    </CustomDialog>
  );
};
