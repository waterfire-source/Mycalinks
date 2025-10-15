import { useStore } from '@/contexts/StoreContext';
import { useCallback, useMemo, useState } from 'react';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';

export type CreateOrUpdateConsignmentClientRequest = Parameters<
  MycaPosApiClient['consignment']['createOrUpdateConsignmentClient']
>[0]['requestBody'];

export type GetConsignmentClientRequestWithoutStoreId = Omit<
  Parameters<MycaPosApiClient['consignment']['getConsignmentClient']>[0],
  'storeId'
>;
export type GetConsignmentClientResponse = Awaited<
  ReturnType<MycaPosApiClient['consignment']['getConsignmentClient']>
>;
export type ConsignmentClient =
  GetConsignmentClientResponse['consignmentClients'][0];

export type GetConsignmentProductRequestWithoutStoreId = Omit<
  Parameters<MycaPosApiClient['consignment']['getConsignmentProduct']>[0],
  'storeId'
>;
export type GetConsignmentProductResponse = Awaited<
  ReturnType<MycaPosApiClient['consignment']['getConsignmentProduct']>
>;
export type ConsignmentProduct = GetConsignmentProductResponse['products'][0];

export const useConsignment = () => {
  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  const { handleError } = useErrorAlert();
  const { store } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [consignmentClients, setConsignmentClients] =
    useState<ConsignmentClient[]>();
  const [consignmentProducts, setConsignmentProducts] =
    useState<ConsignmentProduct[]>();
  const [totalCountClients, setTotalCountClients] = useState(0);
  const [totalCountProducts, setTotalCountProducts] = useState(0);

  // 委託主の取得
  const fetchConsignmentClients = useCallback(
    async (param: GetConsignmentClientRequestWithoutStoreId) => {
      if (!store?.id) return null;
      setIsLoading(true);
      try {
        const res = await mycaPosApiClient.consignment.getConsignmentClient({
          storeId: store.id,
          ...param,
        });
        setIsLoading(false);

        setConsignmentClients(res.consignmentClients);
        setTotalCountClients(res.summary?.totalCount || 0);
        return res;
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    [handleError, mycaPosApiClient.consignment, store.id],
  );

  // 委託主の作成・更新
  const createOrUpdateConsignmentClient = useCallback(
    async (param: CreateOrUpdateConsignmentClientRequest) => {
      if (!store?.id) return null;
      setIsLoading(true);
      try {
        const res =
          await mycaPosApiClient.consignment.createOrUpdateConsignmentClient({
            storeId: store.id,
            requestBody: { ...param },
          });

        return res;
      } catch (error) {
        handleError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, mycaPosApiClient.consignment, store.id],
  );

  // 委託主の削除
  const deleteConsignmentClient = useCallback(
    async (consignmentClientId: number) => {
      if (!store?.id) return null;
      setIsLoading(true);
      try {
        const res = await mycaPosApiClient.consignment.deleteConsignmentClient({
          storeId: store.id,
          consignmentClientId,
        });

        return res;
      } catch (error) {
        handleError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, mycaPosApiClient.consignment, store.id],
  );

  // 委託商品の取得
  const fetchConsignmentProducts = useCallback(
    async (param: GetConsignmentProductRequestWithoutStoreId) => {
      if (!store?.id) return null;
      setIsLoading(true);
      try {
        const res = await mycaPosApiClient.consignment.getConsignmentProduct({
          storeId: store.id,
          ...param,
        });
        setConsignmentProducts(res.products);
        setTotalCountProducts(res.summary?.totalCount || 0);
        return res;
      } catch (error) {
        handleError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, mycaPosApiClient.consignment, store.id],
  );

  // 在庫作成API(委託商品の追加)
  const createProduct = useCallback(
    async ({
      itemId,
      condition_option_id,
      consignmentPrice,
      consignmentClientId,
      specialty_id,
      management_number,
    }: {
      itemId: number;
      condition_option_id?: number | null;
      consignmentPrice: number;
      consignmentClientId: number;
      specialty_id?: number | null;
      management_number?: string;
    }) => {
      if (!store?.id || !condition_option_id) return null;

      try {
        const res = await mycaPosApiClient.item.createProduct({
          storeId: store.id,
          itemId,
          requestBody: {
            condition_option_id,
            specific_sell_price: consignmentPrice,
            consignment_client_id: consignmentClientId,
            specialty_id,
            management_number,
          },
        });

        return res;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    [handleError, mycaPosApiClient.item, store.id],
  );

  // 委託商品の存在確認
  const checkConsignmentProductExists = useCallback(
    async ({
      consignmentClientID,
      consignmentClientFullName,
      itemId,
      condition_option_id,
      specialty_id,
      actual_sell_price,
    }: {
      consignmentClientID: number;
      consignmentClientFullName: string;
      itemId: number;
      condition_option_id?: number | null;
      specialty_id?: number | null;
      actual_sell_price: number;
    }) => {
      if (!store?.id) return false;

      try {
        // 委託主の名前で委託商品を検索
        const existingProducts = await fetchConsignmentProducts({
          consignmentClientFullName: consignmentClientFullName,
        });

        if (!existingProducts?.products) return false;

        // 該当するitemIdとcondition_option_idの商品があるかチェック
        const matchingProduct = existingProducts.products.find(
          (product: any) => {
            return (
              product.item_id === itemId &&
              product.condition_option_id === condition_option_id &&
              product.consignment_client_id === consignmentClientID &&
              product.specialty_id === specialty_id &&
              product.actual_sell_price === actual_sell_price
            );
          },
        );

        return matchingProduct;
      } catch (error) {
        console.error('委託商品の存在確認に失敗:', error);
        return false;
      }
    },
    [store?.id, fetchConsignmentProducts],
  );

  // 委託在庫補充
  const stockConsignmentClientProduct = useCallback(
    async ({
      consignmentClientID,
      products,
    }: {
      consignmentClientID: number;
      products: Array<{
        product_id: number;
        item_count: number;
      }>;
    }) => {
      if (!store?.id) return null;

      try {
        const res =
          await mycaPosApiClient.consignment.stockConsignmentClientProduct({
            storeId: store.id,
            consignmentClientId: consignmentClientID,
            requestBody: { products },
          });

        return res;
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    [handleError, mycaPosApiClient.consignment, store.id],
  );

  // 在庫の論理削除(全部の在庫を取り消す時は、委託在庫取り消しAPIを叩いた後に在庫論理削除APIを叩く)
  const deleteProduct = useCallback(
    async ({ productId }: { productId: number }) => {
      if (!store?.id) return null;

      try {
        const res = await mycaPosApiClient.product.deleteProduct({
          storeId: store.id,
          productId,
        });

        return res;
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    [mycaPosApiClient.product, handleError, store.id],
  );

  // 委託在庫削除
  const cancelConsignmentProduct = useCallback(
    async ({
      productId,
      cancelCount,
    }: {
      productId: number;
      cancelCount: number;
    }) => {
      if (!store?.id) return null;

      try {
        const res = await mycaPosApiClient.product.cancelConsignmentProduct({
          storeId: store.id,
          productId,
          requestBody: { cancel_count: cancelCount },
        });

        return res;
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    [mycaPosApiClient.product, handleError, store.id],
  );

  return {
    isLoading,
    consignmentClients,
    consignmentProducts,
    totalCountClients,
    totalCountProducts,
    setConsignmentClients,
    setConsignmentProducts,
    fetchConsignmentClients,
    createOrUpdateConsignmentClient,
    deleteConsignmentClient,
    fetchConsignmentProducts,
    stockConsignmentClientProduct,
    createProduct,
    checkConsignmentProductExists,
    deleteProduct,
    cancelConsignmentProduct,
  };
};
