import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { ArrivalProductSearchType } from '@/feature/arrival/register/searchModal/type';
import { useMemo, useState } from 'react';
import { useCallback } from 'react';

interface UpsertStockingProps {
  stockingID: number;
  plannedDate: string;
  supplierID: number;
  stockingProducts: ArrivalProductSearchType[];
  isTaxIncluded: boolean;
}

export const useUpsertStocking = () => {
  const { setAlertState } = useAlert();
  const { store } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const clientAPI = useMemo(() => createClientAPI(), []);

  const upsertStocking = useCallback(
    async ({
      stockingID,
      plannedDate,
      supplierID,
      stockingProducts,
      isTaxIncluded,
    }: UpsertStockingProps) => {
      if (isLoading) return;
      setIsLoading(true);

      try {
        const res = await clientAPI.stocking.update({
          storeID: store.id,
          stockingID,
          plannedDate,
          supplierID,
          stockingProducts: stockingProducts
            .filter((product) => product.id !== null)
            .map((product) => ({
              id: product.id as number,
              plannedItemCount: product.arrivalCount ?? 0,
              unitPrice: isTaxIncluded ? product.arrivalPrice ?? null : null,
              unitPriceWithoutTax: !isTaxIncluded
                ? product.arrivalPrice ?? null
                : null,
            })),
        });

        if (res instanceof CustomError) {
          throw new Error(`${res.status}: ${res.message}`);
        }
        setAlertState({
          message: '仕入れの更新に成功しました',
          severity: 'success',
        });
      } catch (error) {
        console.error(error);
        setAlertState({
          message: '仕入れの更新に失敗しました',
          severity: 'error',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clientAPI.stocking, isLoading, store.id, setAlertState],
  );

  return { upsertStocking, isLoading };
};
