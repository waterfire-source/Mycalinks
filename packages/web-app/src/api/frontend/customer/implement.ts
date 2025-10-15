import { CustomerAPI } from '@/api/frontend/customer/api';
import { CustomError, customFetch, METHOD } from '@/api/implement';

export const customerImplement = () => {
  return {
    getCustomerByMycaID: async (
      request: CustomerAPI['getByMycaID']['request'],
    ): Promise<CustomerAPI['getByMycaID']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/customer`,
        body: request,
      })();
    },
    //非会員の顧客情報を仮登録するAPI
    createGuestCustomer: async (
      request: CustomerAPI['createGuestCustomer']['request'],
    ): Promise<CustomerAPI['createGuestCustomer']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/customer`,
        body: request,
      })();
    },
    // customerIDから顧客情報を取得するAPI
    getCustomerByID: async (
      request: CustomerAPI['getByCustomerID']['request'],
    ): Promise<CustomerAPI['getByCustomerID']['response']> => {
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/customer`,
        params: {
          id: request.customer_id,
          includesTransactionStats: request.includesTransactionStats,
        },
      })();
      if (res instanceof CustomError) throw res;
      return res[0]; // このAPIは配列が返ってくるため、一番目の要素をリターンする
    },
    // 全顧客情報を取得するAPI
    getAllCustomer: async (
      request: CustomerAPI['getAllCustomer']['request'],
    ): Promise<CustomerAPI['getAllCustomer']['response']> => {
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/customer`,
        params: {
          includesTransactionStats: request.includesTransactionStats,
          full_name: request.fullName,
          memo: request.memo,
        },
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },
    // 顧客ポイント変更
    changeCustomerPoint: async (
      request: CustomerAPI['changeCustomerPoint']['request'],
    ): Promise<CustomerAPI['changeCustomerPoint']['response']> => {
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.store_id}/customer/${request.customer_id}/point`,
        body: {
          changeAmount: request.point,
        },
      })();
    },
    //顧客情報更新　主にメモ機能
    updateCustomer: async (
      request: CustomerAPI['updateCustomer']['request'],
    ): Promise<CustomerAPI['updateCustomer']['response']> => {
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.store_id}/customer/${request.customer_id}`,
        body: {
          memo: request.memo,
        },
      })();
    },
  };
};
