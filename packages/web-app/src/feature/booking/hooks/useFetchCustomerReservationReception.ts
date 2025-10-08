import { useAlert } from '@/contexts/AlertContext';
import { CustomerReceptionsSearchState } from '@/feature/booking';
import { ApiError, MycaPosApiClient } from 'api-generator/client';
import { useCallback, useState } from 'react';

export type GetCustomerReservationReceptionResponse = Awaited<
  ReturnType<MycaPosApiClient['reservation']['getCustomerReservationReception']>
>;
export type CustomerReservationReceptionType =
  GetCustomerReservationReceptionResponse['customers'][0];

export type ReceptionType =
  GetCustomerReservationReceptionResponse['customers'][0]['reservation_reception_products'][0];

export const useFetchCustomerReservationReception = () => {
  const { setAlertState } = useAlert();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [receptions, setReceptions] = useState<
    CustomerReservationReceptionType[]
  >([]);

  // 検索条件
  const [searchState, setSearchState] = useState<CustomerReceptionsSearchState>(
    {
      customerName: undefined,
    },
  );

  const fetchCustomerReservationReception = useCallback(
    async (
      storeId: number,
      reservationId?: number,
      customerId?: number,
      reservationReceptionId?: number,
    ) => {
      setIsLoading(true);
      try {
        const response =
          await apiClient.reservation.getCustomerReservationReception({
            storeId,
            customerId: customerId ?? searchState.customerId,
            customerName: searchState.customerName,
            reservationId,
            reservationReceptionId,
          });
        setReceptions(response.customers ?? []);
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
    receptions,
    fetchCustomerReservationReception,
    isLoading,
    searchState,
    setSearchState,
  };
};
