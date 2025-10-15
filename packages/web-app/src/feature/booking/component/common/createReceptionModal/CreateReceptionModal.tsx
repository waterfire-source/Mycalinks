import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import {
  CreateCustomerReservationReception,
  PostCustomerReservationReceptionRequestBody,
  ProductType,
  ReservationType,
  useCreateCustomerReservationReception,
  useFetchReservation,
} from '@/feature/booking';
import { CreateReceptionDetail } from '@/feature/booking/component/common/createReceptionModal/CreateReceptionDetail';
import { CreateReceptionModalSearch } from '@/feature/booking/component/common/createReceptionModal/CreateReceptionModalSearch';
import { CreateReceptionTable } from '@/feature/booking/component/common/createReceptionModal/CreateReceptionTable';
import { CustomerType } from '@/feature/customer/hooks/useCustomer';
import { Grid } from '@mui/material';
import { ReservationStatus, Store, TransactionKind } from '@prisma/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSellTransactions } from '@/feature/transaction/hooks/useSellTransactions';
import { TransactionAPI } from '@/api/frontend/transaction/api';
import { useRegister } from '@/contexts/RegisterContext';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';

interface Props {
  open: boolean;
  onClose: () => void;
  store: Store;
  customer: CustomerType | undefined;
  handleCloseCreateReceptionUserModal: () => void;
}

export const CreateReceptionModal = ({
  open,
  onClose,
  store,
  customer,
  handleCloseCreateReceptionUserModal,
}: Props) => {
  const {
    reservations,
    fetchReservation,
    isLoading: isFetchingReservation,
    searchState,
    setSearchState,
  } = useFetchReservation({ option: { status: ReservationStatus.OPEN } });
  const { createCustomerReservationReception, isLoading: isCreatingReception } =
    useCreateCustomerReservationReception();
  const { setAlertState } = useAlert();
  const { createSellTransaction, isLoading: isCreatingTransaction } =
    useSellTransactions();
  const router = useRouter();
  const { register } = useRegister();

  const [selectedReservations, setSelectedReservations] = useState<
    (ReservationType & {
      itemCount: number;
    })[]
  >([]);
  const [itemCount, setItemCount] = useState<
    CreateCustomerReservationReception[]
  >([]);

  const isLoading = useMemo(
    () => isCreatingReception || isCreatingTransaction,
    [isCreatingReception, isCreatingTransaction],
  );

  const handleCountChange = (newCount: number, reservationId: number, maxQuantity: number) => {
    if (maxQuantity !== undefined && newCount > maxQuantity) return;
    setItemCount((prev) => {
      const exists = prev.find((item) => item.reservationId === reservationId);
      if (exists) {
        return prev.map((item) =>
          item.reservationId === reservationId
            ? { ...item, itemCount: newCount }
            : item,
        );
      }
      return [...prev, { reservationId, itemCount: newCount }];
    });
  };

  const handleAddProduct = (reservation: ReservationType) => {
    const currentCount =
      itemCount.find((item) => item.reservationId === reservation.id)
        ?.itemCount ?? 0;
    if (currentCount === 0) return;

    const alreadySelected = selectedReservations.find(
      (r) => r.id === reservation.id,
    );
    const maxCount = reservation.limit_count_per_user;
    if (alreadySelected) {
      const newCount = Math.min(
        alreadySelected.itemCount + currentCount,
        maxCount,
      );
      setSelectedReservations((prev) =>
        prev.map((r) =>
          r.id === reservation.id ? { ...r, itemCount: newCount } : r,
        ),
      );
    } else {
      const newCount = Math.min(currentCount, maxCount);
      setSelectedReservations((prev) => [
        ...prev,
        { ...reservation, itemCount: newCount },
      ]);
    }
  };

  const handleRemoveProduct = (reservation: ReservationType) => {
    setSelectedReservations((prev) =>
      prev.filter((r) => r.id !== reservation.id),
    );
  };

  const handleUpdateItemCount = (
    newCount: number,
    reservation: ReservationType,
  ) => {
    setSelectedReservations((prev) =>
      prev.map((r) =>
        r.id === reservation.id ? { ...r, itemCount: newCount } : r,
      ),
    );
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedReservations([]);
    setItemCount([]);
  };

  const handleCreateTransaction = useCallback(
    async (
      staffAccountId: number,
      reservationReceptionId: number,
      reservationReceptionProducts: ProductType[],
    ) => {
      if (!customer) return;
      const totalDepositPrice = selectedReservations.reduce(
        (total, reservation) =>
          total + reservation.deposit_price * reservation.itemCount,
        0,
      );
      const carts = selectedReservations.map((item) => {
        const reservationReceptionProductId = reservationReceptionProducts.find(
          (p) => p.reservation_id === item.id,
        )?.id;

        return {
          product_id: item.product.id,
          item_count: item.itemCount,
          unit_price: 0,
          discount_price: 0,
          original_unit_price: 0,
          reservation_price: item.deposit_price,
          reservation_reception_product_id_for_deposit:
            reservationReceptionProductId,
        };
      });
      const transactionRequest: TransactionAPI['create']['request'] = {
        store_id: store.id,
        id: null,
        register_id: register?.id,
        reservation_reception_id: reservationReceptionId,
        customer_id: customer.id,
        transaction_kind: TransactionKind.sell,
        staff_account_id: staffAccountId,
        total_price: totalDepositPrice,
        subtotal_price: totalDepositPrice,
        tax: 0,
        asDraft: true,
        discount_price: 0,
        point_discount_price: 0,
        payment_method: 'cash',
        recieved_price: 0,
        change_price: 0,
        carts: carts,
      };
      return await createSellTransaction(transactionRequest);
    },
    [customer, register?.id, selectedReservations, store.id],
  );

  const handleCreateReservation = useCallback(async () => {
    if (!customer) return;
    const requestBody: PostCustomerReservationReceptionRequestBody = {
      customer_id: customer.id,
      reservations: selectedReservations.map((reservation) => ({
        reservation_id: reservation.id,
        item_count: reservation.itemCount,
      })),
    };
    try {
      const success = await createCustomerReservationReception(
        store.id,
        requestBody,
      );

      if (success) {
        const res = await handleCreateTransaction(
          success.staff_account_id,
          success.products[0].reservation_reception_id,
          success.products,
        );

        if (res) {
          handleCloseModal();
          handleCloseCreateReceptionUserModal();
          router.push(
            `${PATH.SALE.root}?transactionID=${res}&customerID=${success.customer_id}`,
          );
        }
      }
    } catch (error) {
      setAlertState({
        message: `予約の受付に失敗しました。`,
        severity: 'error',
      });
    }
  }, [
    customer,
    handleCreateTransaction,
    router,
    selectedReservations,
    store.id,
  ]);

  useEffect(() => {
    if (open) {
      fetchReservation(store.id);
    }
  }, [open]);

  useEffect(() => {
    fetchReservation(store.id);
  }, [searchState, store.id]);

  return (
    <CustomModalWithIcon
      open={open}
      onClose={handleCloseModal}
      title="予約商品選択"
      width="90%"
      height="90%"
      actionButtonText="予約受付"
      onActionButtonClick={handleCreateReservation}
      cancelButtonText="閉じる"
      onCancelClick={handleCloseModal}
      loading={isLoading}
      isAble={!!selectedReservations.length}
    >
      <CreateReceptionModalSearch
        searchState={searchState}
        setSearchState={setSearchState}
      />

      <Grid container spacing={2} sx={{ height: 'calc(100% - 65px)', mt: 2 }}>
        <Grid item xs={8} sx={{ height: '100%', overflow: 'auto' }}>
          <CreateReceptionTable
            reservations={reservations}
            isLoading={isFetchingReservation}
            searchState={searchState}
            setSearchState={setSearchState}
            itemCount={itemCount}
            handleCountChange={handleCountChange}
            handleAddProduct={handleAddProduct}
          />
        </Grid>

        <Grid item xs={4} sx={{ height: '100%' }}>
          <CreateReceptionDetail
            selectedReservations={selectedReservations}
            handleUpdateItemCount={handleUpdateItemCount}
            handleRemoveProduct={handleRemoveProduct}
          />
        </Grid>
      </Grid>
    </CustomModalWithIcon>
  );
};
