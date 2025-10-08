import { getPrisma, PrismaTransactionOptions } from '@/db/prisma';
import { BackendCoreError } from '@/error/main';
import { TemporaryStorage } from '@/redis';
import { BackendCoreLogService } from '@/services/internal/log/main';
import {
  Account,
  Account_Group,
  Corporation,
  Ec_Setting,
  Register,
  Store,
} from '@prisma/client';
import { CustomCrypto } from 'common';

type Tx = Parameters<
  Parameters<ReturnType<typeof getPrisma>['$transaction']>[0]
>[0];

/**
 * バックエンドコアでも使うリソース定義
 */
export type BackendResources = {
  store?: //店舗関連
  | (Store & {
        accounts: Array<{ account_id: Account['id'] }>;
        ec_setting: Ec_Setting | null;
      })
    | null;
  corporation?: Corporation | null; //法人関連

  //以下主にAPI向け
  loginAccount?: Account | null; //このリクエストに結びついているPOSアカウントの情報
  actionAccount?:
    | (Account & {
        //実際に動作を行うアカウント（営業モードの場合はバーコード主）
        group: Account_Group;
      })
    | null;
  register?: Register | null; //レジ
};

/**
 * ID系
 */
export type BackendIdKind =
  | 'corporationId'
  | 'storeId'
  | 'productId'
  | 'itemId'
  | 'customerId' //顧客ID
  | 'ecOrderId'
  | 'registerId'
  | 'transactionId'
  | 'reservationId'
  | 'contractId'
  | 'shippingMethodId'
  | 'accountId'
  | 'storeShipmentId';

export type BackendIds = Partial<Record<BackendIdKind, number>>;

/**
 * 処理プロセス単位で持つストレージ
 */
export class ProcessStorage {
  public static config = {
    timeout: 2 * 60 * 60 * 1000, //とりあえず2時間でタイムアウトになるようにする
  };

  /**
   * ストレージ全体を取得する
   */
  public static get storage() {
    const processStorage = globalThis.processStorageGlobal ?? new Map();
    globalThis.processStorageGlobal = processStorage;
    return globalThis.processStorageGlobal;
  }

  /**
   * 指定されたプロセスIDのストレージを取得する
   */
  public static getStorage = (processId: number) => {
    return this.storage.get(processId);
  };

  /**
   * 番号の発行とともにストレージを作成
   * サービスクラス内では作成せず、必ずAPIの呼び出し時やワーカーのタスク開始時に作成する
   */
  public static createStorage = () => {
    const processId = this.generateProcessId();
    this.storage.set(processId, {
      processId,
      description: '',
      createdAt: new Date(),
      resources: {},
      timeout: setTimeout(() => {
        this.clearStorage(processId, true);
      }, this.config.timeout),
      tx: null,
    });
    return this.storage.get(processId)!;
  };

  /**
   * ストレージを削除
   */
  public static clearStorage = (processId: number, force?: boolean) => {
    const storage = this.storage.get(processId);
    if (storage && (force || !storage?.dontClear)) {
      clearTimeout(storage!.timeout);
      return this.storage.delete(processId);
    }
  };

  private static generateProcessId = () => {
    const timestamp = Date.now();
    const randomDigits = Math.floor(Math.random() * 1000);
    return timestamp * 1000 + randomDigits;
  };
}

export type ProcessStorageContent = {
  processId: number;
  description: string; //このプロセスでは何をしたのかの説明
  createdAt: Date;
  resources: BackendResources; //関連するリソース
  timeout: NodeJS.Timeout; //タイマーのID
  dontClear?: boolean; //自動でストレージをクリアしない
  tx: Tx | null; //トランザクションオブジェクト こいつがあるときは常にこいつを使う
  logService?: BackendCoreLogService;
};

export type ProcessStorageType = Map<number, ProcessStorageContent>;

declare const globalThis: {
  processStorageGlobal: ProcessStorageType;
} & typeof global;

export class BackendService {
  public processId: number;

  /**
   * リソースを取得
   */
  public get resources() {
    if (!this.processId) return {};

    const storage = ProcessStorage.getStorage(this.processId);
    if (!storage) return {};

    return storage.resources;
  }

  /**
   * リソースを設定
   */
  public setResources = (resources: Partial<BackendResources>) => {
    if (!this.processId) return;

    const storage = ProcessStorage.getStorage(this.processId);
    if (!storage) return;

    for (const resourceName of Object.keys(resources)) {
      if (resources[resourceName]) {
        storage.resources[resourceName] = resources[resourceName];
      }
    }
  };

  public get db() {
    return (this.tx ?? getPrisma()) as ReturnType<typeof getPrisma>;
  }

  public get primaryDb() {
    return (this.tx ?? (getPrisma() as any).$primary()) as ReturnType<
      typeof getPrisma
    >;
  }

  public get readDb() {
    return (this.tx ?? (getPrisma() as any).$replica()) as ReturnType<
      typeof getPrisma
    >;
  }

  /**
   * トランザクションオブジェクト
   */
  public get tx() {
    if (!this.processId) return null;

    const storage = ProcessStorage.getStorage(this.processId);
    if (!storage) return null;

    return storage.tx;
  }

  /**
   * プロセスストレージを取得
   */
  public get storage() {
    if (!this.processId) return null;

    const storage = ProcessStorage.getStorage(this.processId);
    if (!storage) return null;

    return storage;
  }

  /**
   * ストレージを破棄
   */
  public destruct() {
    if (!this.processId) return;

    ProcessStorage.clearStorage(this.processId);
  }

  /**
   * トランザクションを貼りやすくする processIdがないといけない
   */
  public transaction = async <R>(
    argOrFn: (prisma: BackendService['db']) => Promise<R>,
    options?: PrismaTransactionOptions & {
      maxWait?: number;
      timeout?: number;
    },
  ): Promise<R> => {
    //すでにあった場合はエラー
    if (this.tx) {
      throw new BackendCoreError({
        internalMessage: 'すでにトランザクションがあります',
        externalMessage: 'サーバーエラー',
      });
    }

    if (!this.processId) {
      throw new BackendCoreError({
        internalMessage: 'プロセスIDが設定されていません',
        externalMessage: 'サーバーエラー',
      });
    }

    return await this.db.$processTransaction(this.processId, argOrFn, options);
  };

  /**
   * トランザクション中であればそれを使い、じゃなかったらトランザクションを貼る
   */
  public safeTransaction = async <R>(
    argOrFn: (prisma: BackendService['db']) => Promise<R>,
    options?: PrismaTransactionOptions & {
      maxWait?: number;
      timeout?: number;
    },
  ): Promise<R> => {
    if (this.tx) {
      return argOrFn(this.db);
    } else if (this.processId) {
      return this.db.$processTransaction(this.processId, argOrFn, options);
    } else {
      return this.db.$transaction(argOrFn, options);
    }
  };

  constructor() {}

  /**
   * サービスクラスを作る
   */
  public generateService = ({
    ids,
    resources,
  }: {
    ids?: Partial<Record<BackendIdKind, number | undefined>>;
    resources?: Partial<BackendResources>;
  }) => {
    this.processId = ProcessStorage.createStorage().processId;

    if (ids) this.setIds(ids);
    if (resources) this.setResources(resources);

    return this;
  };

  /**
   * キャッシュ結果を返すデコレータ
   * サービスクラスのidsもキーに加わる
   * JSON形式でデータが返る
   */
  public static UseCache(expires: number = 60) {
    return (target: Object, propertyKey: string | symbol, descriptor?: any) => {
      // descriptorがundefinedの場合は早期リターン
      if (!descriptor) {
        return;
      }

      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        let cacheKey = `${target.constructor.name}:${String(propertyKey)}`;
        cacheKey = cacheKey + `:${JSON.stringify(this.ids)}`;
        const argMd5ed = CustomCrypto.md5(JSON.stringify(args));
        cacheKey = cacheKey + `:${argMd5ed}`;

        const cache = await TemporaryStorage.get(cacheKey);

        if (cache) {
          console.log(`cache hit: ${cacheKey}`);
          return cache;
        } else {
          const result = await originalMethod.apply(this, args);
          await TemporaryStorage.set(cacheKey, result, expires);
          return result;
        }
      };

      return descriptor;
    };
  }

  /**
   * バックエンドサービス系のリソースで必要なものを定義しておく
   */
  public static WithResources(resourceNames: Array<keyof BackendResources>) {
    return (target: Object, propertyKey: string | symbol, descriptor?: any) => {
      // descriptorがundefinedの場合は早期リターン
      if (!descriptor) {
        return;
      }

      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const resources = this.resources as BackendResources;

        for (const resourceName of resourceNames) {
          if (!resources[resourceName])
            throw new BackendCoreError({
              internalMessage: `コアリソース: ${resourceName}が設定されていません`,
              externalMessage: 'サーバーエラー',
            });
        }

        return await originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }

  /**
   * トランザクションが必要かどうか
   */
  public static WithTx = (
    target: Object,
    propertyKey: string | symbol,
    descriptor?: any,
  ) => {
    if (!descriptor) {
      return;
    }

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const tx = this.tx as BackendService['tx'];

      if (!tx)
        throw new BackendCoreError({
          internalMessage: 'トランザクションが設定されていません',
          externalMessage: 'サーバーエラー',
        });

      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };

  public static coreConfig = {
    systemAccountId: 100,
  };

  // public targetObject?: unknown; //サービスに依存するオブジェクトなど
  public ids: BackendIds = {};
  public subServices: Set<BackendService> = new Set();

  /**
   * このインスタンスにリソースのIDを関連づける 非破壊的
   * @param idName
   * @param id
   */
  public setIds = (ids: Partial<Record<BackendIdKind, number | undefined>>) => {
    for (const idName of Object.keys(ids)) {
      if (ids[idName] && !isNaN(Number(ids[idName])) && !this.ids[idName]) {
        this.ids[idName] = Number(ids[idName]);
      }
    }

    //サブサービスにも伝承する
    this.subServices.forEach((subService) => {
      subService.setIds(ids);
    });
  };

  /**
   * このインスタンスにリソースのIDを関連づける 破壊的
   * @param idName
   * @param id
   */
  public resetIds = (
    ids: Partial<Record<BackendIdKind, number | undefined>>,
  ) => {
    this.ids = {};

    for (const idName of Object.keys(ids)) {
      if (ids[idName] && !isNaN(Number(ids[idName]))) {
        this.ids[idName] = Number(ids[idName]);
      }
    }

    //サブサービスにも伝承する
    this.subServices.forEach((subService) => {
      subService.resetIds(ids);
    });
  };

  /**
   * プロセスIDを渡す
   */
  public setProcessId = (processId: number) => {
    if (processId) {
      this.processId = processId;

      //サブサービスにも渡す
      this.subServices.forEach((subService) => {
        subService.setProcessId(processId);
      });
    }
  };

  /**
   * サブサービスを追加
   * @param subService
   */
  public bind = (subService: BackendService) => {
    this.subServices.add(subService);
    this.give(subService);
  };

  /**
   * コアサービスを追加
   */
  public addCore = (core: BackendService) => {
    //@ts-expect-error becuase of because of  気にしない
    this.core = core;
    //@ts-expect-error becuase of because of  気にしない
    this.bind(this.core);
  };

  /**
   * トランザクションコミット後の処理を追加 txがなかったら即時実行
   */
  public async addAfterCommit(
    fn: (db: ReturnType<typeof getPrisma>) => Promise<void>,
  ) {
    //@ts-expect-error becuase of because of 気にしない
    if (!this.processId || !this.tx || !this.tx.afterCommit) {
      try {
        await fn(this.primaryDb);
      } catch (error) {
        console.error(error);
      }
    } else {
      //@ts-expect-error becuase of because of 気にしない
      this.tx.afterCommit.push(fn);
    }
  }

  /**
   * リソースやID、トランザクションなどを渡す 非破壊的
   * @param targetInstance
   */
  public give = (targetInstance: BackendService) => {
    targetInstance.setIds(this.ids);
    targetInstance.setProcessId(this.processId);
  };

  /**
   * ID系のリソースで必要なものを定義しておく
   */
  public static WithIds = (idNames: Array<BackendIdKind>) => {
    return (target: Object, propertyKey: string | symbol, descriptor?: any) => {
      if (!descriptor) {
        return;
      }

      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const ids = this.ids as BackendIds;

        for (const idName of idNames) {
          if (!ids[idName])
            throw new BackendCoreError({
              internalMessage: `ID: ${idName}が設定されていません`,
              externalMessage: 'サーバーエラー',
            });
        }

        return await originalMethod.apply(this, args);
      };

      return descriptor;
    };
  };
}
