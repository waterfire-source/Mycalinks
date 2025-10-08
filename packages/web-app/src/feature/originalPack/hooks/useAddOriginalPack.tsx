import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useMemo } from 'react';

interface Request {
  itemID: number;
  additionalStockNumber: number;
  products: { productID: number; itemCount: number }[];
}
export const useAddOriginalPackApi = () => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);

  const addOriginalPack = async (request: Request) => {
    const response = await clientAPI.item.addOriginalPack({
      storeID: store.id,
      itemID: request.itemID,
      additionalStockNumber: request.additionalStockNumber,
      products: request.products,
    });
    if (response instanceof CustomError) {
      setAlertState({
        message: response.message,
        severity: 'error',
      });
      console.error(response);
      return response;
    }
    setAlertState({
      message: '補充が完了しました',
      severity: 'success',
    });
    return response;
  };
  return { addOriginalPack };
};
