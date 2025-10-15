import { ConsignmentAPI } from '@/api/frontend/consignment/api';
import { customFetch, METHOD } from '@/api/implement';

export const consignmentImplement = () => {
  return {
    // 委託主を作成・更新するAPI
    createOrUpdateConsignmentClient: async (
      request: ConsignmentAPI['createOrUpdateConsignmentClient']['request'],
    ): Promise<
      ConsignmentAPI['createOrUpdateConsignmentClient']['response']
    > => {
      const body = {
        id: request.id,
        full_name: request.full_name,
        zip_code: request.zip_code,
        prefecture: request.prefecture,
        city: request.city,
        address2: request.address2,
        building: request.building,
        phone_number: request.phone_number,
        fax_number: request.fax_number,
        email: request.email,
        commission_cash_price: request.commission_cash_price,
        commission_card_price: request.commission_card_price,
        commission_payment_method: request.commission_payment_method,
        payment_cycle: request.payment_cycle,
        description: request.description,
        enabled: request.enabled,
      };

      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/consignment/client`,
        body,
      })();
    },

    // 委託主を取得するAPI
    getConsignmentClient: async (
      request: ConsignmentAPI['getConsignmentClient']['request'],
    ): Promise<ConsignmentAPI['getConsignmentClient']['response']> => {
      const params = {
        enabled: request.enabled,
        includesSummary: request.includesSummary,
        limit: request.limit,
        offset: request.offset,
      };

      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/consignment/client`,
        params,
      })();
    },

    // 委託主を削除するAPI
    deleteConsignmentClient: async (
      request: ConsignmentAPI['deleteConsignmentClient']['request'],
    ): Promise<ConsignmentAPI['deleteConsignmentClient']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeID}/consignment/client/${request.consignmentClientID}`,
      })();
    },

    // 委託在庫を補充するAPI
    stockConsignmentClientProduct: async (
      request: ConsignmentAPI['stockConsignmentClientProduct']['request'],
    ): Promise<ConsignmentAPI['stockConsignmentClientProduct']['response']> => {
      const body = {
        products: request.products,
      };

      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/consignment/client/${request.consignmentClientID}/stock-products`,
        body,
      })();
    },
  };
};
