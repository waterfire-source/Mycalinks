import { MycalinksTransactionAPI } from '@/api/frontend/mycalinks/transaction/api';
import { METHOD, CustomError, appCustomFetch } from '@/api/implement';
import { BackendAllTransactionAPI } from '@/app/api/store/all/transaction/api';

export const mycalinksTransactionImplement = () => {
  return {
    //すべての店の取引取得API（今の所、Mycaユーザー用）
    getAll: async (
      request?: MycalinksTransactionAPI['getAll']['request'],
    ): Promise<MycalinksTransactionAPI['getAll']['response']> => {
      const res = await appCustomFetch({
        method: METHOD.GET,
        url: `/api/store/all/transaction/`,
        params: {
          status: request?.status,
          transaction_kind: request?.transactionKind,
          store_id: request?.storeId,
        },
      });
      if (res instanceof CustomError) throw res;
      return res;
    },

    //取引の詳細情報を取得する
    getPosTransactionDetail: async (
      request: MycalinksTransactionAPI['getPosTransactionDetail']['request'],
    ): Promise<
      MycalinksTransactionAPI['getPosTransactionDetail']['response']
    > => {
      const res = await appCustomFetch({
        method: METHOD.GET,
        url: `/api/store/all/transaction/${request.transactionId}`,
        params: {
          transaction_id: request?.transactionId,
        },
      });
      if (res instanceof CustomError) throw res;
      return res;
    },
    //数量変更をPOSに送信する
    putPosTransactionCustomerCart: async (
      request: MycalinksTransactionAPI['putPosTransactionCustomerCart']['request'],
    ): Promise<
      MycalinksTransactionAPI['putPosTransactionCustomerCart']['response']
    > => {
      const res = await appCustomFetch({
        method: METHOD.PUT,
        url: `/api/store/all/transaction/${request.transactionId}/customer-cart`,
        params: {
          transaction_id: request?.transactionId,
        },
        body: { carts: request.carts },
      });
      if (res instanceof CustomError) throw res;
      return res;
    },
    //署名記録API
    putPosTransaction: async (
      request: MycalinksTransactionAPI['putPosTransaction']['request'],
    ): Promise<MycalinksTransactionAPI['putPosTransaction']['response']> => {
      const params: BackendAllTransactionAPI[3]['request']['params'] = {
        transaction_id: request.transactionId,
      };
      const res = await appCustomFetch({
        method: METHOD.PUT,
        url: `/api/store/all/transaction/${request.transactionId}`,
        params,
        body: {
          signature_image_url: request.signatureImageUrl ?? null,
          term_accepted_at: request.termAcceptedAt ?? null,
        },
      });
      if (res instanceof CustomError) throw res;
      return res;
    },
  };
};
