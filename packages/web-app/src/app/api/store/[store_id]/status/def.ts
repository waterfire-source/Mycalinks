import { ApiEventObj } from 'backend-core';
import { apiMethod, apiRole, Required, StreamRes } from '@/api/backendApi/main';
import { Store } from '@prisma/client';

//店舗のステータスを取得するリアルタイムAPI（廃止予定）
export const subscribeUpdateStoreStatusDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/status/subscribe/',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
  },
  process: `
  店舗のステータスメッセージが変更された時に通知する
  コネクション時に一度、現在のステータスメッセージを送る
  `,
  //StreamRes関数を使うことで、リアルタイムAPIのレスポンスであることを知らせる
  response: StreamRes<ApiEventObj.StoreStatus>(),
};
