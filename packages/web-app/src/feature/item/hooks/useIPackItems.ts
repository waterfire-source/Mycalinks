import { createClientAPI, CustomError } from '@/api/implement';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

export const usePackItems = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [packItems, setPackItems] = useState<
    BackendItemAPI[6]['response']['200']['itemsInPack'] | undefined
  >(undefined);

  // パックのカードの情報を取得
  const fetchPackItems = useCallback(
    async (storeID: number, item_id: number, isReturn: boolean = false) => {
      const response = await clientAPI.item.getPackItem({
        storeID: storeID,
        item_id: item_id,
      });

      if (response instanceof CustomError) {
        console.error('パック情報の取得に失敗しました。');
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      console.info('取得したパック情報', response);
      setPackItems(response.itemsInPack);
      //返却が必要な場合は返却
      if (isReturn) return response.itemsInPack;
    },
    [],
  );

  return { packItems, fetchPackItems };
};
