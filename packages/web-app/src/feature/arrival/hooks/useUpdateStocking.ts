import { createClientAPI, CustomError } from '@/api/implement';
import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useMemo, useState } from 'react';
import { useCallback } from 'react';

export const useUpdateStocking = (
  stocking: BackendStockingAPI[5]['response']['200'][0],
) => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  // 編集している仕入れ情報を格納するstate
  const [editStocking, setEditStocking] =
    useState<BackendStockingAPI[5]['response']['200'][0]>(stocking);
  const updateStocking = useCallback(async () => {
    if (isLoading) return;
    // 仕入れを更新
    setIsLoading(true);

    const res = await clientAPI.stocking.update({
      storeID: store.id,
      stockingID: editStocking.id,
      plannedDate: editStocking.planned_date,
      supplierID: editStocking.supplier_id,
      stockingProducts: editStocking.stocking_products.map((product) => ({
        id: product.product_id,
        plannedItemCount: product.planned_item_count,
        unitPrice: product.unit_price,
        unitPriceWithoutTax: product.unit_price_without_tax,
      })),
    });
    if (res instanceof CustomError) {
      console.error(res);
      setAlertState({
        message: '仕入れの更新に失敗しました',
        severity: 'error',
      });
      return;
    }
    setIsLoading(false);
    return res;
  }, [clientAPI.stocking, editStocking, isLoading, setAlertState, store.id]);
  return {
    editStocking,
    setEditStocking,
    updateStocking,
    isLoading,
  };
};
