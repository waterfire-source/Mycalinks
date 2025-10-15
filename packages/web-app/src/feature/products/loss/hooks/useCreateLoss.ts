import { LossAPI } from '@/api/frontend/loss/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useCallback, useState } from 'react';

interface CreateLossRequest {
  reason?: string;
  datetime?: Date;
  lossGenreID?: number;
  products: {
    productId: number;
    itemCount: number;
    specificWholesalePrice?: number;
  }[];
}

export const useCreateLoss = () => {
  const { store } = useStore();
  const clientAPI = createClientAPI();
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  const createLoss = useCallback(
    async (request: CreateLossRequest) => {
      setIsLoading(true);
      const payload: LossAPI['createLoss']['request'] = {
        storeId: store.id,
        reason: request.reason,
        datetime: request.datetime,
        lossGenreId: request.lossGenreID,
        products: request.products.map((product) => ({
          productId: product.productId,
          itemCount: product.itemCount,
          specificWholesalePrice: product.specificWholesalePrice,
        })),
      };
      const response = await clientAPI.loss.createLoss(payload);
      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        setIsLoading(false);
        return response;
      }
      setIsLoading(false);
      setAlertState({
        message: 'ロスの登録に成功しました',
        severity: 'success',
      });
      return response;
    },
    [clientAPI.loss, setAlertState, store.id],
  );

  return { createLoss, isLoading };
};
