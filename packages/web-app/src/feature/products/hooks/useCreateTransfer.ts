import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';
import { useCreateProduct } from '@/feature/products/hooks/useCreateProduct';

export interface TransferItem {
  productId: number;
  itemCount: number;
  description?: string;
  specificWholesalePrice?: number;
  itemId?: number;
}

export interface CreateTransferProps {
  storeId: number;
  productId: number;
  item: TransferItem | TransferItem[];
}

export const useCreateTransfer = () => {
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { createProduct } = useCreateProduct();

  // 単一の TransferItem に対する処理
  const createTransferForSingleItem = useCallback(
    async (storeId: number, productId: number, item: TransferItem) => {
      try {
        const response = await clientAPI.product.createTransfer({
          storeID: storeId,
          productID: productId,
          body: {
            to_product_id: item.productId,
            item_count: Number(item.itemCount) ?? 0,
            specificWholesalePrice: item.specificWholesalePrice,
            description: item.description ?? null,
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
          message: `${errorMessage}`,
          severity: 'error',
        });
        return { success: false };
      }
    },
    [clientAPI, setAlertState],
  );

  // 複数の TransferItem に対する処理
  const createTransferForMultipleItems = useCallback(
    async (storeId: number, productId: number, items: TransferItem[]) => {
      try {
        const responses = await Promise.all(
          items.map((item) =>
            clientAPI.product.createTransfer({
              storeID: storeId,
              productID: productId,
              body: {
                to_product_id: item.productId,
                item_count: Number(item.itemCount) ?? 0,
                description: item.description ?? null,
                specificWholesalePrice: item.specificWholesalePrice,
              },
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
            message: `${errorMessages}`,
            severity: 'error',
          });
          return { success: false };
        } else {
          setAlertState({
            message: `登録に成功しました。`,
            severity: 'success',
          });
          return { success: true };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setAlertState({
          message: `${errorMessage}`,
          severity: 'error',
        });
        return { success: false };
      }
    },
    [clientAPI, setAlertState],
  );

  // 管理番号付きで在庫を作成してから変換を行う関数
  const createTransferWithManagementNumber = useCallback(
    async (
      storeId: number,
      sourceProductId: number,
      item: TransferItem,
      managementNumber: string,
      conditionOptionId: number,
    ) => {
      try {
        // まず管理番号付きで新しい在庫を作成
        const createProductResult = await createProduct({
          storeId: storeId,
          itemId: item.itemId || 0, // itemIdが必要
          requestBody: {
            management_number: managementNumber,
            condition_option_id: conditionOptionId,
            specific_sell_price: undefined,
            specific_buy_price: undefined,
            specialty_id: undefined,
            consignment_client_id: undefined,
            allowDuplicate: false,
          },
        });

        if (!createProductResult) {
          setAlertState({
            message: '在庫の作成に失敗しました',
            severity: 'error',
          });
          return { success: false };
        }

        // 作成した在庫のIDを使って変換を実行
        const transferItem: TransferItem = {
          ...item,
          productId: createProductResult.id,
        };

        const transferResult = await createTransferForSingleItem(
          storeId,
          sourceProductId,
          transferItem,
        );

        return transferResult;
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
    [createProduct, createTransferForSingleItem, setAlertState],
  );

  return {
    createTransferForSingleItem,
    createTransferForMultipleItems,
    createTransferWithManagementNumber,
  };
};
