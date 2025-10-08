//ワーカー向けのタスク管理をするためのクラス

import { BackendService } from '@/services/internal/main';
import {
  SQSCustomClient,
  EventBridgeSchedulerCustomClient,
} from '@/services/external/aws/main';

import * as ItemTask from './types/item';
import * as TransactionTask from './types/transaction';
import * as EcOrderTask from './types/ec-order';
import * as ExternalEcTask from './types/external-ec';
import * as ScheduledTask from './types/scheduled';
import * as NotificationTask from './types/notification';
import { BackendCoreError } from '@/error/main';
import { CustomCrypto, customDayjs, sleep } from 'common';
import { getPrisma, Task_Item } from '@/db/prisma';
import { Prisma, Task, TaskItemStatus, TaskStatus } from '@prisma/client';
import { ApiEvent } from '@/event/main';
import { TaskMetadata, workerDefs } from '@/task/def';
export { ItemTask, EcOrderTask, TransactionTask, ExternalEcTask };

/**
 * SQSにタスク形式でプッシュしたり、タスク形式でプッシュしてもらったりするためのクラス
 * ここでタスクを分割したりもする
 */
export class TaskManager {
  public sqsClient: SQSCustomClient;
  public queueUrl: string;
  public topicArn: string;
  public targetWorker: keyof typeof workerDefs;
  public kind?: AllKindsType;
  public db = getPrisma();
  private def: WorkerDefs[keyof WorkerDefs];

  constructor({
    targetWorker,
    kind,
  }: {
    targetWorker: keyof typeof workerDefs; //対象のワーカー
    kind?: AllKindsType; //タスクの種類
  }) {
    const thisDef = workerDefs[targetWorker];
    this.queueUrl = thisDef.queueUrl!;
    this.sqsClient = new SQSCustomClient(this.queueUrl);
    this.targetWorker = targetWorker;
    this.kind = kind;
    this.def = thisDef;
  }

  /**
   * タスクをプッシュする
   */
  public publish = async <T extends AllBodyTypes>({
    body,
    service,
    processDescription,
    suffix = '',
    fromSystem = false,
    hiddenTask = false,
    delaySeconds = 0,
    specificGroupId,
    metadata,
    source,
  }: {
    body: T[];
    service: BackendService;
    processDescription?: string;
    suffix?: string;
    fromSystem?: boolean;
    hiddenTask?: boolean;
    delaySeconds?: number;
    specificGroupId?: string; //SQSのグループIDを指定したい時
    metadata?: TaskMetadata;
    source?: Task['source'];
  }) => {
    //kindがなかったらエラー
    if (!this.kind) {
      throw new BackendCoreError({
        internalMessage: 'タスクの種類が指定されていません',
        externalMessage: 'サーバーエラー',
      });
    }

    //bodyが空だったらそのままリターン
    if (!body.length) return [];

    const workerDef = workerDefs[this.targetWorker];
    const kindDef = workerDef.kinds[this.kind];
    const chunkSize = kindDef.chunkSize as number;
    const chunked = this.chunkTask(body); //ここでついでに処理IDを入れる
    const resources = service.resources;
    const ids = service.ids;
    const pushedTaskIds: Array<string> = [];

    const fromProcessId =
      specificGroupId ??
      String(service.processId) + `${suffix ? `-${suffix}` : ''}`;

    delaySeconds = delaySeconds || kindDef.delaySeconds;

    let chunkId = 1;

    //md5生成
    const toHashBody = `${this.targetWorker}-${this.kind}-${JSON.stringify(
      body,
    )}`;
    const md5 = CustomCrypto.md5(toHashBody);

    //タスクをDBに入れる（システムからのタスクではない場合）
    if (!fromSystem) {
      const taskInfo = await this.db.task.create({
        data: {
          target_worker: this.targetWorker,
          kind: this.kind,
          md5,
          item_count_per_task: chunkSize,
          process_description: processDescription,
          total_queued_task_count: chunked.length,
          total_processed_task_count: 0,
          process_id: fromProcessId,
          corporation_id: hiddenTask ? null : ids.corporationId,
          store_id: hiddenTask ? null : ids.storeId,
          metadata,
          source,
        },
      });

      //APIイベントとして発する
      const apiEvent = new ApiEvent({
        type: 'taskProgress',
        service,
        //@ts-expect-error becuase of because of
        obj: taskInfo,
      });

      await apiEvent.emit();
    }

    let actualGroupId =
      String(service.processId) + `${suffix ? `-${suffix}` : ''}`;

    if (service.ids.storeId && kindDef.specificGroup) {
      actualGroupId = `${service.ids.storeId}-${kindDef.specificGroup}`;
    }

    if (specificGroupId) {
      actualGroupId = specificGroupId;
    }

    //タスクをプッシュしていく
    for (const chunk of chunked) {
      const body: QueueBody = {
        targetWorker: this.targetWorker,
        kind: this.kind,
        body: chunk,
        resources,
        fromProcessId,
        ids,
        chunkId: chunkId++,
        fromSystem,
      };

      if (delaySeconds) {
        const scheduler = new EventBridgeSchedulerCustomClient();
        const res = await scheduler.sendSqsTaskAt({
          at: customDayjs().add(delaySeconds, 'seconds').toDate(),
          body,
          sqsArn: this.sqsClient.arn,
          groupId: actualGroupId,
        });

        console.log(`タスクスケジュールをプッシュしました: ${res}`);
        pushedTaskIds.push(res.ScheduleArn!);
      } else {
        const sendRes = await this.sqsClient.sendTask({
          groupId: actualGroupId,
          worker: this.targetWorker,
          kind: this.kind,
          body,
        });

        console.log(`タスクをプッシュしました: ${sendRes}`);
        pushedTaskIds.push(sendRes!);
      }
    }

    return pushedTaskIds;
  };

  /**
   * タスクをpullしてくる　こちらでは種類とかはない
   */
  public subscribe = async (
    callbacks: Partial<Record<AllKindsType, TaskCallback<AllBodyTypes>>>,
  ) => {
    //一生続ける
    while (true) {
      const message = await this.sqsClient.receiveMessage();
      if (!message) {
        continue;
      }

      let task: BackendTask<AllBodyTypes>;
      let fromSystem = false;

      try {
        console.log(`タスクが見つかったので処理します`);
        const body = message.body as QueueBody;
        const receiptHandle = message.receiptHandle;
        const kind = body.kind;
        const callback = callbacks[kind];
        if (!callback) {
          throw new BackendCoreError({
            internalMessage: 'タスクの処理定義がありません',
          });
        }

        task = new BackendTask(body);

        if (body.fromSystem) {
          fromSystem = true;
        }

        const taskInfo = fromSystem ? null : await task.taskInfo;

        //初めての処理だったらstartedに入れる
        if (
          taskInfo?.status === TaskStatus.QUEUED &&
          taskInfo.total_processed_task_count === 0
        ) {
          await this.db.task.update({
            where: { process_id: taskInfo.process_id },
            data: { started_at: new Date(), status: TaskStatus.PROCESSING },
          });
        }

        await callback(task);

        if (taskInfo) {
          const updated = await this.db.task.update({
            where: { process_id: taskInfo.process_id },
            data: {
              total_processed_task_count: {
                increment: 1,
              },
            },
          });

          //終わってたらステータスを変える
          if (
            updated.total_processed_task_count ===
            updated.total_queued_task_count
          ) {
            await this.db.task.update({
              where: { process_id: taskInfo.process_id },
              data: {
                finished_at: new Date(),
                status: TaskStatus.FINISHED,
              },
            });

            //詳細ログは必要ないため削除
            await this.db.task_Item.deleteMany({
              where: {
                process_id: taskInfo.process_id,
              },
            });

            console.log('タスクが終わりました');
          }

          //APIイベントとして発する
          const apiEvent = new ApiEvent({
            type: 'taskProgress',
            service: task,
            specificStoreId: task.ids.storeId,
            //@ts-expect-error becuase of because of
            obj: updated,
          });

          try {
            await apiEvent.emit();
          } catch (e) {
            console.log('APIイベント発行失敗', e);
          }
        }

        //うまくいったらメッセージを削除
        console.log(`タスクが成功しました`);
        try {
          await this.sqsClient.deleteMessage(receiptHandle);
        } catch (e) {
          console.log('タスク削除処理失敗', e);
        }

        //タスクのストレージを消す
        task.destruct();

        //クールダウン時間
        await sleep(this.coolDownTime);
      } catch (error: unknown) {
        if (error instanceof BackendCoreError) {
        }

        console.error(`タスク処理中にエラー`, error);

        if (!fromSystem) {
          try {
            const updateRes = await this.db.task.update({
              where: { process_id: String(task!.fromProcessId) },
              data: {
                error_count: { increment: 1 },
              },
            });

            //エラー数が3になってたらステータスを変える
            if (updateRes.error_count > 2) {
              await this.db.task.update({
                where: { process_id: String(task!.fromProcessId) },
                data: {
                  status: TaskStatus.ERRORED,
                  errored_at: new Date(),
                  //@ts-expect-error becuase of because of
                  status_description: `タスクの処理中にエラーが発生しました ${error?.message}`,
                },
              });
            }
          } catch (e) {
            console.log('タスクエラー数更新失敗', e);
          }
        }

        //クールダウン時間 [TODO] これ設ける意味あまりないため廃止するかも
        await sleep(this.coolDownTime);
      }
    }
  };

  private chunkTask = (
    taskArray: Array<AllBodyTypes>,
  ): Array<BackendTask<AllBodyTypes>['body']> => {
    //チャンクサイズを取得
    const thisKindDef = this.def.kinds[this.kind!];
    const chunkSize = thisKindDef.chunkSize as number;
    let task_item_id = 1;

    const result: Array<BackendTask<AllBodyTypes>['body']> = [];
    for (let i = 0; i < taskArray.length; i += chunkSize) {
      const chunk = taskArray.slice(i, i + chunkSize).map((e) => ({
        task_item_id: task_item_id++,
        data: e,
      }));
      result.push(chunk);
    }
    return result;
  };

  /**
   * クールダウン区分を取得
   */
  private get coolDownTime() {
    const now = customDayjs().tz();
    const hour = now.hour();
    const coolDownDef = this.def.coolDownTime;

    if (hour >= 23 || hour <= 7) return coolDownDef.night;

    return coolDownDef.default;
  }
}

/**
 * BackendAPIのタスク版みたいな感じ
 */
export class BackendTask<T extends AllBodyTypes> extends BackendService {
  targetWorker: keyof typeof workerDefs;
  kind: AllKindsType;
  fromProcessId: string; //APIなどからタスクを追加した時、そのAPIのprocessIdを入れる
  chunkId: Task_Item['chunk_id'];
  // idempotencyKey: string; //タスクの重複を防ぐためのキー
  body: Array<{ task_item_id: Task_Item['task_item_id']; data: T }>;
  fromSystem?: boolean;

  public _taskInfo: Task & {
    items: Task_Item[]; //関係あるチャンク
  };

  /**
   * タスク情報取得
   */
  public get taskInfo() {
    return (async () => {
      if (this.fromSystem)
        throw new BackendCoreError({
          internalMessage: 'システムからのタスクには情報が含まれていません',
        });

      if (this._taskInfo) return this._taskInfo;

      const [taskInfo, items] = await Promise.all([
        this.db.task.findUnique({
          where: {
            process_id: this.fromProcessId,
          },
        }),
        this.db.task_Item.findMany({
          where: {
            process_id: this.fromProcessId,
            chunk_id: this.chunkId,
          },
        }),
      ]);

      if (!taskInfo)
        throw new BackendCoreError({
          internalMessage: 'タスク情報が見つかりません',
          externalMessage: 'サーバーエラー',
        });

      this._taskInfo = {
        ...taskInfo,
        items,
      };

      return this._taskInfo;
    })();
  }

  constructor(taskBody: QueueBody) {
    super();
    this.targetWorker = taskBody.targetWorker;
    this.kind = taskBody.kind;
    this.body = taskBody.body as Array<{
      task_item_id: Task_Item['task_item_id'];
      data: T;
    }>;

    this.generateService({
      resources: taskBody.resources,
      ids: taskBody.ids,
    });

    this.fromProcessId = taskBody.fromProcessId!;
    this.chunkId = taskBody.chunkId;
    this.fromSystem = taskBody.fromSystem;
  }

  /**
   * 冪等性を維持しつつ、アイテム一つずつ処理してコミットするやつ
   * DBに関連する処理向け
   */
  public processItems = async (callback: (data: T) => Promise<void>) => {
    //タスク情報を取得する
    const taskInfo = await this.taskInfo;

    const items = taskInfo?.items || [];

    const taskItems = this.body;

    for (const item of taskItems) {
      //すでに完了してたら飛ばす
      const thisTaskItemInfo = items.find(
        (e) => e.task_item_id === item.task_item_id,
      );
      if (thisTaskItemInfo?.status === TaskItemStatus.FINISHED) {
        continue;
      } else if (thisTaskItemInfo?.status === TaskItemStatus.ERRORED) {
        console.log(
          `エラーが発生してたタスクをやり直します taskItemId: ${item.task_item_id}`,
        );
      }

      const startTime = Date.now();

      try {
        //強制的にトランザクションを張る
        await this.transaction(async () => {
          await callback(item.data);
        });

        const endTime = Date.now();
        const processTime = endTime - startTime;

        //成功を記録
        await this.db.task_Item.upsert({
          where: {
            process_id_task_item_id: {
              process_id: String(this.fromProcessId),
              task_item_id: item.task_item_id,
            },
          },
          update: {
            status: TaskItemStatus.FINISHED,
            process_time: processTime,
          },
          create: {
            status: TaskItemStatus.FINISHED,
            process_time: processTime,
            chunk_id: this.chunkId,
            task_item_id: item.task_item_id,
            process_id: String(this.fromProcessId),
          },
        });
      } catch (error: unknown) {
        console.error(`アイテム処理中にエラー`, error);

        const endTime = Date.now();
        const processTime = endTime - startTime;

        const status_description = `
タスクアイテム処理中にエラー: ${JSON.stringify(error)}
        `;

        //エラーを記録
        await this.db.task_Item.upsert({
          where: {
            process_id_task_item_id: {
              process_id: String(this.fromProcessId),
              task_item_id: item.task_item_id,
            },
          },
          update: {
            status: TaskItemStatus.ERRORED,
            process_time: processTime,
            status_description,
          },
          create: {
            status: TaskItemStatus.ERRORED,
            process_time: processTime,
            chunk_id: this.chunkId,
            task_item_id: item.task_item_id,
            process_id: String(this.fromProcessId),
            status_description,
          },
        });

        //チャンク全体のエラーとして発する
        throw error;
      }
    }
  };
}

/**
 * 実際にキューに送る形式ピュアなデータ形式
 */
export type QueueBody = {
  targetWorker: BackendTask<AllBodyTypes>['targetWorker'];
  kind: BackendTask<AllBodyTypes>['kind'];
  fromProcessId?: BackendTask<AllBodyTypes>['fromProcessId']; //APIなどからタスクを追加した時、そのAPIのprocessIdを入れる　特に使う当てはない
  chunkId: BackendTask<AllBodyTypes>['chunkId'];
  resources: BackendTask<AllBodyTypes>['resources'];
  ids: BackendTask<AllBodyTypes>['ids'];
  fromSystem?: boolean; //システムからのイベント（ユーザーに伝えるべきタスクではなかったらtrue）
  body: BackendTask<AllBodyTypes>['body'];
};

/**
 * 共通タスクオブジェクト
 */
type WorkerDefs = typeof workerDefs;
type KindGenerator<T extends keyof WorkerDefs> = T extends any
  ? keyof WorkerDefs[T]['kinds']
  : never;
export type AllKindsType = KindGenerator<keyof WorkerDefs>;
export type AllBodyTypes =
  | ItemTask.CreateItemData
  | ItemTask.AddConditionOptionData
  | ItemTask.UpdateItemData
  | ItemTask.UpdateProductData
  | ItemTask.Stocking
  | TransactionTask.TransactionPaymentTimeout
  | EcOrderTask.EcOrderPaymentTimeout
  | ExternalEcTask.OchanokoUpdateStockNumber
  | ExternalEcTask.OchanokoUpdatePrice
  | ExternalEcTask.OchanokoOrder
  | ItemTask.UpdateMycaItemData
  | ScheduledTask.UpdateSaleStatus
  | ScheduledTask.UpdateSetDealStatus
  | ScheduledTask.UpdateBundleItemStatus
  | NotificationTask.SendPushNotification
  | NotificationTask.SendEmail
  | ScheduledTask.PayContractSubscription
  | ScheduledTask.UpdateReservationStatus
  | ExternalEcTask.ShopifyUpdateStockNumber
  | ExternalEcTask.ShopifyUpdatePrice
  | ExternalEcTask.ShopifyOrder;

export type TaskCallback<T extends AllBodyTypes> = (
  task: BackendTask<T>,
) => Promise<void>;

export * from './def';
