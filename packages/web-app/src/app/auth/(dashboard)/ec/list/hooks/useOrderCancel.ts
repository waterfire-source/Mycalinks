import { useCallback, useRef } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { OrderStatus } from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';

interface UseOrderCancelProps {
  storeId: number;
}

export const useOrderCancel = ({ storeId }: UseOrderCancelProps) => {
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const cancelOrder = useCallback(
    async (orderId: number, cancelReason: string) => {
      try {
        await apiClient.current.ec.updateEcOrderByStore({
          storeId,
          orderId,
          requestBody: {
            status: OrderStatus.CANCELED,
            cancelReason,
          },
        });
        setAlertState({
          message: '注文をキャンセルしました',
          severity: 'success',
        });
      } catch (error) {
        handleError(error);
        return false;
      }
    },
    [storeId, setAlertState, handleError],
  );

  return {
    cancelOrder,
  };
};
