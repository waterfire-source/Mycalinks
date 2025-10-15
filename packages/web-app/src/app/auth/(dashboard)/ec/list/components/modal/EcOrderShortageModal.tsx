import { Box, Modal, Typography } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useOrderShortage } from '@/app/auth/(dashboard)/ec/list/hooks/useOrderShortage';

export interface UpdateOrderInfo {
  orderId: number;
  products?: Array<{
    product_id: number;
    item_count: number;
  }>;
}
interface ECOrderShortageModalProps {
  open: boolean;
  onClose: () => void;
  updateOrderInfo: UpdateOrderInfo;
  storeId: number;
  closeAllModals: () => void;
  refetchOrderInfo: () => void;
}

export const ECOrderShortageModal = ({
  open,
  onClose,
  updateOrderInfo,
  storeId,
  closeAllModals,
  refetchOrderInfo,
}: ECOrderShortageModalProps) => {
  const { reportShortage } = useOrderShortage({ storeId });
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
            欠品報告
          </Typography>
          <Typography sx={{ pt: 2 }}>
            お客様に欠品報告通知が送信されます。
            <br />
            欠品リストに間違いがないかもう一度確認してください。
            <br />
            また、欠品報告した商品は自動でMall上から非表示となります。
            <br />
            再表示の際は在庫数を確認の上、出品在庫リストから再度表示してください。
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
            欠品商品の選択に戻る
          </PrimaryButton>
          <PrimaryButton
            variant="contained"
            color="error"
            onClick={async () => {
              const result = await reportShortage(updateOrderInfo.orderId, {
                products: updateOrderInfo.products,
              });
              if (result) {
                closeAllModals();
                setTimeout(async () => {
                  await refetchOrderInfo();
                }, 1000);
              }
            }}
          >
            欠品報告
          </PrimaryButton>
        </Box>
      </Box>
    </Modal>
  );
};
