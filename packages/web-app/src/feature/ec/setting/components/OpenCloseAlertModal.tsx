import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const OpenCloseAlertModal = ({ open, onClose }: Props) => {
  const { store, resetStore } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();

  const onConfirm = async () => {
    const res = await clientAPI.store.updateEcSetting({
      storeId: store.id,
      mycalinksEcEnabled: !store.mycalinks_ec_enabled,
    });
    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}: ${res.message}`,
        severity: 'error',
      });
      return;
    }
    setAlertState({
      message: 'ECショップの状態を変更しました',
      severity: 'success',
    });
    resetStore();
    onClose();
  };

  return (
    <>
      {store.mycalinks_ec_enabled ? (
        <ConfirmationDialog
          open={open}
          onClose={onClose}
          title="ECショップ一時閉店"
          message="再度開店するまでの間、全ての出品商品がお客様に表示されなくなります。"
          onConfirm={onConfirm}
          confirmButtonText="閉店する"
        />
      ) : (
        <ConfirmationDialog
          open={open}
          onClose={onClose}
          title="ECショップ開店"
          message="全ての出品商品がお客様に購入可能になります"
          onConfirm={onConfirm}
          confirmButtonText="開店する"
        />
      )}
    </>
  );
};
