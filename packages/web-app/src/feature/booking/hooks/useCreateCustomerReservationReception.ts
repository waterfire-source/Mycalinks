import { useAlert } from '@/contexts/AlertContext';
import { ApiError, MycaPosApiClient } from 'api-generator/client';
import { useCallback, useState } from 'react';

export type PostCustomerReservationReceptionRequest = Parameters<
  MycaPosApiClient['reservation']['createCustomerReservationReception']
>[0];
export type PostCustomerReservationReceptionRequestBody = NonNullable<
  PostCustomerReservationReceptionRequest['requestBody']
>;
export type CreateCustomerReservationReceptionResponse = Awaited<
  ReturnType<
    MycaPosApiClient['reservation']['createCustomerReservationReception']
  >
>;
export type ProductType =
  CreateCustomerReservationReceptionResponse['products'][0];

export const useCreateCustomerReservationReception = () => {
  const { setAlertState } = useAlert();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const [isLoading, setIsLoading] = useState(false);

  const createCustomerReservationReception = useCallback(
    async (
      storeId: number,
      requestBody: PostCustomerReservationReceptionRequestBody,
    ) => {
      setIsLoading(true);
      try {
        const res =
          await apiClient.reservation.createCustomerReservationReception({
            storeId,
            requestBody,
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
            message: '予約の受付に失敗しました。',
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

  return {
    createCustomerReservationReception,
    isLoading,
  };
};
