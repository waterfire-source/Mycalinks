import CustomDialog from '@/components/dialogs/CustomDialog';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import TertiaryButton from '@/components/buttons/TertiaryButton';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

type ConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  theoreticalValue?: number;
  inputValue?: number;
};

//閉店処理確認モーダル
export const CloseConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  theoreticalValue,
  inputValue,
}: ConfirmationModalProps) => {
  // 差額を計算
  const difference = (inputValue || 0) - (theoreticalValue || 0);
  // 差額の色を設定
  const differenceColor = difference < 0 ? 'red' : 'blue';

  return (
    <CustomDialog
      isOpen={open}
      onClose={onClose}
      title={'レジ金エラー'}
      size="small"
      actions={
        <Box display="flex" justifyContent="space-between" gap={2}>
          <TertiaryButton onClick={onClose} color="primary">
            戻る
          </TertiaryButton>
          <PrimaryButton onClick={onConfirm} color="primary" autoFocus>
            登録
          </PrimaryButton>
        </Box>
      }
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ flexDirection: 'column', gap: 2 }}
      >
        <Image
          src="/images/dangerous_icon.png"
          alt="Dangerous icon"
          width={80}
          height={80}
        />
        <Typography>理論在高と実在高（入力値）が異なります。</Typography>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Typography>理論在高：</Typography>
          <Typography fontWeight="bold">
            ￥{theoreticalValue?.toLocaleString()}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Typography>実在高：</Typography>
          <Typography fontWeight="bold">
            ￥{inputValue?.toLocaleString()}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Typography>差額：</Typography>
          <Typography fontWeight="bold" color={differenceColor}>
            ￥{difference.toLocaleString()}
          </Typography>
        </Box>
        <Typography>登録しますか？</Typography>
      </Box>
    </CustomDialog>
  );
};
