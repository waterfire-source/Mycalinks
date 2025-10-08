import { BackendAPI } from '@/api/backendApi/main';
import { Store } from '@prisma/client';
import { AppAdvertisementStatus } from '@prisma/client';
import { BackendModel } from '@/api/backendApi/model/main';
import { customDayjs } from 'common';

export class BackendAppAdvertisementModel extends BackendModel {
  constructor(API: BackendAPI<any>) {
    super(API);
  }

  // 全ストアのアプリ広告ステータス更新処理
  public async updateAllStoreAdvertisementStatus() {
    await this.updateStatus();
  }

  // 特定ストアのアプリ広告ステータス更新処理
  public async updateStatus({
    storeId,
  }: {
    storeId?: Store['id'];
  } = {}) {
    const now = customDayjs().tz();
    let logText = `実行時刻：${now.format('YYYY-MM-DD HH:mm:ss')} ${
      storeId ? `対象ストア: ${storeId}` : '全ストア'
    }`;

    // UNPUBLISHED, PUBLISHEDステータスの広告を取得
    const advertisements = await this.API.db.app_Advertisement.findMany({
      where: {
        status: {
          in: [
            AppAdvertisementStatus.UNPUBLISHED,
            AppAdvertisementStatus.PUBLISHED,
          ],
        },
        store_id: storeId, // storeIdがない場合は条件に含めない
      },
      select: {
        id: true,
        store_id: true,
        status: true,
        start_at: true,
        end_at: true,
        on_pause: true,
      },
    });

    logText += `
処理対象広告は${advertisements.length}個あります
`;
    console.log(logText);
    try {
      // 各広告のステータスを更新
      for (const ad of advertisements) {
        await this.API.transaction(async (tx) => {
          let newStatus = ad.status;
          const currentTime = now.valueOf();

          // 開始時刻を過ぎていて終了時刻前の場合はPUBLISHED
          if (
            ad.start_at &&
            currentTime >= customDayjs(ad.start_at).valueOf() &&
            (!ad.end_at || currentTime < customDayjs(ad.end_at).valueOf())
          ) {
            newStatus = AppAdvertisementStatus.PUBLISHED;
          }
          // 終了時刻を過ぎている場合はFINISHED
          else if (
            ad.end_at &&
            currentTime >= customDayjs(ad.end_at).valueOf()
          ) {
            newStatus = AppAdvertisementStatus.FINISHED;
          }
          // それ以外（開始前）はUNPUBLISHED
          else {
            newStatus = AppAdvertisementStatus.UNPUBLISHED;
          }

          // ステータスが変更された場合のみ更新
          if (newStatus !== ad.status) {
            await tx.app_Advertisement.update({
              where: { id: ad.id },
              data: { status: newStatus },
            });

            console.log(
              `ストア:${ad.store_id} 広告:${ad.id} のステータスを${newStatus}に変更しました`,
            );
          }
        });
      }

      console.log('アプリ広告のステータス更新処理が完了しました');
    } catch (e: any) {
      console.log('アプリ広告のステータス更新処理でエラーが発生しました:', e);

      throw e; // エラーを上位に伝播させる
    }
  }
}
