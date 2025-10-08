import { TransactionAPI } from '@/api/frontend/transaction/api';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { DetailCard } from '@/components/cards/DetailCard';
import { PATH } from '@/constants/paths';
import { useRegister } from '@/contexts/RegisterContext';
import { useRouter } from 'next/navigation';
import {
  CustomerReservationReceptionType,
  ModalState,
  ModalType,
  ReceptionType,
  useGetCustomerReservationReceptionReceipt,
} from '@/feature/booking';
import { CustomerReceptionsDetailContent } from '@/feature/booking/component/bookingList/detail/CustomerReceptionsDetailContent';
import { useSellTransactions } from '@/feature/transaction/hooks/useSellTransactions';
import { ReservationStatus, TransactionKind } from '@prisma/client';
import { MouseEvent, useCallback, useMemo, useState } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { Menu, MenuItem, Stack } from '@mui/material';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  storeId: number;
  selectedReception: CustomerReservationReceptionType | null;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  selectedReservations: ReceptionType[];
  setSelectedReservations: React.Dispatch<
    React.SetStateAction<ReceptionType[]>
  >;
}

export const CustomerReceptionsDetail = ({
  storeId,
  selectedReception,
  setModalState,
  selectedReservations,
  setSelectedReservations,
}: Props) => {
  const { register } = useRegister();
  const router = useRouter();
  const { setAlertState } = useAlert();
  const { ePosDev } = useEposDevice();
  const { createSellTransaction, isLoading: isCreatingTransaction } =
    useSellTransactions();
  const { getCustomerReservationReceptionReceipt } =
    useGetCustomerReservationReceptionReceipt();
  // 各種操作メニューの開閉状態を管理するstate
  const [buttonListAnchor, setButtonListAnchor] = useState<null | HTMLElement>(
    null,
  );

  const allReservations = useMemo(
    () =>
      selectedReception?.reservation_reception_products.map(
        (product) => product,
      ) ?? [],
    [selectedReception?.reservation_reception_products],
  );
  const isAllReservationsClosed = useMemo(
    () =>
      selectedReservations.every(
        (reservation) =>
          reservation.reservation.status === ReservationStatus.CLOSED,
      ),
    [selectedReservations],
  );
  const isAllSelected = useMemo(
    () =>
      allReservations.length > 0 &&
      selectedReservations.length === allReservations.length,
    [allReservations, selectedReservations],
  );

  const handleCheckboxClick = (reservation: ReceptionType) => {
    setSelectedReservations((prev) => {
      const isSelected = prev.some((item) => item.id === reservation.id);

      if (isSelected) {
        return prev.filter((item) => item.id !== reservation.id);
      } else {
        return [...prev, reservation];
      }
    });
  };

  const handleToggleAll = () => {
    if (selectedReservations.length === allReservations.length) {
      setSelectedReservations([]);
    } else {
      setSelectedReservations(allReservations);
    }
  };

  const handleButtonListAnchorClick = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    setButtonListAnchor(event.currentTarget);
  };
  const handleCloseButtonListAnchor = () => {
    setButtonListAnchor(null);
  };

  const handleValidateSelectReservations = () => {
    if (!selectedReservations.length) {
      setAlertState({
        message: `予約が選択されていません。`,
        severity: 'error',
      });
      return false;
    }
    return true;
  };

  // 予約票印刷
  const handleReceiptOutput = async (productId: number) => {
    try {
      const res = await getCustomerReservationReceptionReceipt(
        storeId,
        productId,
      );
      if (ePosDev && res && res.receiptCommand) {
        await ePosDev.printWithCommand(res.receiptCommand, storeId);
      }
    } catch {
      setAlertState({
        message: `予約票の印刷に失敗しました。`,
        severity: 'error',
      });
    }
  };

  const handleClickReprint = async () => {
    for (const r of selectedReservations) {
      if (!r.id) continue;
      await handleReceiptOutput(r.id);
    }
  };

  const handleCreateTransaction = useCallback(async () => {
    if (!selectedReservations.length) return;
    try {
      const totalRemainingPrice = selectedReservations.reduce(
        (total, reservation) =>
          total +
          reservation.reservation.remaining_price * reservation.item_count,
        0,
      );
      const totalDepositPrice = selectedReservations.reduce(
        (total, reservation) =>
          total +
          reservation.reservation.deposit_price * reservation.item_count,
        0,
      );
      const carts = selectedReservations.map((item) => {
        return {
          product_id: item.reservation.product.id,
          item_count: item.item_count,
          unit_price:
            item.reservation.deposit_price + item.reservation.remaining_price,
          discount_price: 0,
          original_unit_price: 0,
          reservation_price: -item.reservation.deposit_price,
          reservation_reception_product_id_for_receive: item.id,
        };
      });
      const transactionRequest: TransactionAPI['create']['request'] = {
        store_id: storeId,
        id: null,
        register_id: register?.id,
        reservation_reception_id:
          selectedReservations[0].reservation_reception_id,
        customer_id: selectedReception?.id,
        transaction_kind: TransactionKind.sell,
        total_price: totalRemainingPrice,
        subtotal_price: totalRemainingPrice,
        tax: 0,
        asDraft: true,
        discount_price: 0,
        point_discount_price: 0,
        payment_method: null,
        recieved_price: totalDepositPrice,
        change_price: 0,
        carts: carts,
      };
      const res = await createSellTransaction(transactionRequest);

      if (res) {
        setModalState({ isOpen: false, status: ModalType.Idle });
        router.push(
          `${PATH.SALE.root}?transactionID=${res}&customerID=${selectedReception?.id}`,
        );
      }
    } catch {
      setAlertState({
        message: `取引の作成に失敗しました。`,
        severity: 'error',
      });
    }
  }, [
    register?.id,
    router,
    selectedReception?.id,
    selectedReservations,
    storeId,
  ]);

  return (
    <DetailCard
      title="予約内容詳細"
      content={
        <CustomerReceptionsDetailContent
          selectedReception={selectedReception}
          selectedReservations={selectedReservations}
          handleCheckboxClick={handleCheckboxClick}
          isAllSelected={isAllSelected}
          handleToggleAll={handleToggleAll}
        />
      }
      bottomContent={
        selectedReception ? (
          <>
            <SecondaryButtonWithIcon onClick={handleButtonListAnchorClick}>
              各種操作
            </SecondaryButtonWithIcon>
            <Menu
              id="basic-menu"
              anchorEl={buttonListAnchor}
              open={Boolean(buttonListAnchor)}
              onClose={() => handleCloseButtonListAnchor()}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem
                onClick={() => {
                  if (!handleValidateSelectReservations()) return;

                  handleCloseButtonListAnchor();
                  setModalState({ isOpen: true, status: ModalType.Cancel });
                }}
              >
                選択した予約を取り消し
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (!handleValidateSelectReservations()) return;

                  handleCloseButtonListAnchor();
                  handleClickReprint();
                }}
              >
                選択した予約票の再印刷
              </MenuItem>
            </Menu>
            <Stack direction="row" gap={1}>
              <HelpIcon helpArchivesNumber={2986} />
              <PrimaryButtonWithIcon
                onClick={() => handleCreateTransaction()}
                disabled={
                  !selectedReservations.length || !isAllReservationsClosed
                }
                loading={isCreatingTransaction}
              >
                選択した商品をお渡し
              </PrimaryButtonWithIcon>
            </Stack>
          </>
        ) : undefined
      }
    />
  );
};
