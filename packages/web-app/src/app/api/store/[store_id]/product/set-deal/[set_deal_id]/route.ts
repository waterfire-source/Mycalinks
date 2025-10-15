import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { SetDealStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

//セット販売を削除するAPI
export const DELETE = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, set_deal_id } = API.params;

    //存在確認
    const setDealInfo = await API.db.set_Deal.findUnique({
      where: {
        id: parseInt(set_deal_id),
        store_id: parseInt(store_id),
        status: {
          not: SetDealStatus.DELETED,
        },
      },
    });

    if (!setDealInfo) throw new ApiError('notExist');

    //削除する 論理削除
    await API.db.set_Deal.update({
      where: {
        id: setDealInfo.id,
      },
      data: {
        status: SetDealStatus.DELETED,
      },
    });

    return API.status(200).response({ msgContent: '削除できました' });
  },
);
