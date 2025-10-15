import { useState } from 'react';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import {
  OriginalPackItemType,
  OriginalPackProduct,
} from '@/app/auth/(dashboard)/original-pack/page';
import { OriginalPackProductCardList } from '@/feature/originalPack/disassembly/components/OriginalPackProductCardList';
import { OriginalPackDisassemblyConfirmation } from '@/feature/originalPack/disassembly/components/OriginalPackDisassemblyConfirmation';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';

interface OriginalPackDisassemblyProps {
  storeId: number;
  originalPack: OriginalPackItemType | null;
  originalPackProducts: OriginalPackProduct[];
  setOriginalPackProducts: (products: OriginalPackProduct[]) => void;
  onCancel: () => void;
}

export const OriginalPackDisassembly: React.FC<
  OriginalPackDisassemblyProps
> = ({
  storeId,
  originalPack,
  originalPackProducts,
  setOriginalPackProducts,
  onCancel: handleCancel,
}: OriginalPackDisassemblyProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  // 画面遷移確認モーダル表示の制御
  const { setModalVisible } = useConfirmationModal();

  const onUpdateProductQuantity = (
    id: number,
    processId: string,
    newQuantity: number,
  ) => {
    setModalVisible(true);
    const newProducts = originalPackProducts.map((product) =>
      product.id === id && product.processId === processId
        ? { ...product, item_count: newQuantity }
        : product,
    );
    setOriginalPackProducts(newProducts);
  };

  // 解体ボタン
  const onCompleted = () => {
    setModalVisible(false);
    setIsConfirming(false);
    handleCancel();
  };

  return (
    <ContainerLayout
      title={
        originalPack ? `${originalPack.display_name} 解体` : 'オリパ・福袋 解体'
      }
    >
      {!isConfirming ? (
        <OriginalPackProductCardList
          storeId={storeId}
          originalPackProducts={originalPackProducts}
          updateQuantity={onUpdateProductQuantity}
          onConfirm={() => setIsConfirming(true)}
          onCancel={handleCancel}
        />
      ) : (
        <OriginalPackDisassemblyConfirmation
          storeId={storeId}
          originalPack={originalPack}
          originalPackProducts={originalPackProducts}
          onPrevPage={() => setIsConfirming(false)}
          onCompleted={onCompleted}
        />
      )}
    </ContainerLayout>
  );
};
