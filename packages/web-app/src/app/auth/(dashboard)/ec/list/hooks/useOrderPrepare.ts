import { useCallback, useRef } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { OrderStatus } from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';

export const useOrderPrepare = () => {
  const { store } = useStore();
  const clientAPI = useRef(createClientAPI()).current;
  const { setAlertState } = useAlert();

  const prepareOrder = useCallback(
    async (orderId: number) => {
      try {
        const response = await clientAPI.ec.updateEcOrderByStore({
          store_id: store.id,
          order_id: orderId,
          body: {
            status: OrderStatus.WAIT_FOR_SHIPPING,
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
          message: '注文を発送待機中に更新しました',
          severity: 'success',
        });
      } catch (error: { message: string }) {
        setAlertState({
          message: '注文の更新に失敗しました。' + error.message,
          severity: 'error',
        });
      }
    },
    [clientAPI.ec, setAlertState, store.id],
  );

  return {
    prepareOrder,
  };
};
