import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import {
  ModalState,
  ModalType,
  useDeleteReservation,
  useUpdateReservation,
} from '@/feature/booking';
import { ReservationStatus } from '@prisma/client';
import { useMemo } from 'react';

interface Props {
  storeId: number;
  reservationId?: number;
  onClose: () => void;
  modalState: ModalState;
  reFetchAndSelectReset: () => void;
  handleCloseReservationStatusModal: () => void;
  handleCloseEditReservationModal: () => void;
}

export const ConfirmUpdateReservationModal = ({
  storeId,
  reservationId,
  onClose,
  modalState,
  reFetchAndSelectReset,
  handleCloseReservationStatusModal,
  handleCloseEditReservationModal,
}: Props) => {
  const { updateReservation, isLoading: isUpdating } = useUpdateReservation();
  const { deleteReservation, isLoading: isDeleting } = useDeleteReservation();

  const onPrimaryButtonClick = async (status: ReservationStatus) => {
    if (!reservationId) return;
    const result = await updateReservation(storeId, reservationId, {
      status,
    });

    if (result) {
      onClose();
      reFetchAndSelectReset();
      if (modalState.status === ModalType.ToClose) {
        handleCloseReservationStatusModal();
      }
    }
  };
  const handleDeleteReservation = async () => {
    if (!reservationId) return;
    await deleteReservation(storeId, reservationId);
    onClose();
    handleCloseEditReservationModal();
    reFetchAndSelectReset();
  };

  const {
    modalTitle,
    modalMassage,
    modalActionButtonText,
    modalOnActionButtonClick,
  } = useMemo(() => {
    switch (modalState.status) {
      case ModalType.ToStart:
        return {
          modalTitle: '予約受付開始',
          modalMassage: `受付開始後は予約内容の編集・削除ができません。\\n 
            開始しますか？`,
          modalActionButtonText: '開始',
          modalOnActionButtonClick: () =>
            onPrimaryButtonClick(ReservationStatus.OPEN),
        };

      case ModalType.ToClose:
        return {
          modalTitle: '予約受付終了',
          modalMassage: `再開するまで予約を受け付けることができなくなります。\\n 
            受付を終了しますか？`,
          modalActionButtonText: '終了',
          modalOnActionButtonClick: () =>
            onPrimaryButtonClick(ReservationStatus.CLOSED),
        };

      case ModalType.ToReStart:
        return {
          modalTitle: '予約受付再開',
          modalMassage:
            '予約受付中は商品の受け渡しができなくなります。\\n 予約を再開しますか？',
          modalActionButtonText: '再開',
          modalOnActionButtonClick: () =>
            onPrimaryButtonClick(ReservationStatus.OPEN),
        };
      case ModalType.Delete:
        return {
          modalTitle: '予約を削除',
          modalMassage: `作成した内容が失われます。\\n 
            本当に削除しますか？`,
          modalActionButtonText: '削除',
          modalOnActionButtonClick: handleDeleteReservation,
        };

      default:
        return {
          modalTitle: '予約受付開始',
          modalMassage: `作成した内容が失われます。\\n 
            本当に削除しますか？`,
          modalActionButtonText: '開始',
          modalOnActionButtonClick: () =>
            onPrimaryButtonClick(ReservationStatus.OPEN),
        };
    }
  }, [modalState.status]);

  return (
    <ConfirmationDialog
      open={
        modalState.isOpen &&
        (modalState.status === ModalType.ToStart ||
          modalState.status === ModalType.ToClose ||
          modalState.status === ModalType.ToReStart ||
          modalState.status === ModalType.Delete)
      }
      onClose={onClose}
      onConfirm={modalOnActionButtonClick}
      title={modalTitle}
      message={modalMassage}
      confirmButtonText={modalActionButtonText}
      cancelButtonText="キャンセル"
      isLoading={isUpdating || isDeleting}
    />
  );
};
