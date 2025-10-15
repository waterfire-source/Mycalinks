import { DetailCard } from '@/components/cards/DetailCard';
import {
  ReservationType,
  ReservationStatusLabelMap,
  ModalState,
} from '@/feature/booking';
import { ReservationProductDetailBottom } from '@/feature/booking/component/product/detail/ProductDetailBottom';
import { ReservationProductDetailContent } from '@/feature/booking/component/product/detail/ProductDetailContent';
import { useMemo } from 'react';

interface Props {
  storeId: number;
  selectedReservation: ReservationType | null;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  handleOpenReservationStatusModal: () => void;
  handleOpenEditReservationModal: () => void;
}

export const ReservationProductDetail = ({
  storeId,
  selectedReservation,
  setModalState,
  handleOpenReservationStatusModal,
  handleOpenEditReservationModal,
}: Props) => {
  const bottomContent = useMemo(() => {
    return (
      <ReservationProductDetailBottom
        selectedReservation={selectedReservation}
        setModalState={setModalState}
        handleOpenReservationStatusModal={handleOpenReservationStatusModal}
        handleOpenEditReservationModal={handleOpenEditReservationModal}
      />
    );
  }, [
    handleOpenEditReservationModal,
    handleOpenReservationStatusModal,
    selectedReservation,
    setModalState,
  ]);

  return (
    <DetailCard
      title={`予約詳細${selectedReservation ? ` (${ReservationStatusLabelMap[selectedReservation.status]})` : ''}`}
      content={
        <ReservationProductDetailContent
          storeId={storeId}
          selectedReservation={selectedReservation}
        />
      }
      bottomContent={bottomContent}
    />
  );
};
