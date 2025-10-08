'use client';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { ReservationProduct } from '@/feature/booking/component/product';
import { ReservationProductUpperButtons } from '@/feature/booking/component/common';
import { useStore } from '@/contexts/StoreContext';
import { useFetchReservation } from '@/feature/booking';
import { CircularProgress } from '@mui/material';

const ProductPage = () => {
  const { store } = useStore();
  const {
    reservations,
    totalCount,
    fetchReservation,
    isLoading,
    searchState,
    setSearchState,
  } = useFetchReservation({});
  return (
    <ContainerLayout
      title="予約商品"
      helpArchivesNumber={3003}
      isFullWidthTitle={false}
      actions={
        <ReservationProductUpperButtons
          store={store}
          fetchReservation={fetchReservation}
        />
      }
    >
      {!store ? (
        <CircularProgress />
      ) : (
        <ReservationProduct
          store={store}
          reservations={reservations}
          totalCount={totalCount}
          fetchReservation={fetchReservation}
          isLoading={isLoading}
          searchState={searchState}
          setSearchState={setSearchState}
        />
      )}
    </ContainerLayout>
  );
};

export default ProductPage;
