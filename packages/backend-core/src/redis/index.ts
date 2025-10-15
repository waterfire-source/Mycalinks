import RealRedis from 'ioredis';
import MockRedis from 'ioredis-mock';

export const redisConnectOption = {
  host: process.env.ELASTI_CACHE_ENDPOINT || '',
  port: 6379,
  tls: {},
};

const createRedisClient = () => {
  const pubRedisClient = process.env.ELASTI_CACHE_ENDPOINT?.includes(
    'localhost',
  )
    ? new MockRedis()
    : new RealRedis(redisConnectOption);

  const subRedisClient = process.env.ELASTI_CACHE_ENDPOINT?.includes(
    'localhost',
  )
    ? new MockRedis()
    : new RealRedis(redisConnectOption);

  const cacheRedisClient = process.env.ELASTI_CACHE_ENDPOINT?.includes(
    'localhost',
  )
    ? new MockRedis()
    : new RealRedis(redisConnectOption);

  pubRedisClient.on('error', console.log);
  subRedisClient.on('error', console.log);
  cacheRedisClient.on('error', console.log);

  //apiイベントを受け取る
  subRedisClient.subscribe('api-event');
  subRedisClient.on('subscribe', (c) =>
    console.log(`redisで${c}をサブスクライブ`),
  );

  return {
    pub: pubRedisClient,
    sub: subRedisClient,
    cache: cacheRedisClient,
  };
};

//devサーバーで重複してclientインスタンスを作らない様にするため
declare const globalThis: {
  redisGlobal: Awaited<ReturnType<typeof createRedisClient>>;
} & typeof global;

export const getRedis = () => {
  const redis = globalThis.redisGlobal ?? createRedisClient();
  // if (process.env.NODE_ENV !== 'production') globalThis.redisGlobal = redis;
  globalThis.redisGlobal = redis;

  return redis;
};

/**
 * 一時ストレージ redis利用
 */
export class TemporaryStorage {
  public static config = {
    keyInit: 'temporary-storage-',
    defaultExpires: 300,
  };

  //redisを使って一時ストレージを実現
  public static set = async (
    key: string,
    data: Record<string, unknown>,
    expires: number = this.config.defaultExpires,
  ) => {
    const generatedKey = `${this.config.keyInit}${key}`;
    const cacheData = JSON.stringify(data);
    await getRedis().cache.set(generatedKey, cacheData, 'EX', expires); //デフォルトでは60秒間有効
  };

  public static get = async <T>(key: string) => {
    const generatedKey = `${this.config.keyInit}${key}`;

    //キャッシュがあるか確認
    const cachedData = await getRedis().cache.get(generatedKey);

    if (cachedData) {
      //データがあった場合、パースして返す
      const parsed = JSON.parse(cachedData);
      return parsed as T;
    } else {
      return null;
    }
  };
}

//バックエンド内部イベント
//キーを指定してイベントを定義、タイムアウトを設定して待機（サブスクリプション）
//制限時間内にそのキーのイベントがパブリッシュされたらresolveで受け取れる
//これをwebhookとうまいこと連携する
//subscribe関数を使おうとしたが、わんちゃんポーリングの方が良い気がするためその方針でいく
// export class BackendInternalEvent {
//   // private as: 'subscriber' | 'publisher';
//   // private key: string;
//   public static config = {
//     keyInit: 'backend-cache-',
//     interval: 100,
//   };

//   private static client = getRedis().cache;

//   public static waitFor = async <T extends Record<string, unknown>>(
//     key: string,
//     expiresIn: number,
//     timeoutErr?: ApiError,
//   ) => {
//     timeoutErr =
//       timeoutErr ??
//       new ApiError({
//         status: 500,
//         messageText: '処理がタイムアウトしました',
//       });

//     key = `${this.config.keyInit}${key}`;

//     //すでに使われているキーだったらエラー
//     if (await this.client.get(key)) {
//       throw new ApiError({
//         status: 500,
//         messageText: '二重処理検出',
//       });
//     }

//     //サブスクライブする
//     return new Promise((res, rej) => {
//       let timer: NodeJS.Timeout;
//       const interval = setInterval(async () => {
//         try {
//           const thisCache = await this.client.get(key);
//           if (thisCache) {
//             const parsed: T = JSON.parse(thisCache);
//             clearTimeout(timer);
//             res(parsed);
//           }
//         } catch (e) {
//           console.error(e);
//           throw new ApiError({
//             status: 500,
//             messageText: 'サーバーエラー',
//           });
//         }
//       }, this.config.interval);

//       timer = setTimeout(async () => {
//         //タイムアウトしたら
//         //とりあえずキャッシュは消す
//         await this.client.del(key);
//         clearInterval(interval);
//         rej(timeoutErr);
//       }, expiresIn * 1000);
//     });
//   };

//   //パブリッシャー
//   public static publish = async (
//     key: string,
//     data: Record<string, unknown>,
//   ) => {
//     key = `${this.config.keyInit}${key}`;

//     //パブリッシュ
//     await this.client.set(key, JSON.stringify(data), 'EX', 60); //1分間有効
//   };
// }
