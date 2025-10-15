import { Modal, Box, Typography, Button } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import { OrderItemsList } from '@/feature/ec/OrderItemsList';
import { OrderDetail } from '@/components/modals/ec/OrderDetailModal';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { QRCodeDisplay } from '@/components/common/QRCodeDisplay';

interface Props {
  open: boolean;
  onClose: () => void;
  orderDetail: OrderDetail | null;
}

// ピッキングモーダル
export const PickingModal = ({ open, onClose, orderDetail }: Props) => {
  const router = useRouter();
  if (!orderDetail) return null;

  // チェックリストを起動するハンドラ
  const handleChecklistClick = () => {
    router.push(`${PATH.EC.picking}?orderId=${orderDetail.orderNumber}`);
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
          maxWidth: '1200px',
          minWidth: '600px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 1,
          overflow: 'scroll',
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
            ピッキング（注文番号：{orderDetail.orderNumber}）
          </Typography>
          <Button
            onClick={onClose}
            sx={{ color: 'white', minWidth: 'auto', p: 1 }}
          >
            <FaTimes size={16} />
          </Button>
        </Box>

        {/* コンテンツ部分 */}
        <Box sx={{ display: 'flex', p: 2, gap: 5 }}>
          {/* 左側：商品リスト */}
          <OrderItemsList
            items={orderDetail.items}
            receivedDate={orderDetail.receivedDate}
            height="500px"
          />

          {/* 右側：QRコードとアクション */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '500px', // 左側のOrderItemsListと同じ高さに
              p: 4, // 全体的なパディングを追加
            }}
          >
            {/* 上部セクション */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pb: 2,
              }}
            >
              <PrimaryButton
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontSize: '1.2rem',
                  px: 4,
                  textAlign: 'center',
                  '&:hover': {
                    backgroundColor: 'error.dark',
                  },
                }}
                onClick={handleChecklistClick}
              >
                チェックリストを起動
              </PrimaryButton>
            </Box>

            {/* 中央セクション */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'grey.700',
                  textAlign: 'center',
                  mb: 2,
                  fontSize: '1.2rem',
                }}
              >
                別端末でチェックリストを起動
              </Typography>

              {/* 下部セクション */}
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <QRCodeDisplay url="https://example.com" size={200} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
