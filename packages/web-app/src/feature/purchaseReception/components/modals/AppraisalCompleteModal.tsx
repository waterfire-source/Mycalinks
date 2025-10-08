import React from 'react';
import { Box, Typography } from '@mui/material';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import Image from 'next/image';

interface AppraisalCompleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmClick: () => Promise<void>;
  purchaseNumber: number | null;
  isLoading: boolean;
  hasCustomer?: boolean;
}

export const AppraisalCompleteModal: React.FC<AppraisalCompleteModalProps> = ({
  open,
  onClose,
  onConfirmClick,
  purchaseNumber,
  isLoading,
  hasCustomer,
}) => {
  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title="査定完了"
      sx={{ minWidth: '300px' }}
      dataTestId="purchase-completion-modal"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 4,
        }}
      >
        <Image
          src="/images/dangerous_icon.png"
          alt="Dangerous icon"
          width={80}
          height={80}
        />
        <Typography variant="h5" sx={{ mt: 2 }}>
          買取番号 {purchaseNumber}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          お客様に通知されます
        </Typography>
        <PrimaryButton
          variant="contained"
          color="error"
          onClick={onConfirmClick}
          sx={{ mt: 4, width: '90%' }}
          data-testid="purchase-completion-close-button"
          loading={isLoading}
        >
          査定完了
        </PrimaryButton>
      </Box>
    </CustomModalWithHeader>
  );
};
