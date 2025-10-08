import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { Dispatch, SetStateAction } from 'react';
import { StoreAPI } from '@/api/frontend/store/api';

interface Props {
  open: boolean;
  onClose: () => void;
  deliveryMethodId?: number;

  setSelectedDeliveryMethod: Dispatch<
    SetStateAction<StoreAPI['updateShippingMethod']['request']['body'] | null>
  >;
  fetchDeliveryMethods: (storeID: number, includesFeeDefs?: boolean) => void;
}

export const DeleteDeliveryMethodModal = ({
  open,
  onClose,
  deliveryMethodId,
  setSelectedDeliveryMethod,
  fetchDeliveryMethods,
}: Props) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();

  const onConfirm = async () => {
    if (!deliveryMethodId) {
      setAlertState({
        message: '配送方法が選択されていません',
        severity: 'error',
      });
      return;
    }
    const res = await clientAPI.store.deleteShippingMethod({
      storeId: store.id,
      shippingMethodId: deliveryMethodId,
    });
    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}: ${res.message}`,
        severity: 'error',
      });
      return;
    }
    setAlertState({
      message: '配送方法を削除しました',
      severity: 'success',
    });
    setSelectedDeliveryMethod(null);
    fetchDeliveryMethods(store.id, true);
    onClose();
  };

  return (
    <>
      <ConfirmationDialog
        open={open}
        onClose={onClose}
        title="配送方法削除"
        message="以降の注文で運搬不可になります。本当に削除しますか？"
        onConfirm={onConfirm}
        confirmButtonText="削除する"
      />
    </>
  );
};
