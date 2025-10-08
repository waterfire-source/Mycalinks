import { Box, Modal, Typography, TextField } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { OrderInfo } from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';
import { useOrderCancel } from '@/app/auth/(dashboard)/ec/list/hooks/useOrderCancel';
import { useOrderInfo } from '@/app/auth/(dashboard)/ec/list/hooks/useOrderInfo';
import { useState } from 'react';

interface ECOrderCancelModalProps {
  open: boolean;
  onClose: () => void;
  orderInfo: OrderInfo;
  storeId: number;
  closeAllModals: () => void;
  handleTableReset: () => void;
}

export const ECOrderCancelModal = ({
  open,
  onClose,
  orderInfo,
  storeId,
  closeAllModals,
  handleTableReset,
}: ECOrderCancelModalProps) => {
  const { cancelOrder } = useOrderCancel({ storeId });
  const { fetchOrderInfo } = useOrderInfo({ storeId });
  const [cancelReason, setCancelReason] = useState<string>('');

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      return; // キャンセル理由が空の場合は処理しない
    }
    await cancelOrder(orderInfo.orderId, cancelReason);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    fetchOrderInfo();
    handleTableReset();
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
            キャンセル確認
          </Typography>
          <Typography sx={{ pt: 2, pb: 2 }}>
            お客様にキャンセル通知が送信され、注文がキャンセルされます。また、店舗都合による注文のキャンセルは評価の低下などにつながる恐れがあります。
            <br />
            キャンセルする場合はキャンセル理由を記入の上「キャンセルする」を押してください。
          </Typography>
          <Typography sx={{ pb: 1, fontWeight: 'bold' }}>
            キャンセル理由（お客様に通知されます）
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="キャンセル理由を入力してください"
            required
            error={!cancelReason.trim()}
            helperText={!cancelReason.trim() ? 'キャンセル理由は必須です' : ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              },
            }}
          />
        </Box>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <PrimaryButton
            variant="text"
            onClick={handleCancel}
            disabled={!cancelReason.trim()}
          >
            キャンセルする
          </PrimaryButton>
          <PrimaryButton variant="contained" color="error" onClick={onClose}>
            キャンセルしない
          </PrimaryButton>
        </Box>
      </Box>
    </Modal>
  );
};
