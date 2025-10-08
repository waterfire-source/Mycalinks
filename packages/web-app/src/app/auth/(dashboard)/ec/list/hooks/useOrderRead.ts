import { useCallback, useRef } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';

interface UseOrderReadProps {
  storeId: number;
  onSuccess?: (orderId: number) => void;
}

export const useOrderRead = ({ storeId, onSuccess }: UseOrderReadProps) => {
  const clientAPI = useRef(createClientAPI()).current;
  const { setAlertState } = useAlert();

  const markAsRead = useCallback(
    async (orderId: number) => {
      try {
        const response = await clientAPI.ec.updateEcOrderByStore({
          store_id: storeId,
          order_id: orderId,
          body: {
            read: true,
          },
        });
        if (response instanceof CustomError) {
          setAlertState({
            message: `${response.status}:${response.message}`,
            severity: 'error',
          });
          throw response;
        }
        setAlertState({
          message: '注文を既読にしました',
          severity: 'success',
        });
        if (onSuccess) onSuccess(orderId);
      } catch (error) {
        setAlertState({
          message: '注文の既読処理に失敗しました',
          severity: 'error',
        });
      }
    },
    [clientAPI.ec, storeId, setAlertState, onSuccess],
  );

  return {
    markAsRead,
  };
};
