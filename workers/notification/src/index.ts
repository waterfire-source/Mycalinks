import { TaskManager } from 'backend-core';
import { sendEmailController } from './controllers/sendEmail/main';
import { pushNotificationController } from './controllers/sendPushNotification/main';

const taskManager = new TaskManager({
  targetWorker: 'notification',
});

taskManager.subscribe({
  sendEmail: sendEmailController, //メール送信
  sendPushNotification: pushNotificationController, //プッシュ通知
});
