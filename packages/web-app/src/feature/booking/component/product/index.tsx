'use client';

import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  defaultModalState,
  ModalState,
  ReservationsSearchState,
  ReservationType,
} from '@/feature/booking';
import { ReservationProductSearch } from '@/feature/booking/component/product/ProductSearch';
import { ReservationProductTabTable } from '@/feature/booking/component/product/ProductTabTable';
import { ReservationProductDetail } from '@/feature/booking/component/product/detail/ProductDetail';
import { ConfirmUpdateReservationModal } from '@/feature/booking/component/product/modal/ConfirmUpdateReservationModal';
import { ReservationStatusModal } from '@/feature/booking/component/product/modal/reservationStatusModal/ReservationStatusModal';
import { EditReservationModal } from '@/feature/booking/component/product/modal/EditReservationModal';
import { Store } from '@prisma/client';

type Props = {
  store: Store;
  reservations: ReservationType[];
  totalCount: number;
  fetchReservation: (storeId: number) => Promise<void>;
  isLoading: boolean;
  searchState: ReservationsSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ReservationsSearchState>>;
};
export const ReservationProduct = ({
  store,
  reservations,
  totalCount,
  fetchReservation,
  isLoading,
  searchState,
  setSearchState,
}: Props) => {
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationType | null>(null);
  const [modalState, setModalState] = useState<ModalState>(defaultModalState);
  const [isOpenReservationStatusModal, setIsOpenReservationStatusModal] =
    useState(false);
  const [isOpenEditReservationModal, setIsOpenEditReservationModal] =
    useState(false);

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleOpenReservationStatusModal = () => {
    setIsOpenReservationStatusModal(true);
  };
  const handleCloseReservationStatusModal = () => {
    setIsOpenReservationStatusModal(false);
  };

  const handleOpenEditReservationModal = () => {
    setIsOpenEditReservationModal(true);
  };
  const handleCloseEditReservationModal = () => {
    setIsOpenEditReservationModal(false);
  };

  const handleClickTableRow = (item: ReservationType | null) => {
    setSelectedReservation(item);
  };

  const reFetchAndSelectReset = () => {
    setSelectedReservation(null);
    fetchReservation(store.id);
  };

  useEffect(() => {
    fetchReservation(store.id);
  }, [store.id]);

  useEffect(() => {
    fetchReservation(store.id);
  }, [searchState, store.id]);

  return (
    <>
      <ConfirmUpdateReservationModal
        storeId={store.id}
        reservationId={selectedReservation?.id}
        onClose={handleCloseModal}
        modalState={modalState}
        reFetchAndSelectReset={reFetchAndSelectReset}
        handleCloseReservationStatusModal={handleCloseReservationStatusModal}
        handleCloseEditReservationModal={handleCloseEditReservationModal}
      />
      <ReservationStatusModal
        storeId={store.id}
        open={isOpenReservationStatusModal}
        onClose={handleCloseReservationStatusModal}
        store={store}
        modalState={modalState}
        setModalState={setModalState}
        selectedReservation={selectedReservation}
        isLoadingFetchReservation={isLoading}
        fetchReservation={fetchReservation}
      />
      <EditReservationModal
        open={isOpenEditReservationModal}
        onClose={handleCloseEditReservationModal}
        storeId={store.id}
        selectedReservation={selectedReservation}
        setModalState={setModalState}
        reFetchAndSelectReset={reFetchAndSelectReset}
      />

      <ReservationProductSearch
        searchState={searchState}
        setSearchState={setSearchState}
      />

      <Grid
        container
        spacing={2}
        sx={{ height: '100%', overflow: 'hidden', mt: 1 }}
      >
        <Grid item xs={8} sx={{ height: '100%', display: 'flex' }}>
          <ReservationProductTabTable
            reservations={reservations}
            selectedReservation={selectedReservation}
            handleClickTableRow={handleClickTableRow}
            isLoading={isLoading}
            searchTotalCount={totalCount}
            searchState={searchState}
            setSearchState={setSearchState}
          />
        </Grid>

        <Grid item xs={4} sx={{ height: 'calc(100% - 40px)', mt: '40px' }}>
          <ReservationProductDetail
            storeId={store.id}
            selectedReservation={selectedReservation}
            setModalState={setModalState}
            handleOpenReservationStatusModal={handleOpenReservationStatusModal}
            handleOpenEditReservationModal={handleOpenEditReservationModal}
          />
        </Grid>
      </Grid>
    </>
  );
};
