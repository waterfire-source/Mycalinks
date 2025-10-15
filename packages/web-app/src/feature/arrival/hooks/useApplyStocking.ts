import { createClientAPI, CustomError } from '@/api/implement';
import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { useCallback } from 'react';

interface Props {
  actualDate: Dayjs;
  stocking: BackendStockingAPI[5]['response']['200'][0];
}
export const useApplyStocking = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const applyStocking = useCallback(
    async ({ actualDate, stocking }: Props) => {
      if (isLoading) return;
      // 仕入れを作成
      setIsLoading(true);
      try {
        const res = await clientAPI.stocking.applyStocking({
          storeID: store.id,
          stockingID: stocking.id,
          actualDate: actualDate.toDate(),
          stockingProducts: stocking.stocking_products.map((product) => ({
            id: product.id,
            actualItemCount: product.actual_item_count ?? 0,
          })),
        });
        if (res instanceof CustomError) {
          throw new Error(`${res.status}: ${res.message}`);
        }
        setAlertState({
          message: '仕入れの作成に成功しました',
          severity: 'success',
        });
        return res;
      } catch (e: unknown) {
        console.error(e);
        setAlertState({
          message: (e as Error).message,
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [clientAPI.stocking, isLoading, setAlertState, store.id],
  );
  return {
    applyStocking,
    isLoading,
  };
};
