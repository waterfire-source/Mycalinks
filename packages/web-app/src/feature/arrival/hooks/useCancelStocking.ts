import { createClientAPI, CustomError } from '@/api/implement';
import { MycaPosApiClient } from 'api-generator/client';
import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useMemo, useState } from 'react';
import { useCallback } from 'react';
import { useErrorAlert } from '@/hooks/useErrorAlert';
interface Props {
  stocking: BackendStockingAPI[5]['response']['200'][0];
}
export const useCancelStocking = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const mycaPosApiClient = useMemo(() => {
    return new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    });
  }, []);
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const [isLoading, setIsLoading] = useState(false);
  const cancelStocking = useCallback(
    async ({ stocking }: Props) => {
      if (isLoading) return;
      // 仕入れを作成
      setIsLoading(true);
      try {
        const res = await clientAPI.stocking.cancelStocking({
          store_id: store.id,
          stocking_id: stocking.id,
        });
        if (res instanceof CustomError) {
          throw new Error(`${res.status}: ${res.message}`);
        }
        setAlertState({
          message: '仕入れをキャンセルしました',
          severity: 'success',
        });
        return res;
      } catch (e) {
        console.error(e);
        setAlertState({
          message: '仕入れのキャンセルに失敗しました',
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [clientAPI.stocking, isLoading, setAlertState, store.id],
  );

  const rollbackStocking = useCallback(
    async ({ stocking }: Props) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const res = await mycaPosApiClient.stocking.rollbackStocking({
          storeId: store.id,
          stockingId: stocking.id,
          // bodyを空オブジェクトにしないとエラーでます
          requestBody: {},
        });

        return res;
      } catch (e) {
        handleError(e);
        return;
      } finally {
        setIsLoading(false);
      }
    },
    [mycaPosApiClient.stocking, store.id, setAlertState, handleError],
  );
  return {
    cancelStocking,
    rollbackStocking,
    isLoading,
  };
};
