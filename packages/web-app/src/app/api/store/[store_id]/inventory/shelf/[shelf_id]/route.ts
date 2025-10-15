import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

//棚卸の棚を削除することができるAPI

export const DELETE = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, shelf_id } = API.params;

    //存在しているか確認
    const currentShelfInfo = await API.db.inventory_Shelf.findUnique({
      where: {
        store_id: parseInt(store_id),
        id: parseInt(shelf_id),
      },
    });

    if (!currentShelfInfo) throw new ApiError('notExist');

    //論理削除する
    await API.db.inventory_Shelf.update({
      where: {
        id: currentShelfInfo?.id,
      },
      data: {
        is_deleted: true,
      },
    });

    return API.status(200).response({
      msgContent: '削除に成功しました',
    });
  },
);
