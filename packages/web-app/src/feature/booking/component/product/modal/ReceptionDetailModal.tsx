import { TransactionAPI } from '@/api/frontend/transaction/api';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useRegister } from '@/contexts/RegisterContext';
import {
  ModalState,
  ModalType,
  ReservationReceptionType,
  ReservationType,
} from '@/feature/booking';
import { useSellTransactions } from '@/feature/transaction/hooks/useSellTransactions';
import { Box, Stack, Typography } from '@mui/material';
import {
  ReservationReceptionProductStatus,
  TransactionKind,
} from '@prisma/client';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useCallback, useMemo } from 'react';
import { useAlert } from '@/contexts/AlertContext';

interface Props {
  storeId: number;
  open: boolean;
  onClose: () => void;
  selectedReservation: ReservationType | null;
  reception: ReservationReceptionType | null;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  isOpenReservation?: boolean;
}

export const ReceptionDetailModal = ({
  storeId,
  open,
  onClose,
  reception,
  setModalState,
  selectedReservation,
  isOpenReservation,
}: Props) => {
  const { createSellTransaction, isLoading: isCreatingTransaction } =
    useSellTransactions();
  const { register } = useRegister();
  const { setAlertState } = useAlert();
  const router = useRouter();

  const receptionInfo = useMemo(() => {
    return [
      { label: '予約番号', value: reception?.reservation_id },
      {
        label: '受付日時',
        value: dayjs(reception?.created_at).format('YYYY/MM/DD HH:mm'),
      },
      {
        label: '予約数',
        value: reception?.item_count,
      },
      {
        label: '氏名',
        value: reception?.customer?.full_name,
      },
      {
        label: 'フリガナ',
        value: reception?.customer?.full_name_ruby,
      },
      {
        label: '郵便番号',
        value: reception?.customer?.zip_code,
      },
      {
        label: '住所',
        value: [
          reception?.customer?.prefecture,
          reception?.customer?.city,
          reception?.customer?.address2,
          reception?.customer?.building,
        ]
          .filter(Boolean)
          .join(''),
      },
      {
        label: '電話番号',
        value: reception?.customer?.phone_number,
      },
      {
        label: 'メモ',
        value: reception?.customer?.memo,
      },
    ];
  }, [reception]);

  const handleCreateTransaction = useCallback(async () => {
    if (!reception || !selectedReservation) return;
    try {
      const carts = [
        {
          product_id: selectedReservation.product_id,
          item_count: reception.item_count,
          unit_price:
            selectedReservation.deposit_price +
            selectedReservation.remaining_price,
          discount_price: 0,
          original_unit_price: 0,
          reservation_price: -selectedReservation.deposit_price,
          reservation_reception_product_id_for_receive: reception.id,
        },
      ];
      const transactionRequest: TransactionAPI['create']['request'] = {
        store_id: storeId,
        id: null,
        register_id: register?.id,
        reservation_reception_id: reception.reservation_reception_id,
        customer_id: reception.customer_id,
        transaction_kind: TransactionKind.sell,
        total_price: selectedReservation.remaining_price,
        subtotal_price: selectedReservation.remaining_price,
        tax: 0,
        asDraft: true,
        discount_price: 0,
        point_discount_price: 0,
        payment_method: null,
        recieved_price: selectedReservation.deposit_price,
        change_price: 0,
        carts: carts,
      };
      const res = await createSellTransaction(transactionRequest);

      if (res) {
        onClose();
        router.push(
          `${PATH.SALE.root}?transactionID=${res}&customerID=${reception.customer_id}`,
        );
      }
    } catch {
      setAlertState({
        message: `取引の作成に失敗しました。`,
        severity: 'error',
      });
    }
  }, [
    createSellTransaction,
    reception,
    register?.id,
    router,
    selectedReservation,
    storeId,
  ]);

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="予約内容詳細"
      cancelButtonText="キャンセル"
      onConfirm={handleCreateTransaction}
      confirmButtonText={!isOpenReservation ? '会計へ' : undefined}
      confirmButtonLoading={isCreatingTransaction}
      confirmButtonDisable={
        reception?.status !== ReservationReceptionProductStatus.DEPOSITED
      }
      secondActionButtonDisable={
        reception?.status !== ReservationReceptionProductStatus.DEPOSITED
      }
      secondActionButtonText="予約取り消し"
      onSecondActionButtonClick={() =>
        setModalState({ isOpen: true, status: ModalType.Cancel })
      }
      content={
        <Box display="flex" flexDirection="column" gap={1}>
          {receptionInfo.map((item) => (
            <Stack
              flexDirection="row"
              flexWrap="wrap"
              alignItems="flex-start"
              key={item.label}
            >
              <Typography variant="body2" sx={{ width: '80px' }}>
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ width: '300px' }}>
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Box>
      }
    />
  );
};
