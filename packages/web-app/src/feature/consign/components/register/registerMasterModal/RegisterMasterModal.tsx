import React, { useMemo, useState } from 'react';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { ItemAPI } from '@/api/frontend/item/api';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { RegisterMasterForm } from '@/feature/consign/components/register/registerMasterModal/RegisterMasterForm';
import { RegisterItemFormData } from '@/app/auth/(dashboard)/item/components/ItemRegisterModal';

interface Props {
  open: boolean;
  onClose: () => void;
  onCloseUnregisteredProductModal: () => void;
  setIsRefetchItem: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ItemRegisterModal: React.FC<Props> = ({
  open,
  onClose,
  onCloseUnregisteredProductModal,
  setIsRefetchItem,
}) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterItemFormData>({
    order_number: 0,
  });

  // 送信できる状態かどうか
  const isFormValid = useMemo(() => {
    return Boolean(
      formData.display_name && formData.category_id, // それ以外については、部門選択も必須
    );
  }, [formData]);

  //登録
  const handleSubmit = async () => {
    setIsLoading(true);
    const requestData: ItemAPI['create']['request'] = {
      storeID: store.id,
      ...formData,
    };

    const response = await clientAPI.item.create(requestData);
    setIsLoading(false);
    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }

    setAlertState({
      message: '商品登録しました。',
      severity: 'success',
    });

    // フォームをリセット
    setFormData({
      order_number: 0,
    });

    setIsRefetchItem(true);

    // モーダルを閉じる
    onClose();
    onCloseUnregisteredProductModal();
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="独自商品マスタ作成"
      width="90%"
      height="90%"
      actionButtonText="商品マスタ登録"
      onActionButtonClick={handleSubmit}
      isAble={isFormValid}
      loading={isLoading}
      onCancelClick={onClose}
      cancelButtonText="新規商品マスタ登録をやめる"
    >
      <RegisterMasterForm
        formData={formData}
        setFormData={setFormData}
        onClose={onClose}
      />
    </CustomModalWithIcon>
  );
};
