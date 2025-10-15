import { BackendAPI } from '@/api/backendApi/main';
import { Memo } from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import { createOrUpdateMemoApi, getMemoApi } from 'api-generator';

//メモ作成
export const POST = BackendAPI.create(
  createOrUpdateMemoApi,
  async (API, { params, body }) => {
    //更新モードだったら
    let currentInfo: Memo | null = null;
    const { id, content } = body;

    if (id) {
      //存在するか確認
      currentInfo = await API.db.memo.findUnique({
        where: {
          store_id: params.store_id,
          id,
        },
      });

      if (!currentInfo) throw new ApiError('notExist');
    }

    //upsertする
    const txRes = await API.transaction(async (tx) => {
      return await tx.memo.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
          content,
          store_id: params.store_id,
        },
        update: {
          content,
        },
      });
    });

    return txRes;
  },
);

//メモ取得
export const GET = BackendAPI.create(getMemoApi, async (API, { params }) => {
  const memos = await API.db.memo.findMany({
    where: {
      store_id: params.store_id,
    },
  });

  return {
    memos,
  };
});
