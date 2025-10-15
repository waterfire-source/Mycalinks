//Productにタグをつける

import { BackendAPI } from '@/api/backendApi/main';
import { subscribeStoreEventDef } from '@/app/api/store/[store_id]/subscribe-event/def';

//店舗関連のイベントをリアルタイムで受けるAPI
export const GET = BackendAPI.defineApi(
  subscribeStoreEventDef,
  async (API, { params }, registerSse) => {
    const { stream } = registerSse!({
      //SSEのクライアントをサーバーに追加する
      condition: {
        storeId: params.store_id, //通知を受け取る条件
      },
    });

    //後のイベントはダイレクトにredisから送る

    return stream; //streamオブジェクトを返すことで、リアルタイムでレスポンスを返す
  },
);
