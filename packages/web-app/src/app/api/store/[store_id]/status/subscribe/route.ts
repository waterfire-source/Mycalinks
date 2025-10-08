//廃止予定

import { BackendAPI } from '@/api/backendApi/main';
import { subscribeUpdateStoreStatusDef } from '@/app/api/store/[store_id]/status/def';
import { ApiError } from '@/api/backendApi/error/apiError';

//店舗ステータスをリアルタイムで取得するAPI
export const GET = BackendAPI.defineApi(
  subscribeUpdateStoreStatusDef,
  async (API, { params }, registerSse) => {
    const { sendToClient, stream } = registerSse!({
      //SSEのクライアントをサーバーに追加する
      type: 'storeStatus', //サブスクライブするApiイベント
      condition: {
        storeId: params.store_id, //通知を受け取る条件
      },
    });

    //このストアのステータスを一度取得する
    const statusInfo = API.resources.store;

    if (!statusInfo)
      throw new ApiError({
        status: 404,
        messageText: '店舗が見つかりません',
      });

    //一度今のステータスを送る
    sendToClient({
      id: statusInfo.id,
      status_message: statusInfo.status_message,
      status_message_updated_at: statusInfo.status_message_updated_at,
    });

    //後のイベントはダイレクトにredisから送る

    return stream; //streamオブジェクトを返すことで、リアルタイムでレスポンスを返す
  },
);
