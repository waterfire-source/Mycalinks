import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { MycaPosApiClient } from 'api-generator/client';
import { useCallback, useMemo, useState } from 'react';

export type UpdatePurchaseTableRequestBody = Parameters<
  MycaPosApiClient['purchaseTable']['updatePurchaseTable']
>[0]['requestBody'];

export const useUpDatePurchaseTable = () => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();
  const { setAlertState } = useAlert();
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const upDatePurchaseTable = useCallback(
    async (purchaseTableId: number, body: UpdatePurchaseTableRequestBody) => {
      setIsLoading(true);
      try {
        const response = await apiClient.purchaseTable.updatePurchaseTable({
          storeId: store.id,
          purchaseTableId,
          requestBody: {
            genre_handle: body?.genre_handle,
            display_on_app: true,
            sendPushNotification: body?.sendPushNotification,
          },
        });
        setAlertState({
          message: '買取表を通知しました',
          severity: 'success',
        });
        return response;
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient.purchaseTable, handleError, setAlertState, store.id],
  );
  return {
    upDatePurchaseTable,
    isLoading,
  };
};
