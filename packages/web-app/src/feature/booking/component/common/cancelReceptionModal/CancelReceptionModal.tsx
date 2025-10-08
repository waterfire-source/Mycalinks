import { createClientAPI, CustomError } from '@/api/implement';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useAlert } from '@/contexts/AlertContext';
import { useRegister } from '@/contexts/RegisterContext';
import {
  ReceptionType,
  useFetchCustomerReservationReception,
} from '@/feature/booking';
import { CancelReceptionTable } from '@/feature/booking/component/common/cancelReceptionModal/CancelReceptionTable';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  customerId?: number;
  storeId: number;
  reservationId?: number;
  reservationReceptionId?: number;
  selectedReservations?: ReceptionType[];
  handleCancelAfterAction?: () => void;
}

export const CancelReceptionModal = ({
  open,
  onClose,
  customerId,
  storeId,
  reservationId,
  reservationReceptionId,
  selectedReservations,
  handleCancelAfterAction,
}: Props) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [repayments, setRepayments] = useState<ReceptionType[]>([]);
  const [isLoadingReturn, setIsLoadingReturn] = useState(false);

  const { register } = useRegister();
  const { setAlertState } = useAlert();

  const clientAPI = useMemo(() => createClientAPI(), []);

  const { receptions, fetchCustomerReservationReception, isLoading } =
    useFetchCustomerReservationReception();

  const reservationReceptionProducts = useMemo(
    () =>
      selectedReservations ??
      receptions.flatMap((r) => r.reservation_reception_products),
    [selectedReservations, receptions],
  );

  const isAllSelected = useMemo(
    () =>
      reservationReceptionProducts.length > 0 &&
      repayments.length === reservationReceptionProducts.length,
    [repayments.length, reservationReceptionProducts.length],
  );

  const handleAddRepayment = (reception: ReceptionType) => {
    setRepayments((prev) => {
      const exists = prev.find((r) => r.id === reception.id);
      if (exists) {
        return prev.filter((r) => r.id !== reception.id);
      } else {
        return [...prev, reception];
      }
    });
  };

  const handleToggleAllRepayment = () => {
    if (isAllSelected) {
      setRepayments([]);
    } else {
      setRepayments(reservationReceptionProducts);
    }
  };

  const handleCloseModal = () => {
    onClose();
    setStep(1);
  };

  const handleReturn = async () => {
    if (!register) {
      setAlertState({
        message: `レジアカウントで入り直してください。`,
        severity: 'error',
      });
      return;
    }
    setIsLoadingReturn(true);
    try {
      const returnPromises = reservationReceptionProducts.map(
        async (product) => {
          const transactionId =
            product.deposit_transaction_cart?.[0]?.transaction_id;
          if (!transactionId) return;

          const dontRefund = !repayments.some((r) => r.id === product.id);

          return clientAPI.transaction.processReturn({
            store_id: storeId,
            transaction_id: Number(transactionId),
            body: {
              register_id: register.id,
              dontRefund,
              reservation_reception_product_id_for_cancel: product.id,
            },
          });
        },
      );

      const results = await Promise.all(returnPromises);

      const hasError = results.some((res) => res instanceof CustomError);
      if (hasError) {
        const firstError = results.find(
          (res) => res instanceof CustomError,
        ) as CustomError;
        throw firstError;
      }

      setAlertState({
        message: `返品が完了しました`,
        severity: 'success',
      });
      setRepayments([]);
      handleCloseModal();
      handleCancelAfterAction?.();
    } catch (error) {
      if (error instanceof CustomError) {
        setAlertState({
          message: `${error.status}:${error.message}`,
          severity: 'error',
        });
      } else {
        setAlertState({
          message: `返品に失敗しました。`,
          severity: 'error',
        });
      }
    } finally {
      setIsLoadingReturn(false);
    }
  };

  const modalConfigs = useMemo(() => {
    const baseConfig = {
      1: {
        modalTitle: '予約受付取り消し',
        modalMassage: `取り消された予約は復元できません。\\n本当に取り消しますか？`,
        modalActionButtonText: '取り消す',
        modalOnActionButtonClick: () => setStep(2),
        content: undefined,
      },
      2: {
        modalTitle: '受領済み前金',
        modalMassage: `以下の商品は前金をすでに受領しています。\\n適切な処理を選択してください。`,
        modalActionButtonText: '返金する',
        modalOnActionButtonClick: () => handleReturn(),
        content: (
          <Box display="flex" flexDirection="column">
            {isLoading ? (
              <CircularProgress />
            ) : (
              <>
                <CancelReceptionTable
                  reservationReceptionProducts={reservationReceptionProducts}
                  repayments={repayments}
                  handleAddRepayment={handleAddRepayment}
                  handleToggleAllRepayment={handleToggleAllRepayment}
                />
                <Typography alignSelf="flex-end">
                  合計返金額：
                  {repayments
                    .reduce(
                      (total, repayment) =>
                        total +
                        repayment.reservation.deposit_price *
                          repayment.item_count,
                      0,
                    )
                    .toLocaleString()}
                  円
                </Typography>
              </>
            )}
          </Box>
        ),
      },
    };

    return (
      baseConfig[step] ?? {
        modalTitle: '',
        modalMassage: '',
        modalActionButtonText: '',
        modalOnActionButtonClick: () => {},
        content: undefined,
      }
    );
  }, [reservationReceptionProducts, step, repayments]);

  const {
    modalTitle,
    modalMassage,
    modalActionButtonText,
    modalOnActionButtonClick,
    content,
  } = modalConfigs;

  useEffect(() => {
    if (
      open &&
      !selectedReservations &&
      reservationId &&
      customerId &&
      reservationReceptionId
    )
      fetchCustomerReservationReception(
        storeId,
        reservationId,
        customerId,
        reservationReceptionId,
      );
  }, [
    open,
    storeId,
    reservationId,
    customerId,
    selectedReservations,
    reservationReceptionId,
  ]);

  return (
    <ConfirmationDialog
      open={open}
      onClose={handleCloseModal}
      onConfirm={modalOnActionButtonClick}
      title={modalTitle}
      message={modalMassage}
      confirmButtonText={modalActionButtonText}
      confirmButtonDisable={step === 2 && isLoading}
      cancelButtonText="キャンセル"
      isLoading={isLoadingReturn}
      content={content}
    />
  );
};
