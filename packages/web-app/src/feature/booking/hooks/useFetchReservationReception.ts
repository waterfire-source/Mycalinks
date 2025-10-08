import { useAlert } from '@/contexts/AlertContext';
import { ApiError, MycaPosApiClient } from 'api-generator/client';
import { useCallback, useState } from 'react';

export type GetReservationReceptionResponse = Awaited<
  ReturnType<MycaPosApiClient['reservation']['getReservationReception']>
>;
export type ReservationReceptionType =
  GetReservationReceptionResponse['receptions'][0];

export const useFetchReservationReception = () => {
  const { setAlertState } = useAlert();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [receptions, setReceptions] = useState<ReservationReceptionType[]>([]);

  const fetchReservationReception = useCallback(
    async (
      storeId: number,
      reservationId: number,
      includesCustomerInfo?: boolean,
    ) => {
      setIsLoading(true);
      try {
        const response = await apiClient.reservation.getReservationReception({
          storeId,
          reservationId,
          includesCustomerInfo,
        });
        setReceptions(response.receptions);
      } catch (e) {
        if (e instanceof ApiError && e.body?.error) {
          setAlertState({
            message: e.body.error,
            severity: 'error',
          });
        } else {
          setAlertState({
            message: '予約詳細の取得に失敗しました。',
            severity: 'error',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient.reservation, setAlertState],
  );

  return {
    receptions,
    fetchReservationReception,
    isLoading,
  };
};
