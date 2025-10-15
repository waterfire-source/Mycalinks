//顧客更新API

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { updateCustomerApi } from 'api-generator';

export const PUT = BackendAPI.create(
  updateCustomerApi,
  async (API, { params, body }) => {
    //とりあえずこのAPIでは付与上限などの制約は無視する
    const { memo } = body;

    const thisCustomerInfo = await API.db.customer.findUnique({
      where: {
        id: params.customer_id,
        store_id: params.store_id,
      },
    });

    if (!thisCustomerInfo) throw new ApiError('notExist');

    const updateRes = await API.db.customer.update({
      where: {
        id: params.customer_id,
        store_id: params.store_id,
      },
      data: { memo },
    });

    return {
      customer: updateRes,
    };
  },
);
