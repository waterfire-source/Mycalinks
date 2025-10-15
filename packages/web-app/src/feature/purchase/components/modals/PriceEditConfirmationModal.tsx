import React from 'react';
import { Typography, Stack } from '@mui/material';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { PurchaseCartItem } from '@/feature/purchase/hooks/usePurchaseCart';
import { LocalStorageManager } from '@/utils/localStorage';

interface Props {
  open: boolean;
  onClose: () => void;
  transactionId: number;
  zeroPriceItems: ItemAPIRes['getAll']['items'];
  carts: PurchaseCartItem[];
  setIsPaymentSummaryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PriceEditConfirmationModal: React.FC<Props> = ({
  open,
  onClose,
  transactionId,
  zeroPriceItems,
  carts,
  setIsPaymentSummaryModalOpen,
}) => {
  const router = useRouter();
  const storageManager = new LocalStorageManager('purchaseData');

  const handleSubmit = () => {
    storageManager.setItem({
      transactionId: transactionId,
      zeroPriceItems: zeroPriceItems,
      carts: carts,
    });
    router.push(`${PATH.ITEM.root}`);
  };

  const handleClose = () => {
    setIsPaymentSummaryModalOpen(true);
    onClose();
  };

  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title={'価格編集確認'}
      width="50%"
      height="50%"
    >
      <Stack
        sx={{
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h2">
            販売価格が0円の商品を買い取りました。
          </Typography>
          <Typography variant="h2">価格を変更しますか？</Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: 'column',
            width: '100%',
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <PrimaryButton
            onClick={handleSubmit}
            sx={{ width: '80%', height: '60px' }}
          >
            価格を編集する
          </PrimaryButton>
          <SecondaryButton
            onClick={handleClose}
            sx={{ width: '80%', height: '40px' }}
          >
            価格を編集しない
          </SecondaryButton>
        </Stack>
      </Stack>
    </CustomModalWithHeader>
  );
};
