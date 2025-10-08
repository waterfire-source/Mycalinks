import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { TransactionPaymentMethod } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { useSaleCartContext } from '@/contexts/SaleCartContext';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { PATH } from '@/constants/paths';
import { useStore } from '@/contexts/StoreContext';

interface Props {
  open: boolean;
  onClose: () => void;
  transactionId: number;
}

export const SalePaymentSummaryModal: React.FC<Props> = ({
  open,
  onClose,
  transactionId,
}) => {
  const router = useRouter();
  const { ePosDev } = useEposDevice();
  const { state, resetCart } = useSaleCartContext();
  const { store } = useStore();
  const handlePrintReceipt = () => {
    if (ePosDev) {
      ePosDev.printReceipt(transactionId, store.id);
    }
  };

  const handlePrintRyoshu = () => {
    if (ePosDev) {
      ePosDev.printReceipt(transactionId, store.id, 'ryoshu');
    }
  };

  const handleFinishTransaction = () => {
    router.replace(PATH.SALE.root);
    resetCart();
    if (ePosDev && ePosDev.devices.display) {
      ePosDev.resetDisplay();
    }
    onClose();
  };

  return (
    <CustomModalWithHeader
      open={open}
      // 取引終了を押さない限りモーダルが閉じないようにするため。
      onClose={() => {}}
      isShowCloseIcon={false}
      title="お会計完了"
      width="30%"
      dataTestId="transaction-completion-modal"
    >
      <Stack flexDirection="column" gap={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          data-testid="completion-total-container"
        >
          <Typography variant="body1">合計金額</Typography>
          <Typography variant="body1" data-testid="completion-total-amount">
            {state.totalPrice.toLocaleString()}円
          </Typography>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          data-testid="completion-received-container"
        >
          <Typography variant="body1">お預かり金額</Typography>
          <Typography variant="body1" data-testid="completion-received-amount">
            {(state.receivedPrice ?? 0).toLocaleString()}円
          </Typography>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          data-testid="completion-change-container"
        >
          <Typography variant="body1">お釣り</Typography>
          <Typography
            variant="body1"
            data-testid="completion-change-amount"
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
              fontSize: 20,
            }}
          >
            {(state.paymentMethod === TransactionPaymentMethod.cash
              ? (state.receivedPrice ?? 0) - state.totalPrice
              : 0
            ).toLocaleString()}
            円
          </Typography>
        </Box>
        <Stack
          flexDirection="row"
          sx={{ width: '100%', height: '30px' }}
          gap={2}
        >
          <SecondaryButtonWithIcon
            sx={{ width: '50%', height: '100%' }}
            onClick={handlePrintReceipt}
            data-testid="completion-receipt-button"
          >
            レシート印刷
          </SecondaryButtonWithIcon>
          <SecondaryButtonWithIcon
            sx={{ width: '50%', height: '100%' }}
            onClick={handlePrintRyoshu}
            data-testid="completion-invoice-button"
          >
            領収書印刷
          </SecondaryButtonWithIcon>
        </Stack>
        <PrimaryButtonWithIcon
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleFinishTransaction}
          sx={{ height: '50px' }}
          data-testid="completion-finish-button"
        >
          取引終了
        </PrimaryButtonWithIcon>
      </Stack>
    </CustomModalWithHeader>
  );
};
