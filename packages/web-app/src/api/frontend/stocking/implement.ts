import { StockingAPI } from '@/api/frontend/stocking/api';
import { customFetch, METHOD } from '@/api/implement';
import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';

export const stockingImplement = () => {
  return {
    createStocking: async (
      request: StockingAPI['createStocking']['request'],
    ): Promise<StockingAPI['createStocking']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/stocking`,
        body: request,
      })();
    },

    update: async (
      request: StockingAPI['update']['request'],
    ): Promise<StockingAPI['update']['response']> => {
      const stockingProducts: BackendStockingAPI['3']['request']['body']['stocking_products'] =
        request.stockingProducts.map((p) => {
          return {
            product_id: p.id,
            planned_item_count: p.plannedItemCount,
            unit_price: p.unitPrice,
            unit_price_without_tax: p.unitPriceWithoutTax,
          };
        });
      const body: BackendStockingAPI['3']['request']['body'] = {
        id: request.stockingID,
        planned_date: request.plannedDate,
        supplier_id: request.supplierID,
        stocking_products: stockingProducts,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/stocking`,
        body,
      })();
    },
    applyStocking: async (
      request: StockingAPI['applyStocking']['request'],
    ): Promise<StockingAPI['applyStocking']['response']> => {
      const stockingProducts: BackendStockingAPI['4']['request']['body']['stocking_products'] =
        request.stockingProducts.map((p) => {
          return {
            id: p.id,
            actual_item_count: p.actualItemCount,
          };
        });
      const body: BackendStockingAPI['4']['request']['body'] = {
        actual_date: request.actualDate,
        stocking_products: stockingProducts,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/stocking/${request.stockingID}/apply`,
        body,
      })();
    },
    cancelStocking: async (
      request: StockingAPI['cancelStocking']['request'],
    ): Promise<StockingAPI['cancelStocking']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/stocking/${request.stocking_id}/cancel`,
        body: request,
      })();
    },
    // 一覧取得
    listStocking: async (
      request: StockingAPI['listStocking']['request'],
    ): Promise<StockingAPI['listStocking']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/stocking`,
        params: {
          status: request.status,
          productName: request.productName,
          skip: request.skip,
          take: request.take,
        },
      })();
    },
    // 仕入れ先
    //新規作成
    createStockingSupplier: async (
      request: StockingAPI['createStockingSupplier']['request'],
    ): Promise<StockingAPI['createStockingSupplier']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/stocking/supplier`,
        body: request.body,
      })();
    },
    //更新
    updateStockingSupplier: async (
      request: StockingAPI['updateStockingSupplier']['request'],
    ): Promise<StockingAPI['updateStockingSupplier']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/stocking/supplier`,
        body: request.body,
      })();
    },
    //一覧取得
    listStockingSupplier: async (
      request: StockingAPI['listStockingSupplier']['request'],
    ): Promise<StockingAPI['listStockingSupplier']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/stocking/supplier`,
        params: {
          display_name: request.display_name,
          enabled: request.enabled,
        },
      })();
    },
    //IDを指定して取得 一旦使わないためここだけで定義
    // getStockingSupplier: async (
    //   request: StockingAPI['listStockingSupplier']['request'],
    // ): Promise<StockingAPI['listStockingSupplier']['response']> => {

    //   const res = await customFetch({
    //     method: METHOD.GET,
    //     url: `/api/store/${request.store_id}/stocking/supplier`,
    //     params: {
    //       id: request.id,
    //     },
    //   })();
    //   if (res instanceof CustomError) throw res;
    //   return res
    // },

    //仕入れ先削除
    deleteStockingSupplier: async (
      request: StockingAPI['deleteStockingSupplier']['request'],
    ): Promise<StockingAPI['deleteStockingSupplier']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeID}/stocking/supplier/${request.supplierID}`,
      })();
    },
    //商品マスタ関連CSVアップロード機能
    uploadCsv: async (
      request: StockingAPI['uploadCsv']['request'],
    ): Promise<StockingAPI['uploadCsv']['response']> => {
      const formData = new FormData();

      formData.append('file', request.body.file);

      return await customFetch(
        {
          url: `/api/store/${request.storeID}/stocking/csv`,
          method: METHOD.POST,
          body: formData,
        },
        true,
      )();
    },
  };
};
