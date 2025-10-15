import { useCallback, useState, useRef } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { CustomError } from '@/api/implement';

interface UseKuronekoShippingLabelProps {
  storeId: number;
}

export const useKuronekoShippingLabel = ({
  storeId,
}: UseKuronekoShippingLabelProps) => {
  const { setAlertState } = useAlert();
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );
  const [isLoading, setIsLoading] = useState(false);

  const generateKuronekoShippingLabel = useCallback(
    async (orderIds: number[]) => {
      if (!storeId || orderIds.length === 0) return;

      setIsLoading(true);
      try {
        const response =
          await apiClient.current.ec.getEcOrderKuronekoShippingLabelCsv({
            storeId,
            orderId: orderIds.join(','),
          });
        if (response instanceof CustomError) {
          throw response;
        }
        const a = document.createElement('a');
        a.href = response.fileUrl;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setAlertState({
          message: `${orderIds.length}件の送り状を発行しました`,
          severity: 'success',
        });
        return true;
      } catch (error) {
        console.error('送り状発行に失敗しました:', error);
        setAlertState({
          message: '送り状発行に失敗しました',
          severity: 'error',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [storeId, setAlertState, apiClient],
  );

  return {
    generateKuronekoShippingLabel,
    isLoading,
  };
};
