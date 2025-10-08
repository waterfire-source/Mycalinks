import React from 'react';
import { PurchaseNumberModal } from '@/feature/purchaseReception/components/modals/PurchaseNumberModal';

interface PurchaseNumberModalContainerProps {
  open: boolean;
  onClose: () => void;
  purchaseNumber: number;
  transactionId: number;
}

export const PurchaseNumberModalContainer: React.FC<
  PurchaseNumberModalContainerProps
> = ({ open, onClose, purchaseNumber, transactionId }) => {
  // ここに以下のなビジネスロジックを記述
  // 受付番号を印刷するための処理。

  return (
    <PurchaseNumberModal
      open={open}
      onClose={onClose}
      purchaseNumber={purchaseNumber}
      transactionId={transactionId}
    />
  );
};
