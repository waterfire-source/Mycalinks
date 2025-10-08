import { TaskManager } from 'backend-core';
import { updateSaleStatusController } from './controllers/updateSaleStatus/main';
import { updateBundleItemStatusController } from './controllers/updateBundleItemStatus/main';
import { updateSetDealStatusController } from './controllers/updateSetDealStatus/main';
import { payContractSubscriptionController } from './controllers/payContractSubscription/main';
import { updateAnnouncementStatusController } from './controllers/updateAnnouncementStatus/main';
import { updateReservationStatusController } from './controllers/updateReservationStatus/main';

const taskManager = new TaskManager({
  targetWorker: 'scheduled',
});

taskManager.subscribe({
  updateSaleStatus: updateSaleStatusController, //セールステータス更新
  updateBundleItemStatus: updateBundleItemStatusController, //バンドル商品ステータス更新
  updateSetDealStatus: updateSetDealStatusController, //セット販売ステータス更新
  payContractSubscription: payContractSubscriptionController, //契約定期支払い
  updateAnnouncementStatus: updateAnnouncementStatusController, //お知らせステータス更新
  updateReservationStatus: updateReservationStatusController, //予約ステータス更新
});
