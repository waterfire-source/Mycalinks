import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ModalState,
  ModalType,
  PutReservationRequestBody,
  ReservationsFormState,
  ReservationType,
  useUpdateReservation,
} from '@/feature/booking';
import { useReservationFormValidation } from '@/feature/booking/hooks/useReservationFormValidation';
import { EditReservationTable } from '@/feature/booking/component/product/modal/createOrEditReservationModal/EditReservationTable';
import { Box } from '@mui/material';
import { CreateOrEditReservationModalForm } from '@/feature/booking/component/product/modal/createOrEditReservationModal/CreateOrEditReservationModalForm';
import { createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: number;
  selectedReservation: ReservationType | null;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  reFetchAndSelectReset: () => void;
}

export const EditReservationModal = ({
  open,
  onClose,
  storeId,
  selectedReservation,
  setModalState,
  reFetchAndSelectReset,
}: Props) => {
  const clientAPI = createClientAPI();
  const { setAlertState } = useAlert();
  const [isLoadingUpdateItem, setIsLoadingUpdateItem] = useState(false);

  const defaultFormData = useMemo(() => {
    return {
      item_sell_price: selectedReservation?.product.item.sell_price ?? 0,
      item_release_date: selectedReservation?.product.item.release_date ?? null,
      limit_count: selectedReservation?.limit_count,
      limit_count_per_user: selectedReservation?.limit_count_per_user,
      start_at: selectedReservation?.start_at,
      end_at: selectedReservation?.end_at,
      deposit_price: selectedReservation?.deposit_price,
      remaining_price: selectedReservation?.remaining_price,
      description: selectedReservation?.description,
    };
  }, [selectedReservation]);

  const [formData, setFormData] =
    useState<ReservationsFormState>(defaultFormData);
  const { errors, validate, setErrors } = useReservationFormValidation();

  useEffect(() => {
    setFormData(defaultFormData);
  }, [defaultFormData]);

  const handleCloseModal = useCallback(() => {
    setFormData(defaultFormData);
    setErrors({});
    onClose();
  }, [defaultFormData]);

  const updateItem = useCallback(async () => {
    setIsLoadingUpdateItem(true);
    if (!selectedReservation) return;
    try {
      await clientAPI.item.update({
        storeID: storeId,
        itemID: selectedReservation?.product.item_id,
        body: {
          sell_price: formData.item_sell_price,
          release_date: formData.item_release_date,
        },
      });
      setAlertState({
        message: '情報の更新が完了しました',
        severity: 'success',
      });
    } catch (error) {
      console.error('更新失敗', error);
      setAlertState({
        message: '情報の更新に失敗しました',
        severity: 'error',
      });
    } finally {
      setIsLoadingUpdateItem(false);
    }
  }, [clientAPI, setAlertState, storeId, selectedReservation, formData]);

  const { updateReservation, isLoading } = useUpdateReservation();

  const handleUpdateReservation = useCallback(async () => {
    if (!validate(formData)) return;
    if (!selectedReservation) return;

    const requestBody: PutReservationRequestBody = {
      limit_count: formData.limit_count as number,
      limit_count_per_user: formData.limit_count_per_user as number,
      start_at: formData.start_at ?? null,
      end_at: formData.end_at ?? null,
      deposit_price: formData.deposit_price as number,
      remaining_price: formData.remaining_price as number,
      description: formData.description,
    };
    try {
      await updateReservation(storeId, selectedReservation.id, requestBody);

      if (
        formData.item_sell_price !== defaultFormData.item_sell_price ||
        formData.item_release_date !== defaultFormData.item_release_date
      ) {
        await updateItem();
      }

      handleCloseModal();
      reFetchAndSelectReset();
    } catch (error) {
      console.error('予約更新に失敗しました', error);
    }
  }, [
    validate,
    formData,
    selectedReservation,
    updateReservation,
    storeId,
    defaultFormData.item_sell_price,
    defaultFormData.item_release_date,
    handleCloseModal,
    reFetchAndSelectReset,
    updateItem,
  ]);

  return (
    <CustomModalWithIcon
      open={open}
      onClose={handleCloseModal}
      title="予約編集"
      width="90%"
      height="90%"
      loading={isLoading || isLoadingUpdateItem}
      actionButtonText="編集内容を保存"
      onActionButtonClick={handleUpdateReservation}
      cancelButtonText="編集内容を破棄"
      onCancelClick={handleCloseModal}
      secondActionButtonText="削除"
      onSecondActionButtonClick={() =>
        setModalState({
          isOpen: true,
          status: ModalType.Delete,
        })
      }
    >
      <EditReservationTable
        selectedReservation={selectedReservation}
        formData={formData}
        setFormData={setFormData}
      />
      <Box
        ml={8}
        my="auto"
        display="flex"
        height="calc(100% - 170px)"
        alignItems="center"
      >
        <CreateOrEditReservationModalForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
        />
      </Box>
    </CustomModalWithIcon>
  );
};
