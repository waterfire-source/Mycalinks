import { useCallback, useRef, useState } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';

type Props = {
  storeId: number;
};

interface CreateShopifyProductResponse {
  shopifyProducts: {
    productId: string;
    variantId: string;
    inventoryItemId: string;
  }[];
}

/**Shopify商品作成フック */
export const useCreateShopifyProduct = ({ storeId }: Props) => {
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const [isLoading, setIsLoading] = useState(false);

  const createShopifyProduct = useCallback(
    async (
      productIds: number[],
    ): Promise<CreateShopifyProductResponse | null> => {
      if (productIds.length === 0) {
        setAlertState({
          message: '商品が選択されていません',
          severity: 'error',
        });
        return null;
      }

      setIsLoading(true);
      try {
        const response = await apiClient.current.shopify.createShopifyProduct({
          storeId: storeId,
          requestBody: {
            productIds: productIds,
          },
        });

        setAlertState({
          message: `${productIds.length}件の商品をShopifyに作成しました`,
          severity: 'success',
        });

        return {
          shopifyProducts: response.shopifyProducts,
        };
      } catch (error) {
        handleError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [storeId, setAlertState, handleError],
  );

  return {
    createShopifyProduct,
    isLoading,
  };
};
