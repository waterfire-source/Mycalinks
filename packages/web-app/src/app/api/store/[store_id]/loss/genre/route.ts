import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Loss_Genre } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

//ロス区分の登録を行うAPI IDを指定することで区分の名前を更新することもできる
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const { display_name, id } = API.body;

    API.checkField(['display_name'], true);

    let insertResult: Loss_Genre | null = null;

    //存在するか確認
    let currentLossGenreInfo: Loss_Genre | null = null;

    if (id) {
      currentLossGenreInfo = await API.db.loss_Genre.findUnique({
        where: {
          store_id: parseInt(store_id),
          id: parseInt(id),
          is_deleted: false,
        },
      });

      if (!currentLossGenreInfo) throw new ApiError('notExist');
    }

    insertResult = await API.db.loss_Genre.upsert({
      where: {
        id: parseInt(id) || 0,
      },
      create: {
        store_id: parseInt(store_id || ''),
        display_name,
      },
      update: {
        display_name,
      },
    });

    return API.status(id ? 200 : 201).response({ data: insertResult });
  },
);
//ロス区分の取得を行うAPI
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const result = await API.db.loss_Genre.findMany({
      where: {
        store_id: parseInt(store_id || ''),
        is_deleted: false,
      },
    });
    return API.status(200).response({ data: result });
  },
);
