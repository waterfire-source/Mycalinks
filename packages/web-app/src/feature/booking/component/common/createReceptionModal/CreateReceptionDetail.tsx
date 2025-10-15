import { DetailCard } from '@/components/cards/DetailCard';
import { ReservationType } from '@/feature/booking';
import { CreateReceptionDetailContent } from '@/feature/booking/component/common/createReceptionModal/CreateReceptionDetailContent';

interface Props {
  selectedReservations: (ReservationType & {
    itemCount: number;
  })[];
  handleUpdateItemCount: (
    newCount: number,
    reservation: ReservationType,
  ) => void;
  handleRemoveProduct: (reservation: ReservationType) => void;
}

export const CreateReceptionDetail = ({
  selectedReservations,
  handleUpdateItemCount,
  handleRemoveProduct,
}: Props) => {
  return (
    <DetailCard
      title="予約詳細"
      content={
        <CreateReceptionDetailContent
          selectedReservations={selectedReservations}
          handleUpdateItemCount={handleUpdateItemCount}
          handleRemoveProduct={handleRemoveProduct}
        />
      }
    />
  );
};
