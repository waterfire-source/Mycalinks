import { Modal, Box, Typography, Button } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import { OrderDetailSidePanel } from '@/feature/ec/OrderDetailSidePanel';
import { OrderDetail } from '@/components/modals/ec/OrderDetailModal';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useAlert } from '@/contexts/AlertContext';
import { ImageUploadArea } from '@/components/common/ImageUploadArea';

interface Props {
  open: boolean;
  onClose: () => void;
  orderDetail: OrderDetail | null;
  setOrderDetail: (orderDetail: OrderDetail) => void;
}

// 発送準備モーダル
export const PrepareShippingModal = ({
  open,
  onClose,
  orderDetail,
  setOrderDetail,
}: Props) => {
  const { setAlertState } = useAlert();

  if (!orderDetail) return null;

  const handleDeliveryMethodChange = (method: string) => {
    setOrderDetail({ ...orderDetail, deliveryMethod: method });
  };

  const handlePrintReceipt = () => {
    // TODO: 伝票印刷の処理を実装
  };

  const handleCompleteShipping = () => {
    setAlertState({
      message: '発送準備完了',
      severity: 'success',
    });
    onClose();
  };

  const handleImageUpload = (index: number) => (file: File | null) => {
    // TODO: 画像アップロードの処理を実装
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95%',
          maxWidth: '800px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 1,
        }}
      >
        {/* ヘッダー部分 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1.5,
            bgcolor: 'grey.500',
            borderRadius: '4px 4px 0 0',
          }}
        >
          <Typography color="white" sx={{ textAlign: 'center', flexGrow: 1 }}>
            発送準備（注文番号：{orderDetail.orderNumber}）
          </Typography>
          <Button
            onClick={onClose}
            sx={{ color: 'white', minWidth: 'auto', p: 1 }}
          >
            <FaTimes size={16} />
          </Button>
        </Box>

        {/* コンテンツ部分 */}
        <Box
          sx={{
            display: 'flex',
            p: 2,
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <OrderDetailSidePanel
            orderDetail={orderDetail}
            showSections={{
              shipping: true,
            }}
            isEditable={true}
            onDeliveryMethodChange={handleDeliveryMethodChange}
          />

          <Box sx={{ ml: 11, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              画像：
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, pl: 5 }}>
              <ImageUploadArea onImageUpload={handleImageUpload(0)} />
              <ImageUploadArea onImageUpload={handleImageUpload(1)} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, pb: 2 }}>
          <SecondaryButton
            variant="contained"
            sx={{ width: '200px' }}
            onClick={handlePrintReceipt}
          >
            伝票印刷
          </SecondaryButton>
          <PrimaryButton
            variant="contained"
            sx={{ width: '200px' }}
            onClick={handleCompleteShipping}
          >
            発送準備完了
          </PrimaryButton>
        </Box>
      </Box>
    </Modal>
  );
};
