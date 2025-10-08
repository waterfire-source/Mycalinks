import { Modal, Box, Typography, Button } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import { OrderItemsList } from '@/feature/ec/OrderItemsList';
import { OrderDetailSidePanel } from '@/feature/ec/OrderDetailSidePanel';

// 注文商品の型定義
export interface OrderItem {
  name: string;
  condition: string;
  price: number;
  quantity: number;
  image: string;
  rarity: string;
  modelNumber: string;
  scannedQuantity: number;
}

// 注文詳細の型定義
export interface OrderDetail {
  orderNumber: string;
  receivedDate: string;
  shippingInfo: {
    postalCode: string;
    address: string;
    name: string;
    fullNameRuby: string;
    phone: string;
  };
  billingInfo: {
    postalCode: string;
    address: string;
    name: string;
    fullNameRuby: string;
    phone: string;
  };
  deliveryDate: string;
  pickupDate: string;
  deliveryMethod: string;
  items: OrderItem[];
  payment: {
    method: string;
    total: number;
    shippingFee: number;
    grandTotal: number;
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  orderDetail: OrderDetail | null;
}

// 注文詳細モーダル
export const OrderDetailModal = ({ open, onClose, orderDetail }: Props) => {
  if (!orderDetail) return null;

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
            注文詳細（注文番号：{orderDetail.orderNumber}）
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
          {/* 左側：注文情報 */}
          <OrderItemsList
            items={orderDetail.items}
            receivedDate={orderDetail.receivedDate}
            height="650px"
          />

          {/* 右側：配送・支払情報 */}
          <OrderDetailSidePanel
            orderDetail={orderDetail}
            showSections={{
              shipping: true,
              billing: true,
              payment: true,
              receipt: true,
            }}
          />
        </Box>
      </Box>
    </Modal>
  );
};
