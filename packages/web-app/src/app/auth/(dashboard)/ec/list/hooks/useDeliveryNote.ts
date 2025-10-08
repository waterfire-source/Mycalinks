import { useCallback, useState, useRef } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { CustomError } from '@/api/implement';

interface UseDeliveryNoteProps {
  storeId: number;
}

export const useDeliveryNote = ({ storeId }: UseDeliveryNoteProps) => {
  const { setAlertState } = useAlert();
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );
  const [isLoading, setIsLoading] = useState(false);

  const generateDeliveryNotes = useCallback(
    async (orderIds: number[]) => {
      if (!storeId || orderIds.length === 0) return;

      setIsLoading(true);
      try {
        // 7件ずつ並列処理
        const batchSize = 7;
        const urls: string[] = [];

        for (let i = 0; i < orderIds.length; i += batchSize) {
          const batch = orderIds.slice(i, i + batchSize);

          const batchPromises = batch.map(async (orderId) => {
            const response = await apiClient.current.ec.getEcOrderDeliveryNote({
              storeId,
              orderId,
            });
            if (response instanceof CustomError) {
              throw response;
            }
            return response.deliveryNoteUrl;
          });

          const batchUrls = await Promise.all(batchPromises);
          urls.push(...batchUrls);
        }

        // 順次ダウンロード
        for (const url of urls) {
          const a = document.createElement('a');
          a.href = url;
          a.download = '';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          // 少し待ってから次のダウンロード（ブラウザ制限対応）
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        setAlertState({
          message: `${orderIds.length}件の納品書を発行しました`,
          severity: 'success',
        });
        return true;
      } catch (error) {
        console.error('納品書発行に失敗しました:', error);
        setAlertState({
          message: '納品書発行に失敗しました',
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
    generateDeliveryNotes,
    isLoading,
  };
};
