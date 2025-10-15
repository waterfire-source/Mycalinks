//廃止予定

import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { subscribeUpdateInventoryDef } from '@/app/api/store/[store_id]/inventory/def';

//棚卸の更新イベントを取得
export const GET = BackendAPI.defineApi(
  subscribeUpdateInventoryDef,
  async (API, { params }, registerSse) => {
    const { sendToClient, stream } = registerSse!({
      type: 'inventory', //サブスクライブするApiイベント
      condition: {
        storeId: params.store_id, //通知を受け取る条件
        resourceId: params.inventory_id, //この棚卸
      },
    });

    const currentInfo = await API.db.inventory.findUnique({
      where: {
        id: params.inventory_id,
        store_id: params.store_id,
      },
      include: {
        item_categories: true,
        item_genres: true,
        products: {
          include: {
            staff_account: {
              select: {
                display_name: true,
              },
            },
          },
        },
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    //一度今のステータスを送る
    sendToClient(currentInfo);

    //後のイベントはダイレクトにredisから送る

    return stream;
  },
);
