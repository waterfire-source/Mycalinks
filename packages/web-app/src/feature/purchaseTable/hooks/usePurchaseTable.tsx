import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { useCallback, useMemo, useState } from 'react';

export type PurchaseTableResponse = Awaited<
  ReturnType<MycaPosApiClient['purchaseTable']['getPurchaseTable']>
>;

export const usePurchaseTable = (storeId: number) => {
  const { setAlertState } = useAlert();
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const [results, setResults] = useState<PurchaseTableResponse | undefined>();
  const fetchPurchaseTable = useCallback(
    async (take?: number, skip?: number, search?: string) => {
      try {
        const response = await apiClient.purchaseTable.getPurchaseTable({
          storeId: storeId,
          take,
          skip,
          search,
        });

        if (response instanceof CustomError) {
          setAlertState({ message: response.message, severity: 'error' });
          setIsLoading(false);
          return;
        }

        setResults(response);
        setIsLoading(false);
        return response;
      } catch (error) {
        setAlertState({
          message: '取得中にエラーが発生しました。',
          severity: 'error',
        });
        setIsLoading(false);
      }
    },
    [apiClient.purchaseTable, storeId, setAlertState],
  );
  return {
    results,
    fetchPurchaseTable,
    isLoading,
  };
};
