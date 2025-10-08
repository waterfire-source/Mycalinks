import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { deleteItemGroupDef } from '@/app/api/store/[store_id]/item/def';

//商品グループ削除
export const DELETE = BackendAPI.defineApi(
  deleteItemGroupDef,
  async (API, { params }) => {
    const { store_id, item_category_id, item_group_id } = params;

    //現在の情報を取得する
    const currentInfo = await API.db.item_Group.findUnique({
      where: {
        item_category: {
          id: item_category_id,
          store_id,
        },
        id: item_group_id,
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    await API.transaction(async (tx) => {
      //物理削除する ここでcascade削除される Itemの方ではSetNull
      await tx.item_Group.delete({
        where: {
          id: item_group_id,
        },
      });
    });
  },
);
