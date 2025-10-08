import { CustomError } from '@/api/implement';
import { MycaPosApiClient } from 'api-generator/client';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

export interface ProductImageData {
  image_url: string;
  description?: string | null;
  order_number: number;
}

export const useUpdateProductImages = () => {
  const { setAlertState } = useAlert();
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  const [isLoadingUpdateImages, setIsLoadingUpdateImages] = useState(false);

  const updateProductImages = useCallback(
    async (storeId: number, productId: number, images: ProductImageData[]) => {
      try {
        setIsLoadingUpdateImages(true);
        // Product_ImageからAPIリクエスト形式に変換
        const imageData = images.map((img) => ({
          image_url: img.image_url,
          description: img.description || null,
          order_number: img.order_number,
        }));

        const response = await apiClient.product.updateProductImages({
          storeId: storeId,
          productId: productId,
          requestBody: {
            images: imageData,
          },
        });
        setIsLoadingUpdateImages(false);
        if (response instanceof CustomError) {
          setAlertState({
            message: `${response.status}:${response.message}`,
            severity: 'error',
          });
          return { success: false };
        }

        setAlertState({
          message: `画像の更新に成功しました。`,
          severity: 'success',
        });
        return { success: true, data: response.images };
      } catch (error) {
        setIsLoadingUpdateImages(false);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setAlertState({
          message: `画像の更新でエラーが発生しました: ${errorMessage}`,
          severity: 'error',
        });
        return { success: false };
      }
    },
    [apiClient.product, setAlertState],
  );

  return {
    updateProductImages,
    isLoadingUpdateImages,
  };
};
