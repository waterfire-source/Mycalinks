import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { Typography } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onResetCart: () => void;
}

export const ResetCartModal = ({ open, onClose, onResetCart }: Props) => {
  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="カートのリセット"
      width="40%"
      height="auto"
      actionButtonText="OK"
      cancelButtonText="キャンセル"
      onActionButtonClick={onResetCart}
      onCancelClick={onClose}
      isAble={true}
    >
      <Typography variant="body1">
        一定時間操作がなかったため、カートをリセットし戻ります。
      </Typography>
    </CustomModalWithIcon>
  );
};
