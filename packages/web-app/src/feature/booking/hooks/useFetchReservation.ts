import { useAlert } from '@/contexts/AlertContext';
import {
  defaultReservationsSearchState,
  ReservationsSearchState,
} from '@/feature/booking';
import { ReservationStatus } from '@prisma/client';
import { ApiError, MycaPosApiClient } from 'api-generator/client';
import { useCallback, useState } from 'react';

export type GetReservationResponse = Awaited<
  ReturnType<MycaPosApiClient['reservation']['getReservation']>
>;
export type ReservationType = GetReservationResponse['reservations'][0];

type Props = {
  option?: {
    status?: ReservationStatus;
  };
};

export const useFetchReservation = ({ option }: Props) => {
  const { setAlertState } = useAlert();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reservations, setReservations] = useState<ReservationType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  // 検索条件
  const [searchState, setSearchState] = useState<ReservationsSearchState>({
    ...defaultReservationsSearchState,
    ...option,
  });

  const fetchReservation = useCallback(
    async (storeId: number) => {
      setIsLoading(true);
      try {
        const response = await apiClient.reservation.getReservation({
          storeId,
          id: searchState.id,
          status: searchState.status,
          productDisplayName: searchState.productDisplayName,
          take: searchState.searchItemPerPage,
          skip: searchState.searchCurrentPage * searchState.searchItemPerPage,
          orderBy: searchState.orderBy,
          includesSummary: true,
        });
        setReservations(response.reservations ?? []);
        setTotalCount(response.summary.totalCount);
      } catch (e) {
        if (e instanceof ApiError && e.body?.error) {
          setAlertState({
            message: e.body.error,
            severity: 'error',
          });
        } else {
          setAlertState({
            message: '予約商品の取得に失敗しました。',
            severity: 'error',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient.reservation, searchState, setAlertState],
  );

  return {
    reservations,
    totalCount,
    fetchReservation,
    isLoading,
    searchState,
    setSearchState,
  };
};
