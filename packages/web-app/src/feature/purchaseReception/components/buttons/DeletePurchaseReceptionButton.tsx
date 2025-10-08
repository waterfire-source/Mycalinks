import { DeleteButton } from '@/components/buttons/DeleteButton';
import { PurchaseReceptionCancelModal } from '@/feature/purchaseReception/components/modals/PurchaseReceptionCancelModal';
import { useState } from 'react';

interface Props {
  transactionId: number;
  refetch: () => void;
}

export const DeletePurchaseReceptionButton = ({
  transactionId,
  refetch,
}: Props) => {
  // 買取受付をキャンセルするモーダルの表示
  const [isOpenCancelModal, setIsOpenCancelModal] = useState(false);
  const handleDelete = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    // 親への伝達を防ぐ(tableRowのonClickが発火しないようにする)
    event.stopPropagation();
    setIsOpenCancelModal(true);
  };
  return (
    <>
      <DeleteButton onClick={handleDelete} />
      <PurchaseReceptionCancelModal
        open={isOpenCancelModal}
        onClose={() => setIsOpenCancelModal(false)}
        transactionId={transactionId}
        refetch={refetch}
      />
    </>
  );
};
