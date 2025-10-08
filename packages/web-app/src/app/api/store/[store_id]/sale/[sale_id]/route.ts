import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

//セールの削除を行うことができるAPI
export const DELETE = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, sale_id } = API.params;

    //このセールがあるのか確認
    const thisSaleInfo = await API.db.sale.findUnique({
      where: {
        store_id: parseInt(store_id),
        id: parseInt(sale_id),
      },
    });

    if (!thisSaleInfo) throw new ApiError('notExist');

    await API.db.sale.delete({
      where: {
        id: thisSaleInfo.id,
      },
    });

    return API.status(200).response({
      msgContent: 'セールが正しく削除されました',
    });
  },
);
