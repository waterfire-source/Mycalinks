import { TransactionAPI } from '@/api/frontend/transaction/api';
import { customFetch, METHOD } from '@/api/implement';
import { getAddablePointDef } from '@/app/api/store/[store_id]/customer/api';
import { putTransactionDef } from '@/app/api/store/[store_id]/transaction/api';
import { TransactionKind, TransactionStatus } from '@prisma/client';

export const transactionImplement = () => {
  return {
    create: async (
      request: TransactionAPI['create']['request'],
    ): Promise<TransactionAPI['create']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/transaction`,
        body: request,
      })();
    },
    getTransactionDetails: async (
      request: TransactionAPI['getTransactionDetails']['request'],
    ): Promise<TransactionAPI['getTransactionDetails']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/transaction`,
        params: {
          id: request.transaction_id,
        },
      })();
    },
    //一覧取得
    listTransactions: async (
      request: TransactionAPI['listTransactions']['request'],
    ): Promise<TransactionAPI['listTransactions']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/transaction`,
        params: {
          id: request.id,
          customer_id: request.customer_id,
          staff_account_id: request.staff_account_id,
          register_id: request.register_id,
          transaction_kind: request.transaction_kind,
          payment_method: request.payment_method,
          status: request.status,
          includeSales: request.includeSales,
          today: request.today,
          buy__is_assessed: request.buy__is_assessed,
          includeCustomerCarts: request.includeCustomerCarts,
          includeReceptionNumber: request.includeReceptionNumber,
          finishedAtStart: request.finishedAtStart, //期間指定の開始日時（取引完了日時）
          finishedAtEnd: request.finishedAtEnd, //期間指定の終了日時（取引完了日時）
          createdAtStart: request.createdAtStart, //期間指定の開始日時（受付開始日時）
          createdAtEnd: request.createdAtEnd, //期間指定の終了日時（受付開始日時
          productName: request.productName,
          includeStats: request.includeStats,
          includeSummary: request.includeSummary,
          take: request.take,
          skip: request.skip,
        },
      })();
    },

    processReturn: async (
      request: TransactionAPI['processReturn']['request'],
    ): Promise<TransactionAPI['processReturn']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/transaction/${request.transaction_id}/return`,
        params: {
          store_id: request.store_id,
          transaction_id: request.transaction_id,
        },
        body: request.body,
      })();
    },
    // 一時保留されている販売の一覧を取得
    listSellDraft: async (
      request: TransactionAPI['listPurchaseDraft']['request'],
    ): Promise<TransactionAPI['listPurchaseDraft']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/transaction`,
        params: {
          transaction_kind: TransactionKind.sell,
          status: TransactionStatus.draft,
        },
      })();
    },
    // 一時保留した販売履歴をキャンセル
    // 会計中止にも使える
    cancelSellDraft: async (
      request: TransactionAPI['cancelPurchaseDraft']['request'],
    ): Promise<TransactionAPI['cancelPurchaseDraft']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/transaction/${request.transaction_id}/cancel`,
      })();
    },
    // 一時保留されている買取の一覧を取得
    listPurchaseDraft: async (
      request: TransactionAPI['listPurchaseDraft']['request'],
    ): Promise<TransactionAPI['listPurchaseDraft']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/transaction`,
        params: {
          transaction_kind: TransactionKind.buy,
          status: TransactionStatus.draft,
        },
      })();
    },
    // 一時保留した買取履歴をキャンセル
    cancelPurchaseDraft: async (
      request: TransactionAPI['cancelPurchaseDraft']['request'],
    ): Promise<TransactionAPI['cancelPurchaseDraft']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/transaction/${request.transaction_id}/cancel`,
      })();
    },
    // 買取の署名を作成できるようにする
    canCreateSignature: async (
      request: TransactionAPI['canCreateSignature']['request'],
    ): Promise<TransactionAPI['canCreateSignature']['response']> => {
      const body: putTransactionDef['request']['body'] = {
        can_create_signature: true,
      };
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeId}/transaction/${request.transactionId}`,
        body,
      })();
    },

    // 査定状況を一覧で取得する(認証無し)
    getAssessmentList: async (
      request: TransactionAPI['getAssessmentList']['request'],
    ): Promise<TransactionAPI['getAssessmentList']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/transaction`,
        params: {
          createdAtStart: request.createdAtStart,
          createdAtEnd: request.createdAtEnd, //期間指定の終了日時（受付開始日時）
          transaction_kind: TransactionKind.buy,
          status: TransactionStatus.draft,
        },
      })();
    },

    // 銀行振込情報を更新
    putPayment: async (
      request: TransactionAPI['putPayment']['request'],
    ): Promise<TransactionAPI['putPayment']['response']> => {
      const body: putTransactionDef['request']['body'] = {
        payment: {
          bank__checked: request.payment.bank__checked,
        },
      };
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeId}/transaction/${request.transactionId}/`,
        body,
      })();
    },

    /**
     * 特定の取引のレシートの情報を取得する関数
     * @param request - パラメータ（ストアIDなど）
     * @returns - EPOSコマンドなど
     */
    getReceipt: async (
      request: TransactionAPI['getReceipt']['request'],
    ): Promise<TransactionAPI['getReceipt']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.params.store_id}/transaction/${request.params.transaction_id}/receipt`,
        params: request.query,
      })();
    },

    /**
     * ストアの非会員用フォームのURLを取得する
     * @param request - パラメータ（ストアIDなど）
     * @returns - EPOSコマンドなど
     */
    getPurchaseFormUrl: async (
      request: TransactionAPI['getPurchaseFormUrl']['request'],
    ): Promise<TransactionAPI['getPurchaseFormUrl']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.params.store_id}/transaction/purchase-form-url`,
        params: request.query,
      })();
    },

    /**
     * totalPriceとcustomer_idから付与可能ポイントを取得
     * @param request - パラメータ（ストアIDなど）
     * @returns - EPOSコマンドなど
     */
    getAddPoint: async (
      request: TransactionAPI['getAddablePoint']['request'],
    ): Promise<TransactionAPI['getAddablePoint']['response']> => {
      const params: getAddablePointDef['request']['params'] = {
        store_id: request.storeId,
        customer_id: request.customerId,
      };
      const query: getAddablePointDef['request']['query'] = {
        totalPrice: request.totalPrice,
        transactionKind: request.transactionKind,
        paymentMethod: request.paymentMethod,
      };
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${params.store_id}/customer/${params.customer_id}/addable-point/`,
        params: {
          totalPrice: query.totalPrice,
          transactionKind: query.transactionKind,
          paymentMethod: query.paymentMethod,
        },
      })();
    },

    /**
     * 完了した取引を更新する
     * @param request - パラメータ（ストアIDなど）
     * @returns - EPOSコマンドなど
     */
    putTransaction: async (
      request: TransactionAPI['putTransaction']['request'],
    ): Promise<TransactionAPI['putTransaction']['response']> => {
      const body: putTransactionDef['request']['body'] = {
        customer_id: request.customerId,
        id_kind: request.idKind,
        id_number: request.idNumber,
        parental_consent_image_url: request.parentalConsentImageUrl,
        parental_contact: request.parentalContact,
      };
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeId}/transaction/${request.transactionId}`,
        body,
      })();
    },
  };
};
