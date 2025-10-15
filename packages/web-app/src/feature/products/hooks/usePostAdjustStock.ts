import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';

export interface usePostAdjustStock {
  changeCount: number;
  wholesalePrice: number;
  reason: string;
}

export const usePostAdjustStock = () => {
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);

  const postAdjustStock = useCallback(
    async (
      storeId: number,
      productId: number,
      updateState: usePostAdjustStock,
    ) => {
      try {
        const response = await clientAPI.product.postAdjustStock({
          storeID: storeId,
          productID: productId,
          body: {
            changeCount: updateState.changeCount,
            reason: updateState.reason,
            wholesalePrice: updateState.wholesalePrice,
          },
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: `${response.status}:${response.message}`,
            severity: 'error',
          });
          return;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setAlertState({
          message: `エラーが発生しました: ${errorMessage}`,
          severity: 'error',
        });
      }
    },
    [clientAPI, setAlertState],
  );

  return {
    postAdjustStock,
  };
};
