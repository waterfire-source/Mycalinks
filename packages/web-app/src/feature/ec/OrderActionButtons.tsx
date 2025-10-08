import { Box } from '@mui/material';
import TertiaryButton from '@/components/buttons/TertiaryButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { STATUS_MAP, STATUS_ACTIONS } from '@/feature/ec/ShippingStatusToggle';
import { useState } from 'react';
import {
  OrderDetailModal,
  OrderDetail,
} from '@/components/modals/ec/OrderDetailModal';
import { PickingModal } from '@/components/modals/ec/PickingModal';
import { PrepareShippingModal } from '@/components/modals/ec/PrepareShippingModal';
import { mockOrderDetail } from '@/feature/ec/mockOrderDetail';

interface Props {
  status: string;
  orderId: string;
  scanEnabled?: boolean;
}

// 注文アクションボタン
export const OrderActionButtons = ({
  status,
  orderId,
  scanEnabled = false,
}: Props) => {
  // モーダルの状態管理
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPickingModalOpen, setIsPickingModalOpen] = useState(false);
  const [isPrepareShippingModalOpen, setIsPrepareShippingModalOpen] =
    useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  // STATUS_MAPから対応するステータスキーを取得
  const statusKey = Object.entries(STATUS_MAP).find(
    ([_, value]) => value === status,
  )?.[0] as keyof typeof STATUS_ACTIONS;

  const getActionConfig = (statusKey: keyof typeof STATUS_ACTIONS) => {
    // スキャン機能が有効で、ステータスが「在庫確保前」の場合、ピッキング完了アクションを返す
    if (scanEnabled && statusKey === 'before_stock') {
      return STATUS_ACTIONS.confirming;
    }
    return STATUS_ACTIONS[statusKey];
  };

  const statusAction = statusKey ? getActionConfig(statusKey) : null;

  const handleActionClick = (action: string) => {
    setSelectedOrder(mockOrderDetail);
    switch (action) {
      case 'picking':
        setIsPickingModalOpen(true);
        break;
      case 'prepare_shipping':
        setIsPrepareShippingModalOpen(true);
        break;
    }
  };

  const handleDetailClick = () => {
    setSelectedOrder(mockOrderDetail);
    setIsDetailModalOpen(true);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <TertiaryButton sx={{ minWidth: '100px' }} onClick={handleDetailClick}>
          詳細
        </TertiaryButton>
        {statusAction ? (
          <PrimaryButton
            onClick={() => handleActionClick(statusAction.action)}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              minWidth: '150px',
              '&:hover': {
                backgroundColor: 'error.dark',
              },
            }}
          >
            {statusAction.label}
          </PrimaryButton>
        ) : (
          <Box sx={{ minWidth: '150px' }} />
        )}
      </Box>

      {/* モーダル */}
      <OrderDetailModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        orderDetail={selectedOrder}
      />
      <PickingModal
        open={isPickingModalOpen}
        onClose={() => setIsPickingModalOpen(false)}
        orderDetail={selectedOrder}
      />
      <PrepareShippingModal
        open={isPrepareShippingModalOpen}
        onClose={() => setIsPrepareShippingModalOpen(false)}
        orderDetail={selectedOrder}
        setOrderDetail={setSelectedOrder}
      />
    </>
  );
};
