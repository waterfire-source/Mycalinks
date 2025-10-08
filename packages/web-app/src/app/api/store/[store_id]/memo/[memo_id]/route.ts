import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { deleteMemoApi } from 'api-generator';

//メモ削除
export const DELETE = BackendAPI.create(
  deleteMemoApi,
  async (API, { params }) => {
    const currentInfo = await API.db.memo.findUnique({
      where: {
        store_id: params.store_id,
        id: params.memo_id,
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    //upsertする
    await API.db.memo.delete({
      where: {
        id: currentInfo.id,
      },
    });
  },
);
