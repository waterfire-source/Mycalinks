import { AnnouncementStatus } from '@prisma/client';
import { TaskCallback, workerDefs } from 'backend-core';
import { customDayjs } from 'common';

//お知らせのステータス更新
export const updateAnnouncementStatusController: TaskCallback<
  typeof workerDefs.scheduled.kinds.updateAnnouncementStatus.body
> = async (task) => {
  //まずは現在時間を取得する
  const now = customDayjs();
  const today = now.tz().startOf('day');

  //ステータスがUNPUBLISHEDで、今日が公開日のものを全て公開にする
  await task.db.announcement.updateMany({
    where: {
      status: AnnouncementStatus.UNPUBLISHED,
      publish_at: today.toDate(),
    },
    data: {
      status: AnnouncementStatus.PUBLISHED,
    },
  });
};
