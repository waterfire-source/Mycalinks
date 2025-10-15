'use client';

import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  CustomerReservationReceptionType,
  defaultModalState,
  ModalState,
  ModalType,
  ReceptionType,
  useFetchCustomerReservationReception,
} from '@/feature/booking';
import { CustomerReceptionsSearch } from '@/feature/booking/component/bookingList/CustomerReceptionsSearch';
import { CustomerReceptionsTable } from '@/feature/booking/component/bookingList/CustomerReceptionsTable';
import { CustomerReceptionsDetail } from '@/feature/booking/component/bookingList/detail/CustomerReceptionsDetail';
import { CancelReceptionModal } from '@/feature/booking/component/common/cancelReceptionModal/CancelReceptionModal';
import { Store } from '@prisma/client';
import { useCustomer } from '@/feature/customer/hooks/useCustomer';

type Props = {
  store: Store;
};
export const CustomerReceptionsList = ({ store }: Props) => {
  const [selectedReception, setSelectedReception] =
    useState<CustomerReservationReceptionType | null>(null);
  const [selectedReservations, setSelectedReservations] = useState<
    ReceptionType[]
  >([]);
  const [modalState, setModalState] = useState<ModalState>(defaultModalState);

  const handleCloseModal = () => {
    setModalState(defaultModalState);
  };

  const handleClickTableRow = (
    item: CustomerReservationReceptionType | null,
  ) => {
    setSelectedReception(item);
  };
  const {
    receptions,
    fetchCustomerReservationReception,
    isLoading,
    searchState,
    setSearchState,
  } = useFetchCustomerReservationReception();
  const [searchInput, setSearchInput] = useState('');
  const { customer, resetCustomer, fetchCustomerByMycaID } = useCustomer();

  const handleResetSearch = () => {
    resetCustomer();
    setSearchState({});
    setSearchInput('');
  };
  useEffect(() => {
    if (!customer) return;
    setSearchState((prev) => ({
      ...prev,
      customerId: customer.id,
    }));
  }, [customer]);

  useEffect(() => {
    fetchCustomerReservationReception(store.id);
  }, [store.id]);

  useEffect(() => {
    fetchCustomerReservationReception(store.id);
  }, [searchState, store.id]);

  return (
    <>
      <CancelReceptionModal
        storeId={store.id}
        open={modalState.isOpen && modalState.status === ModalType.Cancel}
        onClose={handleCloseModal}
        selectedReservations={selectedReservations}
      />
      <CustomerReceptionsSearch
        store={store}
        fetchCustomerByMycaID={fetchCustomerByMycaID}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setSearchState={setSearchState}
        handleResetSearch={handleResetSearch}
      />

      <Grid
        container
        spacing={2}
        sx={{ height: '100%', overflow: 'hidden', mt: 1 }}
      >
        <Grid item xs={8} sx={{ height: '100%' }}>
          <CustomerReceptionsTable
            receptions={receptions}
            selectedReception={selectedReception}
            handleClickTableRow={handleClickTableRow}
            isLoading={isLoading}
          />
        </Grid>

        <Grid item xs={4} sx={{ height: '100%' }}>
          <CustomerReceptionsDetail
            storeId={store.id}
            selectedReception={selectedReception}
            setModalState={setModalState}
            selectedReservations={selectedReservations}
            setSelectedReservations={setSelectedReservations}
          />
        </Grid>
      </Grid>
    </>
  );
};
