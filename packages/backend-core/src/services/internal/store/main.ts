import { BackendCoreError } from '@/error/main';
import { BackendService } from '@/services/internal/main';
import { Store } from '@prisma/client';

export class BackendCoreStoreService extends BackendService {
  constructor(storeId?: Store['id']) {
    super();
    this.setIds({
      storeId,
    });
  }

  public rule = {
    //「エラー」が含まれていたらエラーメッセージということにする
    statusMessageDict: {
      registerItemFromApp: {
        doing: 'Mycaアプリからアイテムを登録しています',
        error: 'Mycaアプリからアイテムを登録している時にエラーが発生しました',
        finished: 'Mycaアプリからアイテムを登録する処理が完了しました',
      },
      autoUpdatedFromApp: {
        doing: 'Mycaアプリに登録された新しいアイテムを登録しています',
        error:
          'Mycaアプリに登録された新しいアイテムを登録している時にエラーが発生しました',
        finished:
          'Mycaアプリに登録された新しいアイテムを登録する処理が完了しました',
      },
      createNewCondition: {
        doing: '新しい状態の商品を生成しています',
        error: '新しい状態の商品を生成している時にエラーが発生しました',
        finished: '新しい状態の商品を生成する処理が完了しました',
      },
    },
  } as const;

  //ゲッターで定義する
  public get todayOpenedAt() {
    return (async () => {
      if (!this.ids.storeId)
        throw new BackendCoreError({
          internalMessage: 'ストアIDが指定されていません',
        });

      const thisStoreOpenedHistory = await this.db.store_History.findFirst({
        where: {
          store_id: this.ids.storeId!,
          kind: 'opened',
        },
        orderBy: [
          {
            run_at: 'desc',
          },
        ],
      });

      if (
        !thisStoreOpenedHistory ||
        thisStoreOpenedHistory.setting_value == '0'
      )
        throw new BackendCoreError({
          internalMessage: '開店されていないか、もしくはすでに閉店されています',
          externalMessage: '開店されていないか、もしくはすでに閉店されています',
        });

      console.info(
        `ストア${this.ids.storeId}の最終開店日時は${thisStoreOpenedHistory.run_at}`,
      );
      return thisStoreOpenedHistory.run_at;
    })();
  }

  /**
   * 店舗の開閉店
   *
   */
  @BackendService.WithIds(['storeId'])
  @BackendService.WithResources(['store'])
  public changeOpen = async (newStatus: Store['opened']) => {
    if (this.resources.store!.opened == newStatus) {
      throw new BackendCoreError({
        internalMessage: 'すでに開店しているか、もしくは閉店しています',
        externalMessage: 'すでに開店しているか、もしくは閉店しています',
      });
    }

    return await this.db.store.update({
      where: {
        id: this.ids.storeId!,
      },
      data: {
        opened: newStatus,
      },
    });
  };

  @BackendService.WithIds(['storeId'])
  public setStatusMessage = async (message: string) => {
    console.log(
      `店${this.ids.storeId}のステータスメッセージを\n${message}\nにしました`,
    );

    const updateRes = await this.db.store.update({
      where: {
        id: this.ids.storeId!,
      },
      data: {
        status_message: `リクエストID: ${this.processId} ${message}`,
        status_message_updated_at: new Date(),
      },
      select: {
        id: true,
        status_message: true,
        status_message_updated_at: true,
      },
    });

    //このイベントをエミットする
    // const apiEvent = new ApiEvent({
    //   type: 'storeStatus',
    //   API: this.API,
    //   specificStoreId: updateRes.id,
    //   obj: updateRes,
    // });

    // await apiEvent.emit();
  };
}
