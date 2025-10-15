//OAuth同意画面のURLを取得（state付き）

import { BackendAPI } from '@/api/backendApi/main';
import { ochanokoEmailWebhookApi } from 'api-generator';
import { TaskManager } from 'backend-core';
import { CustomCrypto } from 'common';

// webhook

// [廃止予定] Lambdaから直接SQSにメッセージを送信する形に変更したため廃止予定
export const POST = BackendAPI.create(
  ochanokoEmailWebhookApi,
  async (API, { body }) => {
    //とりあえずメールを確認
    console.log('メールちゃんときたよ！');
    console.log(body);

    const { orderInfo } = body;

    //タスクに変換する
    const taskManager = new TaskManager({
      targetWorker: 'externalEc',
      kind: 'ochanokoOrder',
    });

    //メールアドレスと組み合わせてキーを作る
    const mailMd5ed = CustomCrypto.md5(orderInfo.storeEmail);

    await taskManager.publish({
      body: [
        {
          email: orderInfo.storeEmail,
          order_id: orderInfo.orderId,
          kind: orderInfo.status,
        },
      ],
      service: API,
      specificGroupId: `ochanoko-${mailMd5ed}-order`,
      fromSystem: true,
    });
  },
);
