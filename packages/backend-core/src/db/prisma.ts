import { Prisma, PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas';
// import { createPrismaRedisCache } from 'prisma-redis-middleware';

import * as runtime from '@prisma/client/runtime/library';
import { ProcessStorage, BackendService } from '@/services';
import { BackendCoreError } from '@/error/main';
import { createCustomDao } from '@/db/dao/main';
export * from './zod-generated';

export type PrismaTransactionOptions = {
  retry?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
  baseDelay?: number;
  maxDelay?: number;
};

export class PrismaService extends PrismaClient {
  async $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: PrismaTransactionOptions,
  ): Promise<runtime.Types.Utils.UnwrapTuple<P>>;

  async $transaction<R>(
    fn: (
      prisma: Omit<PrismaClient, runtime.ITXClientDenyList> & {
        afterCommit?: Array<() => Promise<void>>; //トランザクションコミット後に実行したいやつ
      },
    ) => Promise<R>,
    options?: PrismaTransactionOptions & { maxWait?: number; timeout?: number },
  ): Promise<R>;

  async $transaction<P extends Prisma.PrismaPromise<any>[], R>(
    argOrFn:
      | [...P]
      | ((
          prisma: Omit<PrismaClient, runtime.ITXClientDenyList> & {
            afterCommit?: Array<(db: PrismaClient) => Promise<void>>; //トランザクションコミット後に実行したいやつ
          },
        ) => Promise<R>),
    options?: PrismaTransactionOptions & {
      maxWait?: number;
      timeout?: number;
    },
    //@ts-expect-error becuase of because of 気にしない
  ): Promise<runtime.Types.Utils.UnwrapTuple<P> | R> {
    const max_retries = options?.retry || 1;
    const baseDelay = options?.baseDelay || 500; // 基本遅延時間（ミリ秒）
    const maxDelay = options?.maxDelay || 10000; // 最大遅延時間（ミリ秒）
    let retries = 0;

    while (retries < max_retries) {
      try {
        if (typeof argOrFn === 'function') {
          let afterCommit: Array<(db: PrismaClient) => Promise<void>> = [];
          //プロセスストレージは関数トランザクションでのみ対応
          const txRes = await super.$transaction(async (tx) => {
            //@ts-expect-error becuase of because of 気にしない
            tx.afterCommit = afterCommit;
            return await argOrFn(tx);
          }, options);

          //コミット後に処理するやつ（エラーが出ても無視する）
          if (afterCommit?.length > 0) {
            for (const fn of afterCommit) {
              console.log(`afterCommitを実行`);
              try {
                await fn(this);
              } catch (error) {
                console.error(error);
              }
            }
          }

          return txRes;
        }

        if (argOrFn instanceof Array) {
          return await super.$transaction(argOrFn, options);
        }

        throw new Error('Invalid argument');
      } catch (error) {
        if (PrismaUtil.isDeadlockError(error)) {
          retries++;
          if (retries < max_retries) {
            // exponential backoff with jitter
            const exponentialDelay = Math.min(
              baseDelay * Math.pow(2, retries - 1),
              maxDelay,
            );
            const jitter = Math.random() * exponentialDelay * 0.1; // 10%のジッター
            const delay = exponentialDelay + jitter;

            console.log(
              `トランザクション失敗${retries}回目、${delay}ms後に再試行`,
              error,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          } else {
            throw error;
          }
        }
        throw error;
      }
    }
  }
}

const setOffsetTime = (object: any, offsetTime: number) => {
  if (object === null || typeof object !== 'object') return;

  for (const key of Object.keys(object)) {
    const value = object[key];
    if (value instanceof Date) {
      object[key] = new Date(value.getTime() + offsetTime);
    } else if (typeof value == 'bigint') {
      //bigintだった時、numberに帰る
      object[key] = Number(value);
    } else if (value !== null && typeof value === 'object') {
      setOffsetTime(value, offsetTime);
    }
  }
};

//Prismaがタイムゾーンをサポートしていないため、ミドルウェアでなんとかする
//データベースのタイムゾーンをUTCに統一すれば済む話だが、Mycaで使っているデータベースで、ちょっとタイムゾーンの設定変更は避けたい
const timezoneMiddleware: Prisma.Middleware = async (params, next) => {
  const offsetTime = 9 * 60 * 60 * 1000;

  setOffsetTime(params.args, offsetTime);
  const result = await next(params);
  setOffsetTime(result, -offsetTime);

  return result;
};

export const prismaClientSingleton = () => {
  const prisma = new PrismaService({
    transactionOptions: {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      maxWait: 6000,
      timeout: 1000 * 60, //とりあえず1分で
    },
    // log: ['query'],
  });

  //タイムゾーン問題
  prisma.$use(timezoneMiddleware);

  //リードレプリカも接続する

  const replicas: (typeof prisma)[] = [];
  if (process.env.NEXT_PUBLIC_DATABASE_KIND == 'production') {
    const thisReplica = new PrismaService({
      datasourceUrl: process.env.READREP_DATABASE_SERVER_URL || '',
      // log: ['query'],
    });
    replicas.push(thisReplica);
  } else {
    const thisReplica = new PrismaService({
      datasourceUrl: process.env.DATABASE_SERVER_URL || '',
      // log: ['query'],
    });
    replicas.push(thisReplica);
  }

  const readReplicaPrisma = prisma.$extends(
    readReplicas({
      replicas,
    }),
  );

  // @ts-expect-error becuase of because of 順番
  const customDaoPrisma = createCustomDao(readReplicaPrisma);

  const customTransaction = customDaoPrisma.$extends({
    // const customTransaction = customDaoPrisma.$extends({
    client: {
      $processTransaction: async <R>(
        processId: number,
        argOrFn: (prisma: BackendService['db']) => Promise<R>,
        options?: PrismaTransactionOptions & {
          maxWait?: number;
          timeout?: number;
        },
      ): Promise<R> => {
        const storage = ProcessStorage.getStorage(processId);

        if (!storage) {
          throw new BackendCoreError({
            internalMessage: 'プロセスIDが見つかりません',
            externalMessage: 'サーバーエラー',
          });
        }

        return await customDaoPrisma.$transaction(async (tx) => {
          if (storage) {
            //@ts-expect-error becuase of because of extensionを無視
            storage.tx = tx;
          }

          console.log(`プロセス${processId}のトランザクション開始`);

          try {
            //@ts-expect-error becuase of because of  気にしない
            const txRes = await argOrFn(tx);
            return txRes;
          } catch (error) {
            console.log(error);
            throw error;
          } finally {
            if (storage?.tx) {
              storage.tx = null;
            }
            console.log(`プロセス${processId}のトランザクション終了`);
          }
        }, options);
      },
    },
  });

  return customTransaction;
};

//devサーバーで重複してclientインスタンスを作らない様にするため
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const getPrisma = () => {
  const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
  globalThis.prismaGlobal = prisma;

  return prisma;
};

// if (process.env.NODE_ENV !== 'production')

//PrismaのUtil
export class PrismaUtil {
  public static stringInRawQuery = (
    data: Array<string>,
    dict: Record<string, string>,
  ) => {
    const formattedData = data.filter((e) => e in dict).map((e) => `'${e}'`);

    return Prisma.raw(`(${formattedData.join(',')})`);
  };

  /**
   * デッドロックエラーの判定
   */
  public static isDeadlockError = (error: unknown): boolean => {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2034' || // デッドロック
        error.code === 'P1001' ||
        error.message?.includes('eadlock') ||
        String(error.meta?.message ?? '').includes('eadlock'))
    );
  };

  /**
   * トランザクションをリトライするデコレータ
   */
  public static retryTx = (maxRetry: number = 3, delay: number = 500) => {
    return (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) => {
      const originalMethod = descriptor.value;

      descriptor.value = async (...args: any[]) => {
        let lastError: Error | null = null;
        let retryCount = 0;

        while (retryCount < maxRetry) {
          try {
            // トランザクション内の処理を実行
            return await originalMethod.apply(this, args);
          } catch (error) {
            lastError = error as Error;

            if (!this.isDeadlockError(error)) {
              // デッドロック以外のエラーはそのままスロー
              throw error;
            }

            retryCount++;

            if (retryCount < maxRetry) {
              // 指数バックオフで待機
              const waitTime = delay * Math.pow(2, retryCount - 1);
              console.warn(
                `デッドロックが発生しました。${waitTime}ms後にリトライします。 (${retryCount}/${maxRetry})`,
                { error },
              );
              await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
          }
        }

        // 最大リトライ回数を超えた場合
        console.error(`最大リトライ回数(${maxRetry})を超えました。`, {
          lastError,
        });
        throw lastError;
      };
    };
  };

  /**
   * セーフにフィールドを追加するwhere
   * 参照されたオブジェクトに対して処理を行うため、値は返さない
   */
  public static safeWhere = (
    where: Record<string, unknown>,
    newWhere: Record<string, unknown>,
  ) => {
    //すでにANDがあったらそれに追加する形
    if (where.AND) {
      (where.AND as Record<string, unknown>[]).push(newWhere);
    } else {
      where.AND = [newWhere];
    }

    return where;
  };
}
