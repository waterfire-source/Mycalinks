import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { Supplier } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';

export const useListSuppliers = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  // 一覧取得
  const listSuppliers = useCallback(
    async (enabled?: boolean) => {
      const response = await clientAPI.stocking.listStockingSupplier({
        store_id: store.id,
      });

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }

      // `enabled=false` のものを配列の最後に並べるようにソート
      const sortedSuppliers = response.sort((a, b) => {
        return a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1;
      });

      if (enabled) {
        // enabledがtrueのもののみ返す
        setSuppliers(
          sortedSuppliers.filter((supplier) => supplier.enabled === enabled),
        );
      }
      setSuppliers(sortedSuppliers);
    },
    [clientAPI.stocking, setAlertState, store.id],
  );
  return { listSuppliers, suppliers, setSuppliers };
};
