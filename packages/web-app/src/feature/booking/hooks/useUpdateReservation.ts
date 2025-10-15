import { useAlert } from '@/contexts/AlertContext';
import { ApiError, MycaPosApiClient } from 'api-generator/client';
import { useCallback, useState } from 'react';

export type PutReservationRequest = Parameters<
  MycaPosApiClient['reservation']['updateReservation']
>[0];
export type PutReservationRequestBody = NonNullable<
  PutReservationRequest['requestBody']
>;

export const useUpdateReservation = () => {
  const { setAlertState } = useAlert();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateReservation = useCallback(
    async (
      storeId: number,
      reservationId: number,
      requestBody: PutReservationRequestBody,
    ) => {
      setIsLoading(true);
      try {
        await apiClient.reservation.updateReservation({
          storeId,
          reservationId,
          requestBody,
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
            message: '予約の更新に失敗しました。',
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
    updateReservation,
    isLoading,
  };
};
