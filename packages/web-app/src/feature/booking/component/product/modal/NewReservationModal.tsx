import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ModalState,
  ModalType,
  ReservationsFormState,
} from '@/feature/booking';
import { SelectOrCreateMycaItemsModal } from '@/feature/booking/component/product/modal/selectOrCreateMycaItemsModal';
import { CreateReservationModal } from '@/feature/booking/component/product/modal/createOrEditReservationModal';
import { ItemAPI, ItemAPIRes } from '@/api/frontend/item/api';
import { useReservationFormValidation } from '@/feature/booking/hooks/useReservationFormValidation';
import {
  PostReservationRequestBody,
  useCreateReservation,
} from '@/feature/booking/hooks/useCreateReservation';
import { useUpdateItem } from '@/feature/item/hooks/useUpdateItem';
import { formatApiResponseToFormattedItem } from '@/components/dataGrid/RightClickDataGrid';
import { CreateItemModal } from '@/feature/booking/component/product/modal/createItemModal';
import { RegisterItemFormData } from '@/app/auth/(dashboard)/item/components/ItemRegisterModal';
import { useCreateItems } from '@/feature/item/hooks/useCreateItems';
import { useAlert } from '@/contexts/AlertContext';
import { SelectOneselfItemsModal } from '@/feature/booking/component/product/modal/selectOneselfItems';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  onClose: () => void;
  storeId: number;
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  fetchReservation?: (storeId: number) => Promise<void>;
}

export const NewReservationModal = ({
  onClose,
  storeId,
  modalState,
  setModalState,
  fetchReservation,
}: Props) => {
  const { setAlertState } = useAlert();
  // 予約対象のアイテム
  const [targetItemId, setTargetItemId] = useState<number | null>(null);
  const [targetItem, setTargetItem] = useState<ItemAPIRes['get']['items'][0]>();
  // 予約対象のプロダクト（新品のみ）
  const [targetProduct, setTargetProduct] =
    useState<ItemAPIRes['get']['items'][0]['products'][0]>();

  const defaultFormData = useMemo(() => {
    return {
      item_sell_price: targetProduct?.specific_sell_price ?? 0,
      item_release_date: targetItem?.release_date ?? null,
      limit_count: undefined,
      limit_count_per_user: undefined,
      start_at: undefined,
      end_at: undefined,
      deposit_price: undefined,
      remaining_price: undefined,
      description: undefined,
    };
  }, [targetItem]);
  const [formData, setFormData] =
    useState<ReservationsFormState>(defaultFormData);
  const { errors, validate, setErrors } = useReservationFormValidation();

  useEffect(() => {
    setFormData(defaultFormData);
  }, [defaultFormData]);

  // 独自商品追加
  const { createItem, isLoading: isLoadingCreateItem } = useCreateItems();
  const [formDataItem, setFormDataItem] = useState<RegisterItemFormData>({
    order_number: 0,
  });

  const isFormValid = useMemo(() => {
    return Boolean(formDataItem.display_name && formDataItem.category_id);
  }, [formDataItem]);

  const handleChangeModalState = (modalType: ModalType) => {
    setModalState((prev) => ({
      ...prev,
      status: modalType,
    }));
  };

  const handleOpenCreateOrEditReservationModal = async (
    posItemId?: number,
    mycaItemId?: number,
  ) => {
    let targetId = posItemId;

    // 選択したMycaアイテムがPOSに登録されていなければmyca_item_idで商品マスタ登録
    if (!targetId) {
      const requestData: ItemAPI['create']['request'] = {
        storeID: storeId,
        order_number: 0,
        myca_item_id: mycaItemId,
      };

      const res = await createItem(requestData);
      if (!res) return;

      targetId = res.id;
    }

    if (targetId) {
      setTargetItemId(targetId);
    }

    handleChangeModalState(ModalType.Create);
  };

  const handleCloseModal = useCallback(async () => {
    setFormData(defaultFormData);
    setFormDataItem({
      order_number: 0,
    });
    setErrors({});
    onClose();
  }, [defaultFormData, onClose, setErrors]);

  const handleCreateItem = useCallback(async () => {
    const requestData: ItemAPI['create']['request'] = {
      storeID: storeId,
      ...formDataItem,
    };
    const res = await createItem(requestData);
    if (res) {
      setTargetItemId(res.id);
      setFormDataItem({
        order_number: 0,
      });
      handleChangeModalState(ModalType.Create);
    }
  }, [createItem, formDataItem, storeId]);

  const { createReservation, isLoading: isCreatingReservation } =
    useCreateReservation();
  const { updateItem, isLoading: isLoadingEditPrice } = useUpdateItem();
  const { updateProduct, isLoadingUpdateProduct } = useUpdateProduct();

  const handleCreateReservation = useCallback(async () => {
    if (!validate(formData)) return;
    if (!targetItem || !targetProduct) {
      setAlertState({
        message: '商品情報の取得に失敗しました。',
        severity: 'error',
      });
      return;
    }

    const requestBody: PostReservationRequestBody = {
      product_id: targetProduct.id,
      limit_count: formData.limit_count as number,
      limit_count_per_user: formData.limit_count_per_user as number,
      start_at: formData.start_at ?? null,
      end_at: formData.end_at ?? null,
      deposit_price: formData.deposit_price as number,
      remaining_price: formData.remaining_price as number,
      description: formData.description,
    };
    try {
      const success = await createReservation(storeId, requestBody);

      if (
        formData.item_sell_price !== defaultFormData.item_sell_price ||
        formData.item_release_date !== defaultFormData.item_release_date
      ) {
        const itemToUpdate = {
          ...formatApiResponseToFormattedItem(targetItem),
          releaseDate: formData.item_release_date,
        };

        await updateItem(storeId, itemToUpdate);

        if (formData.item_sell_price) {
          const updateField = {
            specificSellPrice: formData.item_sell_price,
          };
          await updateProduct(storeId, targetProduct.id, updateField);
        }
      }
      if (success) {
        handleCloseModal();
        fetchReservation?.(storeId);
      }
    } catch (error) {
      console.error('予約作成に失敗しました', error);
    }
  }, [
    createReservation,
    defaultFormData.item_release_date,
    defaultFormData.item_sell_price,
    formData,
    setAlertState,
    storeId,
    targetItem,
    targetProduct,
    updateItem,
    validate,
    fetchReservation,
  ]);

  const {
    modalActionButtonText,
    modalOnActionButtonClick,
    modalCancelButtonText,
    modalOnCancelClick,
    isAble,
  } = useMemo(() => {
    switch (modalState.status) {
      case ModalType.SelectMycaItems:
        return {
          modalActionButtonText: undefined,
          modalOnActionButtonClick: undefined,
          modalCancelButtonText: '予約作成をやめる',
          modalOnCancelClick: handleCloseModal,
          isAble: true,
        };

      case ModalType.Create:
        return {
          modalActionButtonText: '予約作成',
          modalOnActionButtonClick: handleCreateReservation,
          modalCancelButtonText: '予約商品選択へ戻る',
          modalOnCancelClick: () =>
            handleChangeModalState(ModalType.SelectMycaItems),
          isAble: !!targetProduct,
        };

      case ModalType.CreateItem:
        return {
          modalActionButtonText: '予約作成に進む',
          modalOnActionButtonClick: handleCreateItem,
          modalCancelButtonText: '予約作成をやめる',
          modalOnCancelClick: handleCloseModal,
          isAble: isFormValid,
        };

      default:
        return {
          modalActionButtonText: undefined,
          modalOnActionButtonClick: undefined,
          modalCancelButtonText: '予約作成をやめる',
          modalOnCancelClick: handleCloseModal,
        };
    }
  }, [
    modalState.status,
    handleCloseModal,
    handleCreateReservation,
    targetProduct,
    handleCreateItem,
    isFormValid,
  ]);

  return (
    <CustomModalWithIcon
      open={
        modalState.isOpen &&
        (modalState.status === ModalType.SelectMycaItems ||
          modalState.status === ModalType.SelectOneselfItems ||
          modalState.status === ModalType.CreateItem ||
          modalState.status === ModalType.Create)
      }
      onClose={handleCloseModal}
      title="新規予約作成"
      titleInfo={<HelpIcon helpArchivesNumber={2917} />}
      width="90%"
      height="90%"
      loading={
        isCreatingReservation ||
        isLoadingEditPrice ||
        isLoadingCreateItem ||
        isLoadingUpdateProduct
      }
      isAble={isAble}
      actionButtonText={modalActionButtonText}
      onActionButtonClick={modalOnActionButtonClick}
      cancelButtonText={modalCancelButtonText}
      onCancelClick={modalOnCancelClick}
    >
      {modalState.status === ModalType.SelectMycaItems && (
        <SelectOrCreateMycaItemsModal
          storeId={storeId}
          handleOpenCreateOrEditReservationModal={
            handleOpenCreateOrEditReservationModal
          }
          handleChangeModalState={handleChangeModalState}
          isLoadingCreateItem={isLoadingCreateItem}
        />
      )}
      {modalState.status === ModalType.SelectOneselfItems && (
        <SelectOneselfItemsModal
          storeId={storeId}
          handleOpenCreateOrEditReservationModal={
            handleOpenCreateOrEditReservationModal
          }
          handleChangeModalState={handleChangeModalState}
          isLoadingCreateItem={isLoadingCreateItem}
        />
      )}
      {modalState.status === ModalType.Create && (
        <CreateReservationModal
          targetItemId={targetItemId}
          targetItem={targetItem}
          setTargetItem={setTargetItem}
          targetProduct={targetProduct}
          setTargetProduct={setTargetProduct}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
        />
      )}
      {modalState.status === ModalType.CreateItem && (
        <CreateItemModal
          storeId={storeId}
          formData={formDataItem}
          setFormData={setFormDataItem}
          handleChangeModalState={handleChangeModalState}
        />
      )}
    </CustomModalWithIcon>
  );
};
