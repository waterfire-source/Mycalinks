import { useAlert } from '@/contexts/AlertContext';
import { ApiError, MycaPosApiClient } from 'api-generator/client';
import { useCallback, useState } from 'react';

export const useDeleteReservation = () => {
  const { setAlertState } = useAlert();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const [isLoading, setIsLoading] = useState(false);

  const deleteReservation = useCallback(
    async (storeId: number, reservationId: number) => {
      setIsLoading(true);
      try {
        await apiClient.reservation.deleteReservation({
          storeId,
          reservationId,
        });
        return true;
      } catch (e) {
        if (e instanceof ApiError && e.body?.error) {
          setAlertState({
            message: e.body.error,
            severity: 'error',
          });
        } else {
          setAlertState({
            message: '予約の削除に失敗しました。',
            severity: 'error',
          });
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient.reservation, setAlertState],
  );

  return {
    deleteReservation,
    isLoading,
  };
};
