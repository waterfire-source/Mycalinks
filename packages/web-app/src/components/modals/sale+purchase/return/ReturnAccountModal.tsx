import React, { useState } from 'react';
import { Modal, Box, Typography, CircularProgress } from '@mui/material';
import TertiaryButton from '@/components/buttons/TertiaryButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (setLoading: (value: boolean) => void) => void;
  subtotal: number;
  tax: number;
  total: number;
  globalDiscountPrice: number;
}

const ReturnAccountModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  subtotal,
  tax,
  total,
  globalDiscountPrice,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmClick = () => {
    setLoading(true);
    onConfirm(setLoading);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: '4px',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          返品詳細
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography>小計</Typography>
          <Typography>{subtotal.toLocaleString()}円</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography>全体割引</Typography>
          <Typography>{globalDiscountPrice.toLocaleString()}円</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography>消費税</Typography>
          <Typography>{tax.toLocaleString()}円</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography>合計</Typography>
          <Typography>{total.toLocaleString()}円</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" gap={2}>
          <PrimaryButton
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleConfirmClick}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '確定'}
          </PrimaryButton>
          <TertiaryButton
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            キャンセル
          </TertiaryButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default ReturnAccountModal;
