import { useCallback, useRef } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';
interface Props {
  storeId: number;
}

export const useOrderShortage = ({ storeId }: Props) => {
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const reportShortage = useCallback(
    async (
      orderId: number,
      params: {
        products?: Array<{
          product_id: number;
          item_count: number;
        }>;
      },
    ) => {
      try {
        await apiClient.current.ec.updateEcOrderByStore({
          storeId: storeId,
          orderId: orderId,
          requestBody: params,
        });
        setAlertState({
          message: '注文を更新しました',
          severity: 'success',
        });
        return true;
      } catch (error) {
        handleError(error);
        return false;
      }
    },
    [storeId, setAlertState, handleError],
  );

  return { reportShortage };
};
