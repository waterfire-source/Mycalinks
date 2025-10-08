import { SESCustomClient, TaskCallback, workerDefs } from 'backend-core';

//メール送信
export const sendEmailController: TaskCallback<
  typeof workerDefs.notification.kinds.sendEmail.body
> = async (task) => {
  const sesService = new SESCustomClient();

  const sendRes = await Promise.all(
    task.body.map(async (e) => {
      const sendRes = await sesService.sendEmail({
        as: e.data.as,
        to: e.data.to,
        cc: e.data.cc,
        bcc: e.data.bcc,
        title: e.data.title,
        bodyText: e.data.bodyText,
      });

      return sendRes;
    }),
  );

  console.log(sendRes);
};
