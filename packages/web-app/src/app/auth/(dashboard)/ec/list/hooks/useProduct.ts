import { useState, useCallback } from 'react';
import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';

type Product = BackendProductAPI[0]['response']['200']['products'][0];

export const useProduct = () => {
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const fetchProductById = useCallback(
    async (productId: number, storeId: number) => {
      setIsLoading(true);

      try {
        const clientAPI = createClientAPI();
        const response = await clientAPI.product.listProducts({
          storeID: storeId,
          id: productId,
          take: 1, // 1件のみ取得
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: `${response.status}:${response.message}`,
            severity: 'error',
          });
          throw response;
        }

        const product = response.products[0] || null;
        setProduct(product);
        return product;
      } catch (error) {
        setAlertState({
          message: '商品情報の取得中にエラーが発生しました。',
          severity: 'error',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setAlertState],
  );

  return {
    product,
    isLoading,
    fetchProductById,
  };
};
