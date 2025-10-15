//廃止予定

import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { subscribeUpdateItemDef } from '@/app/api/store/[store_id]/item/def';

//パック開封履歴の更新イベントを取得
export const GET = BackendAPI.defineApi(
  subscribeUpdateItemDef,
  async (API, { params }, registerSse) => {
    const { sendToClient, stream } = registerSse!({
      type: 'item', //サブスクライブするApiイベント
      condition: {
        storeId: params.store_id, //通知を受け取る条件
        resourceId: params.item_id, //この商品マスタID
      },
    });

    //一度、このストアの商品マスタか所有権を確認するがてら、最初に一回だけイベントを送信する
    const currentInfo = await API.db.item.findUnique({
      where: {
        id: params.item_id,
        store_id: params.store_id,
      },
      include: {
        original_pack_products: {
          include: {
            staff_account: {
              select: {
                display_name: true,
                // kind: true,
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
