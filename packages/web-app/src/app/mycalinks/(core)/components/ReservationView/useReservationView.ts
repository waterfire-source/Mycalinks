import { useErrorAlert } from '@/hooks/useErrorAlert';
import { MycaAppClient } from 'api-generator/app-client';
import { useRef, useState, useCallback } from 'react';
import { getAppHeaders } from '@/utils/appAuth';

export type GetReservationReceptionByMycaUserResponse = Awaited<
  ReturnType<MycaAppClient['reservation']['getReservationReceptionByMycaUser']>
>;

export type ReservationsType =
  GetReservationReceptionByMycaUserResponse['reservationReceptionProducts'][0];

export const useReservationView = () => {
  const { handleError } = useErrorAlert();
  const apiClient = useRef(
    new MycaAppClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      HEADERS: async () => {
        const headers = await getAppHeaders();
        return headers;
      },
    }),
  );

  const [reservations, setReservations] = useState<ReservationsType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReservations = useCallback(
    async (selectedStoreId?: number) => {
      setIsLoading(true);
      try {
        const data =
          await apiClient.current.reservation.getReservationReceptionByMycaUser(
            {
              storeId: selectedStoreId || undefined,
            },
          );

        setReservations(data.reservationReceptionProducts ?? []);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError],
  );

  return { reservations, isLoading, fetchReservations };
};

export default useReservationView;
