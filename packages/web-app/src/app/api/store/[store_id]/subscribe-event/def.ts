import { ApiEventBody } from 'backend-core';
import { ApiEventType } from 'backend-core';
import { apiMethod, apiRole, Required, StreamRes } from '@/api/backendApi/main';
import { Store } from '@prisma/client';

//店舗関連のリアルタイムイベントを取得するAPI（SSE）
export const subscribeStoreEventDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/subscribe-event/',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
  },
  process: `
  `,
  response: StreamRes<ApiEventBody>(),
};

//イベントの種類は
let eventKinds: ApiEventType; //この型を参照
