import { HelpIcon } from '@/components/common/HelpIcon';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import {
  defaultReceptionsSearchState,
  ModalState,
  ModalType,
  ReceptionsSearchState,
  ReceptionStatus,
  ReservationReceptionType,
  ReservationType,
  useFetchReservationReception,
} from '@/feature/booking';
import { CancelReceptionModal } from '@/feature/booking/component/common/cancelReceptionModal/CancelReceptionModal';
import { CreateReceptionByReservationModal } from '@/feature/booking/component/common/createReceptionModal/CreateReceptionByReservationModal';
import { CreateReceptionUserModal } from '@/feature/booking/component/common/CreateReceptionUserModal';
import { ReceptionDetailModal } from '@/feature/booking/component/product/modal/ReceptionDetailModal';
import { ReservationStatusItemTable } from '@/feature/booking/component/product/modal/reservationStatusModal/ReservationStatusItemTable';
import { ReservationStatusReceptionTable } from '@/feature/booking/component/product/modal/reservationStatusModal/ReservationStatusReceptionTable';
import {
  CustomerType,
  useCustomer,
} from '@/feature/customer/hooks/useCustomer';
import { Box } from '@mui/material';
import { ReservationStatus, Store } from '@prisma/client';
import { useEffect, useState } from 'react';

interface Props {
  storeId: number;
  open: boolean;
  onClose: () => void;
  store: Store;
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  selectedReservation: ReservationType | null;
  isLoadingFetchReservation: boolean;
  fetchReservation: (storeId: number) => Promise<void>;
}

export const ReservationStatusModal = ({
  storeId,
  open,
  onClose,
  store,
  modalState,
  setModalState,
  selectedReservation,
  isLoadingFetchReservation,
  fetchReservation,
}: Props) => {
  const [selectedReception, setSelectedReception] =
    useState<ReservationReceptionType | null>(null);
  const [isOpenReceptionDetailModal, setIsOpenReceptionDetailModal] =
    useState(false);
  const [isOpenCreateReceptionUserModal, setIsOpenCreateReceptionUserModal] =
    useState(false);
  const [isOpenCreateReceptionModal, setIsOpenCreateReceptionModal] =
    useState(false);
  const [receptionsSearchState, setReceptionsSearchState] =
    useState<ReceptionsSearchState>(defaultReceptionsSearchState);
  const [reservationCustomer, setReservationCustomer] = useState<
    CustomerType | undefined
  >(undefined);

  const handleOpenReceptionDetailModal = (
    reception: ReservationReceptionType,
  ) => {
    setSelectedReception(reception);
    setIsOpenReceptionDetailModal(true);
  };

  const handleCloseCreateReceptionUserModal = () => {
    setIsOpenCreateReceptionUserModal(false);
    setReservationCustomer(undefined);
  };

  const { customer, resetCustomer, fetchCustomerByMycaID } = useCustomer();

  const { receptions, fetchReservationReception, isLoading } =
    useFetchReservationReception();

  const handleCloseModal = () => {
    resetCustomer();
    setReceptionsSearchState(defaultReceptionsSearchState);
    onClose();
  };

  const handleChangeReservationId = (newValue: number) => {
    setReceptionsSearchState((prev) => ({
      ...prev,
      reservationId: newValue,
    }));
  };

  const handleChangeCustomerName = (newValue: string) => {
    setReceptionsSearchState((prev) => ({
      ...prev,
      customerName: newValue,
    }));
  };

  const handleChangeStatus = (newValue: ReceptionStatus) => {
    setReceptionsSearchState((prev) => ({
      ...prev,
      status: newValue,
    }));
  };

  const handleResetSearch = () => {
    setReceptionsSearchState((prev) => ({
      ...prev,
      reservationId: undefined,
      customerId: undefined,
      customerName: undefined,
      status: ReceptionStatus.ALL,
    }));
  };

  const handleChangeOrderBy = (newValue: string) => {
    setReceptionsSearchState((prev) => ({
      ...prev,
      orderBy: newValue,
    }));
  };

  const handleCancelAfterAction = () => {
    setIsOpenReceptionDetailModal(false);
    if (selectedReservation) {
      fetchReservationReception(store.id, selectedReservation.id, true);
    }
    fetchReservation(store.id);
  };

  useEffect(() => {
    if (selectedReservation) {
      fetchReservationReception(store.id, selectedReservation.id, true);
    }
  }, [open, store.id, selectedReservation]);

  useEffect(() => {
    if (customer) {
      setReceptionsSearchState((prev) => ({
        ...prev,
        customerId: customer.id,
      }));
    }
  }, [customer]);

  return (
    <>
      <ReceptionDetailModal
        storeId={storeId}
        open={isOpenReceptionDetailModal}
        onClose={() => setIsOpenReceptionDetailModal(false)}
        selectedReservation={selectedReservation}
        reception={selectedReception}
        setModalState={setModalState}
        isOpenReservation={
          selectedReservation?.status === ReservationStatus.OPEN
        }
      />

      <CreateReceptionUserModal
        open={isOpenCreateReceptionUserModal}
        onClose={handleCloseCreateReceptionUserModal}
        store={store}
        setCustomer={setReservationCustomer}
        handleOpenCreateReceptionModal={() =>
          setIsOpenCreateReceptionModal(true)
        }
      />
      {selectedReservation && (
        <CreateReceptionByReservationModal
          open={isOpenCreateReceptionModal}
          onClose={() => setIsOpenCreateReceptionModal(false)}
          store={store}
          customer={reservationCustomer}
          selectedReservation={selectedReservation}
        />
      )}

      <CancelReceptionModal
        open={modalState.isOpen && modalState.status === ModalType.Cancel}
        onClose={() => setModalState({ isOpen: true, status: ModalType.Idle })}
        customerId={selectedReception?.customer_id}
        storeId={storeId}
        reservationId={selectedReception?.reservation_id}
        reservationReceptionId={selectedReception?.reservation_reception_id}
        handleCancelAfterAction={handleCancelAfterAction}
      />

      <CustomModalWithIcon
        open={open}
        onClose={handleCloseModal}
        title="予約状況確認"
        width="90%"
        height="90%"
        secondActionButtonText={
          selectedReservation?.status !== ReservationStatus.CLOSED
            ? '受付終了'
            : undefined
        }
        secondCustomActionButton={
          selectedReservation?.status !== ReservationStatus.CLOSED ? (
            <HelpIcon helpArchivesNumber={2930} />
          ) : undefined
        }
        onSecondActionButtonClick={() =>
          setModalState({ isOpen: true, status: ModalType.ToClose })
        }
        actionButtonText={
          selectedReservation?.status !== ReservationStatus.CLOSED
            ? '予約受付'
            : undefined
        }
        onActionButtonClick={() => setIsOpenCreateReceptionUserModal(true)}
        cancelButtonText="閉じる"
        onCancelClick={handleCloseModal}
      >
        <ReservationStatusItemTable
          selectedReservation={selectedReservation}
          isLoading={isLoadingFetchReservation}
        />
        <Box
          display="flex"
          height="calc(100% - 190px)"
          mt={3}
          sx={{ overflow: 'auto' }}
        >
          <ReservationStatusReceptionTable
            receptions={receptions}
            isLoading={isLoading}
            handleOpenReceptionDetailModal={handleOpenReceptionDetailModal}
            store={store}
            fetchCustomerByMycaID={fetchCustomerByMycaID}
            receptionsSearchState={receptionsSearchState}
            handleChangeReservationId={handleChangeReservationId}
            handleChangeCustomerName={handleChangeCustomerName}
            handleChangeStatus={handleChangeStatus}
            handleChangeOrderBy={handleChangeOrderBy}
            handleResetSearch={handleResetSearch}
          />
        </Box>
      </CustomModalWithIcon>
    </>
  );
};
