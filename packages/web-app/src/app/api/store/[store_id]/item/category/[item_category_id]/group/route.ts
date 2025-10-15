import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { createOrUpdateItemGroupDef } from '@/app/api/store/[store_id]/item/def';
import { Item_Group } from '@prisma/client';

//商品グループ作成API
export const POST = BackendAPI.defineApi(
  createOrUpdateItemGroupDef,
  async (API, { params, body }) => {
    const { id, display_name } = body;

    return await API.transaction(async (tx) => {
      let currentInfo: Item_Group | null = null;

      //IDが指定されている場合
      if (id) {
        //すでにある情報を取得する
        currentInfo = await tx.item_Group.findUnique({
          where: {
            id,
            item_category: {
              id: params.item_category_id,
              store_id: params.store_id,
            },
          },
        });

        if (!currentInfo) throw new ApiError('notExist');
      }

      //作成する
      const updateRes = await tx.item_Group.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
          item_category_id: params.item_category_id,
          display_name,
        },
        update: {
          display_name,
        },
      });

      return updateRes;
    });
  },
);
