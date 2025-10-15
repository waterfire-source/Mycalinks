import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Loss_Genre } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

//ロス区分の削除を行う
export const DELETE = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, loss_genre_id } = API.params;

    //存在するか確認
    let currentLossGenreInfo: Loss_Genre | null = null;

    if (loss_genre_id) {
      currentLossGenreInfo = await API.db.loss_Genre.findUnique({
        where: {
          store_id: parseInt(store_id),
          id: parseInt(loss_genre_id),
        },
      });

      if (!currentLossGenreInfo) throw new ApiError('notExist');
    }

    await API.db.loss_Genre.update({
      where: {
        id: currentLossGenreInfo?.id,
      },
      data: {
        is_deleted: true,
      },
    });

    return API.status(200).response({ msgContent: '削除が完了しました' });
  },
);
