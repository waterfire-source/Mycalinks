import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { CustomerPointHistorySourceKind } from '@prisma/client';
import { changeCustomerPointApi } from 'api-generator';

//顧客ポイント変動
export const PUT = BackendAPI.create(
  changeCustomerPointApi,
  async (API, { params, body }) => {
    //とりあえずこのAPIでは付与上限などの制約は無視する
    const { changeAmount } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    const thisCustomerInfo = await API.db.customer.findUnique({
      where: {
        id: params.customer_id,
        store_id: params.store_id,
      },
    });

    if (!thisCustomerInfo) throw new ApiError('notExist');

    const txRes = await API.transaction(async (tx) => {
      const updateRes = await tx.customer.update({
        where: {
          id: thisCustomerInfo.id,
        },
        data: {
          owned_point: {
            increment: changeAmount,
          },
        },
      });

      return await tx.customer_Point_History.create({
        data: {
          staff_account_id,
          customer_id: updateRes.id,
          source_kind: CustomerPointHistorySourceKind.MANUAL,
          change_price: changeAmount,
          result_point_amount: updateRes.owned_point,
        },
      });
    });

    return {
      pointHistory: txRes,
    };
  },
);
