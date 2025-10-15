import { useAlert } from '@/contexts/AlertContext';
import { ApiError, MycaPosApiClient } from 'api-generator/client';
import { useCallback, useState } from 'react';

export type PostReservationRequest = Parameters<
  MycaPosApiClient['reservation']['createReservation']
>[0];
export type PostReservationRequestBody = NonNullable<
  PostReservationRequest['requestBody']
>;

export const useCreateReservation = () => {
  const { setAlertState } = useAlert();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const [isLoading, setIsLoading] = useState(false);

  const createReservation = useCallback(
    async (storeId: number, requestBody: PostReservationRequestBody) => {
      setIsLoading(true);
      try {
        await apiClient.reservation.createReservation({
          storeId,
          requestBody,
        });
        setAlertState({
          message: '予約を作成しました。',
          severity: 'success',
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
            message: '予約の作成に失敗しました。',
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
    createReservation,
    isLoading,
  };
};
