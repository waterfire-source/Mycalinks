import { Modal, Box, IconButton } from '@mui/material';
import { useState } from 'react';
import { Close } from '@mui/icons-material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { PaymentInfoFormWrapper } from '@/app/register/gmo/components/payment/form';

export const PaymentInfoModalButton = ({
  setPaymentToken,
  paymentToken,
  cardLast4,
}: {
  setPaymentToken: (token: string, cardLast4: string) => void;
  paymentToken: string | null;
  cardLast4: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePaymentTokenSet = (token: string, cardLast4: string) => {
    setPaymentToken(token, cardLast4);
    setIsOpen(false); // モーダルを閉じる
  };

  return (
    <>
      <PrimaryButton onClick={() => setIsOpen(true)}>
        {paymentToken
          ? `支払い情報変更（カード番号：**** **** ****${cardLast4}）`
          : '支払い情報登録'}
      </PrimaryButton>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        sx={{
          maxWidth: '600px',
          margin: 'auto',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            width: '100%',
          }}
        >
          <IconButton
            onClick={() => setIsOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'grey.500',
            }}
          >
            <Close />
          </IconButton>
          <PaymentInfoFormWrapper setPaymentToken={handlePaymentTokenSet} />
        </Box>
      </Modal>
    </>
  );
};
