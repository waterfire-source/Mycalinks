import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';

export interface TransferToSpecialPriceProduct {
  itemCount: number;
  sellPrice: number;
  specificAutoSellPriceAdjustment?: string;
  forceNoPriceLabel?: boolean;
}

export const useTransferToSpecialPriceProduct = () => {
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);

  const transferToSpecialPriceProduct = useCallback(
    async (
      storeId: number,
      productId: number,
      updateState: TransferToSpecialPriceProduct,
    ) => {
      try {
        const response = await clientAPI.product.transferToSpecialPriceProduct({
          storeID: storeId,
          productID: productId,
          body: {
            itemCount: updateState.itemCount,
            sellPrice: updateState.sellPrice,
            specificAutoSellPriceAdjustment:
              updateState.specificAutoSellPriceAdjustment,
            forceNoPriceLabel: updateState.forceNoPriceLabel,
          },
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: `${response.status}:${response.message}`,
            severity: 'error',
          });
          return { success: false };
        }

        setAlertState({
          message: `登録に成功しました。`,
          severity: 'success',
        });
        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setAlertState({
          message: `エラーが発生しました: ${errorMessage}`,
          severity: 'error',
        });
        return { success: false };
      }
    },
    [clientAPI, setAlertState],
  );

  return {
    transferToSpecialPriceProduct,
  };
};
