import {
  BackendExternalExpoService,
  TaskCallback,
  workerDefs,
} from 'backend-core';

//プッシュ通知 100件同時に送信する
export const pushNotificationController: TaskCallback<
  typeof workerDefs.notification.kinds.sendPushNotification.body
> = async (task) => {
  const expoService = new BackendExternalExpoService();

  //100件一気に送信する
  const sendRed = await expoService.sendPushNotifications(
    task.body.map((e) => ({
      deviceId: e.data.deviceId,
      sound: e.data.sound,
      title: e.data.title,
      body: e.data.body,
    })),
  );

  console.log(sendRed);
};
