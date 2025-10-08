import { ECOrderCancelModal } from '@/app/auth/(dashboard)/ec/list/components/modal/EcOrderCancelModal';
import { ECOrderCompleteModal } from '@/app/auth/(dashboard)/ec/list/components/modal/EcOrderCompleteModal';
import { ECOrderModal } from '@/app/auth/(dashboard)/ec/list/components/modal/EcOrderModal';
import { ECOrderPrepareModal } from '@/app/auth/(dashboard)/ec/list/components/modal/EcOrderPrepareModal';
import {
  ECOrderShortageModal,
  UpdateOrderInfo,
} from '@/app/auth/(dashboard)/ec/list/components/modal/EcOrderShortageModal';
import { ECOrderShortageReportModal } from '@/app/auth/(dashboard)/ec/list/components/modal/EcOrderShortageReportModal';
import { OrderInfo } from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';

interface Props {
  orderModalOpen: boolean;
  shortageModalOpen: boolean;
  shortageReportModalOpen: boolean;
  cancelModalOpen: boolean;
  prepareModalOpen: boolean;
  completeModalOpen: boolean;
  selectedOrder: OrderInfo | null;
  updateOrderInfo: UpdateOrderInfo | null;
  storeId: number;
  onCloseOrderModal: () => void;
  onCloseShortageModal: () => void;
  onCloseShortageReportModal: () => void;
  onCloseCancelModal: () => void;
  onClosePrepareModal: () => void;
  onCloseCompleteModal: () => void;
  onOpenCancelModal: () => void;
  onOpenPrepareModal: () => void;
  onOpenCompleteModal: () => void;
  onOpenShortageReportModal: () => void;
  onOpenShortageModal: () => void;
  setUpdateOrderInfo: (info: UpdateOrderInfo | null) => void;
  closeAllModals: () => void;
  refetchOrderInfo: () => Promise<void>;
  handleTableReset: () => void;
}

export const OrderModals = ({
  orderModalOpen,
  shortageModalOpen,
  shortageReportModalOpen,
  cancelModalOpen,
  prepareModalOpen,
  completeModalOpen,
  selectedOrder,
  updateOrderInfo,
  storeId,
  onCloseOrderModal,
  onCloseShortageModal,
  onCloseShortageReportModal,
  onCloseCancelModal,
  onClosePrepareModal,
  onCloseCompleteModal,
  onOpenCancelModal,
  onOpenPrepareModal,
  onOpenCompleteModal,
  onOpenShortageReportModal,
  onOpenShortageModal,
  setUpdateOrderInfo,
  closeAllModals,
  refetchOrderInfo,
  handleTableReset,
}: Props) => {
  return (
    <>
      <ECOrderModal
        open={orderModalOpen}
        onClose={onCloseOrderModal}
        onCancel={onOpenCancelModal}
        onPrepare={onOpenPrepareModal}
        onComplete={onOpenCompleteModal}
        orderInfo={selectedOrder as OrderInfo}
        onShortageClick={onOpenShortageReportModal}
      />

      {updateOrderInfo && (
        <ECOrderShortageModal
          open={shortageModalOpen}
          onClose={onCloseShortageModal}
          updateOrderInfo={updateOrderInfo}
          storeId={storeId}
          closeAllModals={closeAllModals}
          refetchOrderInfo={refetchOrderInfo}
        />
      )}

      <ECOrderCancelModal
        open={cancelModalOpen}
        onClose={onCloseCancelModal}
        orderInfo={selectedOrder as OrderInfo}
        storeId={storeId}
        closeAllModals={closeAllModals}
        handleTableReset={handleTableReset}
      />

      <ECOrderShortageReportModal
        open={shortageReportModalOpen}
        onClose={onCloseShortageReportModal}
        orderInfo={selectedOrder as OrderInfo}
        setUpdateOrderInfo={setUpdateOrderInfo}
        openShortageModal={onOpenShortageModal}
      />

      <ECOrderPrepareModal
        open={prepareModalOpen}
        onClose={onClosePrepareModal}
        orderInfo={selectedOrder as OrderInfo}
        closeAllModals={closeAllModals}
        refetchOrderInfo={refetchOrderInfo}
        handleTableReset={handleTableReset}
      />

      <ECOrderCompleteModal
        open={completeModalOpen}
        onClose={onCloseCompleteModal}
        orderInfo={selectedOrder as OrderInfo}
        storeId={storeId}
        closeAllModals={closeAllModals}
        onComplete={refetchOrderInfo}
        handleTableReset={handleTableReset}
      />
    </>
  );
};
