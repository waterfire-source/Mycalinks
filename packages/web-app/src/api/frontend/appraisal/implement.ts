import { AppraisalAPI } from '@/api/frontend/appraisal/api';
import { CustomError, customFetch, METHOD } from '@/api/implement';
import { getAppraisalDef } from '@/app/api/store/[store_id]/appraisal/def';

export const appraisalImplement = () => {
  return {
    getAppraisal: async (
      request: AppraisalAPI['getAppraisal']['request'],
    ): Promise<AppraisalAPI['getAppraisal']['response']> => {
      type GetAppraisalParams = typeof getAppraisalDef.request.query;

      const params: GetAppraisalParams = {
        id: request.id,
        finished: request.finished,
      };

      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/appraisal/`,
        params,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },
    createAppraisal: async (
      request: AppraisalAPI['createAppraisal']['request'],
    ): Promise<AppraisalAPI['createAppraisal']['response']> => {
      const body = {
        staff_account_id: request.staff_account_id,
        appraisal_company_name: request.appraisal_company_name,
        appraisal_fee: request.appraisal_fee,
        products: request.products.map((product) => ({
          product_id: product.product_id,
          item_count: product.item_count,
        })),
      };
      const res = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/appraisal/`,
        body,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },
    inputAppraisalResult: async (
      request: AppraisalAPI['inputAppraisalResult']['request'],
    ): Promise<AppraisalAPI['inputAppraisalResult']['response']> => {
      const body = {
        staff_account_id: request.staff_account_id,
        products: request.products.map((product) => ({
          id: product.id,
          appraisal_result_tag_id: product.appraisal_result_tag_id,
          appraisal_number: product.appraisal_number,
          sell_price: product.sell_price,
          condition_option_id: product.condition_option_id,
        })),
      };
      const res = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.store_id}/appraisal/${request.appraisal_id}/result/`,
        body,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },
  };
};
