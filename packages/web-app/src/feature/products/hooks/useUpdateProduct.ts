import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

export interface useUpdateProduct {
  specificSellPrice?: number | null;
  specificBuyPrice?: number | null;
  retailPrice?: number | null;
  wholesalePrice?: number;
  stockNumber?: number;
  displayName?: string;
  imageUrl?: string;
  description?: string;
  needBundleAdjust?: boolean;
  allowedPoint?: boolean;
  readonlyProductCode?: string | null;
  tabletAllowed?: boolean;
  mycalinksEcEnabled?: boolean;
  ochanokoEcEnabled?: boolean;
  shopifyEcEnabled?: boolean;
  managementNumber?: string;
  disableEcAutoStocking?: boolean;
  posReservedStockNumber?: number | null;
  specificEcSellPrice?: number | null;
  ecPublishStockNumber?: number | null;
  allowSellPriceAutoAdjustment?: boolean;
  allowBuyPriceAutoAdjustment?: boolean;
}

export const useUpdateProduct = () => {
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [isLoadingUpdateProduct, setIsLoadingUpdateProduct] = useState(false);

  const updateProduct = useCallback(
    async (
      storeId: number,
      productId: number,
      updateState: useUpdateProduct,
    ) => {
      try {
        setIsLoadingUpdateProduct(true);
        const response = await clientAPI.product.updateProduct({
          storeID: storeId,
          productID: productId,
          body: {
            specific_sell_price: updateState.specificSellPrice,
            specific_buy_price: updateState.specificBuyPrice,
            retail_price: updateState.retailPrice,
            // wholesale_price: updateState.wholesalePrice,
            stock_number: updateState.stockNumber,
            display_name: updateState.displayName,
            image_url: updateState.imageUrl,
            management_number: updateState.managementNumber,
            description: updateState.description,
            allowed_point: updateState.allowedPoint,
            readonly_product_code: updateState.readonlyProductCode,
            tablet_allowed: updateState.tabletAllowed,
            mycalinks_ec_enabled: updateState.mycalinksEcEnabled,
            ochanoko_ec_enabled: updateState.ochanokoEcEnabled,
            shopify_ec_enabled: updateState.shopifyEcEnabled,
            disable_ec_auto_stocking: updateState.disableEcAutoStocking,
            pos_reserved_stock_number: updateState.posReservedStockNumber,
            specific_ec_sell_price: updateState.specificEcSellPrice,
            ecPublishStockNumber: updateState.ecPublishStockNumber,
            allow_sell_price_auto_adjustment:
              updateState.allowSellPriceAutoAdjustment,
            allow_buy_price_auto_adjustment:
              updateState.allowBuyPriceAutoAdjustment,
          },
        });
        setIsLoadingUpdateProduct(false);
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
    updateProduct,
    isLoadingUpdateProduct,
  };
};
