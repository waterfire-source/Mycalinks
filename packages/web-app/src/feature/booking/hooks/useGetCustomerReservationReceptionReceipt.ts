import { useAlert } from '@/contexts/AlertContext';
import { ApiError, MycaPosApiClient } from 'api-generator/client';
import { useCallback, useState } from 'react';

export const useGetCustomerReservationReceptionReceipt = () => {
  const { setAlertState } = useAlert();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const [isLoading, setIsLoading] = useState(false);

  const getCustomerReservationReceptionReceipt = useCallback(
    async (storeId: number, reservationReceptionProductId: number) => {
      setIsLoading(true);
      try {
        const res =
          await apiClient.reservation.getCustomerReservationReceptionReceipt({
            storeId,
            reservationReceptionProductId,
          });
        return res;
      } catch (e) {
        if (e instanceof ApiError && e.body?.error) {
          setAlertState({
            message: e.body.error,
            severity: 'error',
          });
        } else {
          setAlertState({
            message: '予約票の印刷に失敗しました。',
            severity: 'error',
          });
        }
        return;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient.reservation, setAlertState],
  );

  //   const handleReceiptOutput = async (productId: number) => {
  //   const res = await getCustomerReservationReceptionReceipt(
  //     store.id,
  //     productId,
  //   );
  //   if (ePosDev && res && res.receiptCommand) {
  //     await ePosDev.printWithCommand(res.receiptCommand);
  //   }
  // };

  return {
    getCustomerReservationReceptionReceipt,
    isLoading,
  };
};
