import { AddSpecialPriceStockModalContent } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/AddSpecialPriceStockModalContent';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useTransferToSpecialPriceProduct } from '@/feature/products/hooks/useTransferToSpecialPriceProduct';
import { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchAllProducts?: () => Promise<void>;
}

export interface TransferInfo {
  itemCount?: number;
  sellPrice?: number;
  specificAutoSellPriceAdjustment?: string;
  forceNoPriceLabel?: boolean;
}

export const AddSpecialPriceStockModal = ({
  isOpen,
  setIsAddModalOpen,
  fetchAllProducts,
}: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [productId, setProductId] = useState<number>();
  const [transferInfo, setTransferInfo] = useState<TransferInfo>();
  const { transferToSpecialPriceProduct } = useTransferToSpecialPriceProduct();
  const { setAlertState } = useAlert();
  const [isSelectedReset, setIsSelectedReset] = useState<boolean>(false);
  const { store } = useStore();
  const handleClose = () => {
    setIsAddModalOpen(false);
    setTransferInfo(undefined);
  };
  const handleUpdate = async () => {
    try {
      setLoading(true);

      if (!productId) {
        setAlertState({
          message: `商品が選択されていません`,
          severity: 'error',
        });
        return;
      }

      if (!transferInfo?.itemCount) {
        setAlertState({
          message: `特価指定数を入力してください`,
          severity: 'error',
        });
        return;
      }

      if (!transferInfo?.sellPrice) {
        setAlertState({
          message: `特価価格を入力してください`,
          severity: 'error',
        });
        return;
      }

      const res = await transferToSpecialPriceProduct(store.id, productId, {
        itemCount: transferInfo?.itemCount,
        sellPrice: transferInfo?.sellPrice,
        specificAutoSellPriceAdjustment:
          transferInfo?.specificAutoSellPriceAdjustment,
        forceNoPriceLabel: transferInfo?.forceNoPriceLabel,
      });

      if (res.success) {
        if (fetchAllProducts) {
          await fetchAllProducts();
        }

        setIsSelectedReset(true);
        setTransferInfo(undefined);
      } else {
        setIsSelectedReset(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSelectedReset) {
      setIsSelectedReset(false);
    }
  }, [isSelectedReset, setIsSelectedReset]);
  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={handleClose}
      title="新規特価在庫作成"
      onActionButtonClick={handleUpdate}
      actionButtonText={'特価在庫を作成'}
      cancelButtonText={'特価在庫作成をやめる'}
      width="95%"
      height="85%"
      loading={loading}
    >
      <AddSpecialPriceStockModalContent
        transferInfo={transferInfo}
        setTransferInfo={setTransferInfo}
        setProductId={setProductId}
        isSelectedReset={isSelectedReset}
      />
    </CustomModalWithIcon>
  );
};
