import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useStore } from '@/contexts/StoreContext';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  productId: number;
  refetchProducts: () => Promise<void>;
}

export const ConfirmCancelModal = ({
  open,
  onClose,
  productId,
  refetchProducts,
}: Props) => {
  const { store } = useStore();
  const { updateProduct } = useUpdateProduct();
  const [primaryButtonLoading, setPrimaryButtonLoading] =
    useState<boolean>(false);
  const onPrimaryButtonClick = async () => {
    setPrimaryButtonLoading(true);
    try {
      const result = await updateProduct(store.id, productId, {
        mycalinksEcEnabled: false,
      });

      if (result.success) {
        onClose();
      }
      await refetchProducts();
    } catch (error) {
      console.error('更新中にエラーが発生しました', error);
    } finally {
      setPrimaryButtonLoading(false);
    }
  };
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onPrimaryButtonClick}
      title="出品取り消し"
      message={`本当に取り消してもよろしいでしょうか？`}
      confirmButtonText={primaryButtonLoading ? '処理中…' : '出品を取り消す'}
      cancelButtonText="キャンセル"
    />
  );
};
