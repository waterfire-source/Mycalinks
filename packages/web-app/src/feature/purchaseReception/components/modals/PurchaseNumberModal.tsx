import React from 'react';
import { Box, Typography } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
interface PurchaseNumberModalProps {
  open: boolean;
  onClose: () => void;
  purchaseNumber: number;
  transactionId: number;
}

export const PurchaseNumberModal: React.FC<PurchaseNumberModalProps> = ({
  open,
  onClose,
  purchaseNumber,
  transactionId,
}) => {
  const router = useRouter();
  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title="新規買取"
      width="350px"
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ mb: 4, color: 'text.primary' }}>
          買取を受け付けました。
          <br />
          査定を開始してください。
        </Typography>
        <Typography sx={{ mb: 2, color: 'text.primary' }}>買取番号</Typography>
        <Typography
          variant="h1"
          sx={{ fontSize: '72px', fontWeight: 'bold', mb: 4 }}
        >
          {purchaseNumber}
        </Typography>
        <PrimaryButton
          onClick={() => {
            router.push(
              PATH.PURCHASE_RECEPTION.transaction.purchase(transactionId),
            );
          }}
        >
          買取メニューへ
        </PrimaryButton>
      </Box>
    </CustomModalWithHeader>
  );
};
