import { Box, Modal, Typography } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { OrderInfo } from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';
import { useOrderPrepare } from '@/app/auth/(dashboard)/ec/list/hooks/useOrderPrepare';

interface Props {
  open: boolean;
  onClose: () => void;
  orderInfo: OrderInfo;
  closeAllModals: () => void;
  refetchOrderInfo: () => void;
  handleTableReset: () => void;
}

export const ECOrderPrepareModal = ({
  open,
  onClose,
  orderInfo,
  closeAllModals,
  refetchOrderInfo,
  handleTableReset,
}: Props) => {
  const { prepareOrder } = useOrderPrepare();

  const handlePrepare = async () => {
    await prepareOrder(orderInfo.orderId);
    await refetchOrderInfo();
    await handleTableReset();
    closeAllModals();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 24,
        }}
      >
        <Box sx={{ pt: 4, pb: 2, px: 4 }}>
          <Typography variant="h1" sx={{ color: 'rgba(184,42,42,1)' }}>
            発送準備確認
          </Typography>
          <Typography sx={{ pt: 2 }}>
            発送準備完了にして問題ないですか？
            <br />
            発送準備完了した場合、発送準備に戻ることはできません。
          </Typography>
        </Box>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <PrimaryButton variant="text" onClick={onClose}>
            発送準備を続ける
          </PrimaryButton>
          <PrimaryButton
            variant="contained"
            color="error"
            onClick={handlePrepare}
          >
            発送準備を完了する
          </PrimaryButton>
        </Box>
      </Box>
    </Modal>
  );
};
