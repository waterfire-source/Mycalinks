import { BackendAPI } from '@/api/backendApi/main';
import { changeRegisterCashDef } from '@/app/api/store/[store_id]/register/def';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiRegisterService } from '@/api/backendApi/services/register/main';
//レジ内現金変動API
export const PUT = BackendAPI.defineApi(
  changeRegisterCashDef,
  async (API, { body, params }) => {
    const { changeAmount, toAmount, kind, reason } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    return await API.transaction(async (tx) => {
      const thisRegister = new BackendApiRegisterService(
        API,
        params.register_id,
      );

      const changeRes = await thisRegister.core.changeCash({
        changePrice: changeAmount,
        toPrice: toAmount,
        description: reason,
        source_kind: kind,
      });

      return changeRes.register;
    });
  },
);
