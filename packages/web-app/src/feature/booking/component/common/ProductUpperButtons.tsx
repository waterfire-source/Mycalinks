import { Box, Stack } from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useState } from 'react';
import { defaultModalState, ModalState, ModalType } from '@/feature/booking';
import { NewReservationModal } from '@/feature/booking/component/product/modal/NewReservationModal';
import { CreateReceptionUserModal } from '@/feature/booking/component/common/CreateReceptionUserModal';
import { Store } from '@prisma/client';
import { CreateNoAccountQR } from '@/feature/purchaseReception/components/buttons/CreateNoAccountQR';
import { CreateReceptionModal } from '@/feature/booking/component/common/createReceptionModal';
import { CustomerType } from '@/feature/customer/hooks/useCustomer';
import { HelpIcon } from '@/components/common/HelpIcon';

type Props = {
  store: Store;
  canCreate?: boolean;
  fetchReservation?: (storeId: number) => Promise<void>;
};
export const ReservationProductUpperButtons = ({
  store,
  canCreate = true,
  fetchReservation,
}: Props) => {
  const [customer, setCustomer] = useState<CustomerType | undefined>(undefined);
  const [modalState, setModalState] = useState<ModalState>(defaultModalState);
  const [isOpenCreateReceptionModal, setIsOpenCreateReceptionModal] =
    useState(false);

  const handleCloseModal = () => {
    setModalState(defaultModalState);
    setCustomer(undefined);
  };

  const handleOpenCreateReceptionModal = () => {
    setIsOpenCreateReceptionModal(true);
  };

  return (
    <>
      <NewReservationModal
        onClose={handleCloseModal}
        storeId={store.id}
        modalState={modalState}
        setModalState={setModalState}
        fetchReservation={fetchReservation}
      />

      <CreateReceptionUserModal
        open={
          modalState.isOpen && modalState.status === ModalType.CreateReception
        }
        onClose={handleCloseModal}
        store={store}
        setCustomer={setCustomer}
        handleOpenCreateReceptionModal={handleOpenCreateReceptionModal}
      />

      <CreateReceptionModal
        open={isOpenCreateReceptionModal}
        onClose={() => setIsOpenCreateReceptionModal(false)}
        store={store}
        customer={customer}
        handleCloseCreateReceptionUserModal={handleCloseModal}
      />

      <Stack direction="row" justifyContent="space-between" flexGrow={1}>
        <Box display="flex" alignItems="center" gap="8px">
          <CreateNoAccountQR text="非会員QR発行" isReservation />
          <HelpIcon helpArchivesNumber={2957} />
        </Box>

        <Stack direction="row" gap="16px">
          <SecondaryButtonWithIcon
            onClick={() =>
              setModalState({
                isOpen: true,
                status: ModalType.CreateReception,
              })
            }
          >
            予約受付
          </SecondaryButtonWithIcon>
          <HelpIcon helpArchivesNumber={2948} />
          {canCreate && (
            <>
              <PrimaryButtonWithIcon
                onClick={() =>
                  setModalState({
                    isOpen: true,
                    status: ModalType.SelectMycaItems,
                  })
                }
              >
                新規予約作成
              </PrimaryButtonWithIcon>
              <HelpIcon helpArchivesNumber={2917} />
            </>
          )}
        </Stack>
      </Stack>
    </>
  );
};
