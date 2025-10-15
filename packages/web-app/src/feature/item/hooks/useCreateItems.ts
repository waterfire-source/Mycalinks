import { ItemAPI } from '@/api/frontend/item/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

//商品登録を行うhooks
export const useCreateItems = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  const createItem = useCallback(
    async (requestBody: ItemAPI['create']['request'], item_name?: string) => {
      setIsLoading(true);
      try {
        const response = await clientAPI.item.create(requestBody);
        if (response instanceof CustomError) {
          console.error(item_name + ':商品登録に失敗しました。');
          setAlertState({
            message: `${response.status}:${response.message}`,
            severity: 'error',
          });
          return;
        }
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [clientAPI.item, setAlertState],
  );

  return { createItem, isLoading };
};
