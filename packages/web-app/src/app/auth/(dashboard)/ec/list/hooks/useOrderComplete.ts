import { useCallback, useRef } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { OrderStatus } from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';

interface UseOrderCompleteProps {
  storeId: number;
}

interface ProductUpdate {
  productId: number;
  itemCount?: number;
}

interface CompleteOrderParams {
  orderId: number;
  shippingTrackingCode?: string;
  shippingCompany?: string;
  products?: ProductUpdate[];
}

export const useOrderComplete = ({ storeId }: UseOrderCompleteProps) => {
  const clientAPI = useRef(createClientAPI()).current;
  const { setAlertState } = useAlert();

  const completeOrder = useCallback(
    async ({
      orderId,
      shippingTrackingCode,
      shippingCompany,
    }: CompleteOrderParams) => {
      try {
        const response = await clientAPI.ec.updateEcOrderByStore({
          store_id: storeId,
          order_id: orderId,
          body: {
            status: OrderStatus.COMPLETED,
            shipping_tracking_code: shippingTrackingCode,
            shipping_company: shippingCompany,
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
          message: '注文を完了しました',
          severity: 'success',
        });
      } catch (error) {
        setAlertState({
          message: '注文の完了処理に失敗しました',
          severity: 'error',
        });
      }
    },
    [clientAPI.ec, storeId, setAlertState],
  );

  return {
    completeOrder,
  };
};
