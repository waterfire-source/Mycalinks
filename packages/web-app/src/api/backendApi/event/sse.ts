//SSE関連

import { Account, Store } from '@prisma/client';
import { ApiEventBody, BackendService } from 'backend-core';
import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { getRedis } from 'backend-core';

export type SubscribeApiEventType = {
  type?: ApiEventBody['type'];
  condition?: {
    //通知を受ける条件を登録 登録しない場合、このtypeのものが全て通知される
    accountId?: Account['id'];
    storeId?: Store['id'];
    resourceId?: number; //これは使わなそう
  };
  callback?: (eventBody: ApiEventBody) => unknown; //コールバックを指定しないと、そのままイベントボディをクライアントに返す
};

//devサーバーで重複してclientインスタンスを作らない様にするため
declare const globalThis: {
  sseClients: Map<
    BackendService['processId'], //コネクションのUUID
    {
      writer: WritableStreamDefaultWriter;
      accountId?: Account['id'];
      subscribeApiEvent?: SubscribeApiEventType;
    }
  >;
} & typeof global;

const sseClients = globalThis.sseClients ?? new Map();

export default sseClients;

if (process.env.NODE_ENV !== 'production') globalThis.sseClients = sseClients;

export class SSE {
  public static clients = sseClients;

  //クライアントを追加する
  //コールバック関数を登録しないと、ダイレクトにクライアントにイベントが返される
  //コールバック関数内での返り値（オブジェクト形式）がクライアントに送信される
  public static addClient = ({
    subscribeApiEvent,
    API,
  }: {
    subscribeApiEvent?: SubscribeApiEventType; //Apiイベントをサブスクライブする場合、情報を登録
    API: BackendAPI<any>;
  }) => {
    const processId = API.processId;
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    this.clients.set(processId, {
      writer,
      accountId: Number(API.user?.id),
      subscribeApiEvent,
    });

    //コネクションが作れたことを知らせる
    this.sendMessage(processId, {
      ok: 'successfully created connection',
    });

    //コネクションが切れた時用
    if (API.req) {
      API.req.signal.onabort = async () => {
        this.clients.delete(processId);
        await writer.ready;
        await writer.close();
      };
    }

    return {
      stream,
    };
  };

  /**
   * redisを使ってAPIイベントをサブスクライブ
   */
  public static subscribeRedis = () => {
    const subClient = getRedis().sub;

    //念の為もう一度サブスクライブ
    subClient.subscribe('api-event');

    if (!subClient.listeners('message').length) {
      subClient.on('message', async (channel, message) => {
        let eventBody: ApiEventBody;
        try {
          eventBody = JSON.parse(message);
        } catch (e) {
          console.error(e);
          return;
        }

        // console.log('apiEventBody', eventBody);

        //受けた時間を記録
        eventBody.receivedAt = new Date().getTime();

        //SSEクライアントを見ていく
        await Promise.all(
          sseClients.entries().map(async ([id, client]) => {
            //subscribeしているか確認
            if (!client.subscribeApiEvent) return;

            const subscribeInfo = client.subscribeApiEvent;

            //typeが同じか確認 typeで分けることは無くなったため廃止
            if (subscribeInfo.type && subscribeInfo.type != eventBody.type)
              return;

            //conditionがあったら、それを満たしているか確認
            if (subscribeInfo.condition) {
              let conditionMatch = true;
              for (const prop in subscribeInfo.condition) {
                // @ts-expect-error becuase of
                if (subscribeInfo.condition[prop] != eventBody[prop]) {
                  conditionMatch = false;
                  break;
                }
              }
              if (!conditionMatch) return;
            }

            //callbackがあったら、それを実行する
            let clientRes: Record<string, unknown> = eventBody;

            if (subscribeInfo.callback) {
              const res = await subscribeInfo.callback(eventBody);
              if (!res) return;

              clientRes = res as Record<string, unknown>;
            }

            await this.sendMessage(id, clientRes);
          }),
        );
      });
    }
  };

  public static sendMessage = async (
    processId: BackendService['processId'],
    data: Record<string, unknown>,
  ) => {
    const encoder = new TextEncoder();

    const client = this.clients.get(processId);
    if (!client)
      throw new ApiError({
        status: 500,
        messageText: 'SSEクライアントを見つけられませんでした',
      });

    // JSONを文字列化して改行文字をエスケープ
    const jsonString = JSON.stringify(data)
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');

    // const chunkSize = 10;

    try {
      //8千文字以上の場合、分割して送信
      // for (let i = 0; i <= jsonString.length; i += chunkSize) {
      //   let chunkMessage = jsonString.slice(i, i + chunkSize);

      //   // if (i == 0) {
      //   //   chunkMessage = 'data: ' + chunkMessage;
      //   // }
      //   chunkMessage = 'data: ' + chunkMessage + '\n';

      //   if (chunkMessage.length < chunkSize) {
      //     chunkMessage += '\n\n';
      //   }

      //   console.log('chunkMessage', chunkMessage);

      //   const message = encoder.encode(chunkMessage);

      //   await client.writer.write(message);
      // }

      const messageString = 'data: ' + jsonString + '\n\n';
      const message = encoder.encode(messageString);
      await client.writer.write(message);
    } catch (error) {
      console.error('SSE message send failed:', error);
      try {
        client.writer.releaseLock?.();
      } catch (e) {
        console.error('SSE message release lock failed:', e);
      }
      // クライアント接続が切れている場合はクライアントを削除
      this.clients.delete(processId);
    }
  };
}
