import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { MycaPosApiClient, InventoryService } from 'api-generator/client';
import { useMemo, useState } from 'react';

export type InventoryProductRequest = NonNullable<
  Parameters<
    typeof InventoryService.prototype.createOrUpdateInventory
  >[0]['requestBody']
>['products'];

export const useUpdateInventory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { store } = useStore();
  const { setAlertState } = useAlert();

  const mycaApiClient = useMemo(() => {
    return new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    });
  }, []);

  const updateInventory = async (
    inventoryId: number,
    products: InventoryProductRequest,
  ) => {
    setIsLoading(true);
    try {
      await mycaApiClient.inventory.createOrUpdateInventory({
        storeId: store.id,
        requestBody: {
          id: inventoryId,
          products: products,
        },
      });
      setAlertState({
        message: '棚卸の更新に成功しました',
        severity: 'success',
      });
      return { ok: true };
    } catch {
      setAlertState({
        message: '棚卸の更新に失敗しました',
        severity: 'error',
      });
      return { ok: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, updateInventory };
};
