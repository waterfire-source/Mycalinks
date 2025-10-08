import React, { useState } from 'react';
import { PATH } from '@/constants/paths';
import TertiaryButton from '@/components/buttons/TertiaryButton';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { useRouter } from 'next/navigation';
import { useSaleCart } from '@/feature/sale/hooks/useSaleCart';

export const CancelTransactionButton: React.FC = () => {
  const router = useRouter();
  const { resetCart } = useSaleCart();

  // 取引中止モーダルのステート
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // 取引中止処理
  const handleCancelTransaction = () => {
    resetCart();
    router.push(PATH.SALE.root);
  };

  return (
    <>
      <TertiaryButton
        sx={{ width: '120px', height: '56px' }}
        onClick={() => setIsCancelModalOpen(true)}
      >
        取引中止
      </TertiaryButton>

      <ConfirmationModal
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelTransaction}
        title="取引中止の確認"
        description="本当に取引を中止しますか？"
        confirmButtonText="はい"
        cancelButtonText="キャンセル"
      />
    </>
  );
};
