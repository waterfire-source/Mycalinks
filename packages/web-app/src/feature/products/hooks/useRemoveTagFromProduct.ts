import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';

export interface useRemoveTagFromProduct {
  storeId: number;
  productId: number;
  tagId: number | number[]; // 単一または配列の tagId
}

export const useRemoveTagFromProduct = () => {
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);

  // 単一の productId に対する処理
  const removeTagFromProduct = useCallback(
    async (storeId: number, productId: number, tagId: number) => {
      try {
        const response = await clientAPI.product.removeTagFromProduct({
          storeID: storeId,
          productID: productId,
          tagID: tagId,
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: `${response.status}:${response.message}`,
            severity: 'error',
          });
          return;
        }

        setAlertState({
          message: `登録に成功しました。`,
          severity: 'success',
        });
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

  // tagIdが配列の場合に対応
  const removeTagFromProducts = useCallback(
    async (storeId: number, productId: number, tagIds: number[]) => {
      try {
        const responses = await Promise.all(
          tagIds.map((tagId) =>
            clientAPI.product.removeTagFromProduct({
              storeID: storeId,
              productID: productId,
              tagID: tagId,
            }),
          ),
        );

        const errors = responses.filter(
          (response) => response instanceof CustomError,
        );

        if (errors.length > 0) {
          const errorMessages = errors
            .map((err) =>
              err instanceof CustomError
                ? `${err.status}:${err.message}`
                : 'Unknown error',
            )
            .join(', ');

          setAlertState({
            message: `一部のタグ削除に失敗しました: ${errorMessages}`,
            severity: 'error',
          });
        } else {
          setAlertState({
            message: `すべてのタグ削除に成功しました。`,
            severity: 'success',
          });
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
    removeTagFromProduct,
    removeTagFromProducts, // 新しい useCallback を追加
  };
};
