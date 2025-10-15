import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

interface ConfirmationChangeInventoryPriceModalProps {
  open: boolean;
  onClose: () => void;
  handleUpdateProduct: () => Promise<void>;
  isLoadingUpdateProduct: boolean;
}

export const ConfirmationChangeInventoryPriceModal = ({
  open,
  onClose,
  handleUpdateProduct,
  isLoadingUpdateProduct,
}: ConfirmationChangeInventoryPriceModalProps) => {
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="価格変更を保存"
      message="商品マスタの価格は変更されません。\n
      また、商品マスタの価格を変更しても在庫ごとの価格は変更されなくなります。"
      confirmButtonText="保存"
      onConfirm={handleUpdateProduct}
      cancelButtonText="キャンセル"
      onCancel={onClose}
      isLoading={isLoadingUpdateProduct}
    />
  );
};
