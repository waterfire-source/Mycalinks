//ElastiCache Redis関連（主にリアルタイムAPI用のPub/Subなど）
import { Account, Store } from '@prisma/client';

import { v4 as uuidv4 } from 'uuid';
import { ApiEventType } from '@/event/eventObj';
import { BackendService } from '@/services';
import { getRedis } from '@/redis';
export { ApiEventType, ApiEventObj } from '@/event/eventObj';

//ローカルでの検証ではElastiCacheに接続できないため、Dockerでredisサーバーを立ててシミュレーションしたいが、
//そもそもローカルではAPIサーバー（ECSタスク）が複数になることがないため、pub/subサーバーを経由せずに
//一台のAPIサーバーで全てを再現することにする

//Apiのイベントを定義する
//スタティック関数でイベントを受け取れる

//ここで、外部サービス向けイベント（webhook）も提供したい

export type ApiEventBody = {
  id: string;
  emittedAt?: number; //イベントがPubサーバーにより発せられた時間
  receivedAt?: number; //イベントをSubサーバーが受け取った時間
  createdAt: number; //イベントが作成された時間
  accountId: Account['id']; //イベントを発したアカウントのID
  storeId: Store['id']; //イベントに関連づけられているストアのID
  resourceId?: number; //結びついているリソースのIDなど
} & ApiEventType;

export class ApiEvent {
  private redisClient = getRedis();
  public static config = {
    channelId: 'api-event',
  };

  public body: ApiEventBody;

  //イベントを作成する
  constructor({
    type,
    obj,
    service,
    specificAccountId,
    specificStoreId,
    specificResourceId,
  }: {
    service: BackendService;
    specificAccountId?: Account['id'];
    specificStoreId?: Store['id'];
    specificResourceId?: number;
  } & ApiEventType) {
    const accountId =
      specificAccountId ?? Number(service?.resources.actionAccount?.id ?? 0);
    const storeId = specificStoreId ?? Number(service?.ids.storeId ?? 0);

    this.body = {
      id: uuidv4(),
      type,
      createdAt: new Date().getTime(),
      storeId,
      accountId,
      resourceId: specificResourceId,
      obj,
    } as ApiEventBody;
  }

  //イベントを発する
  public emit = async () => {
    this.body.emittedAt = new Date().getTime();

    const publishRes = await this.redisClient.pub.publish(
      ApiEvent.config.channelId,
      JSON.stringify(this.body),
    );

    return publishRes;
  };
}
