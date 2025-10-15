import { BackendAPI } from '@/api/backendApi/main';
import {
  ClientKind,
  ContactAccountKind,
  ContactServiceKind,
} from '@prisma/client';
import { submitEcContactApi } from 'api-generator';
import { TaskManager } from 'backend-core';

//ECアプリ向けお問い合わせフォーム（Mycalinks向け）
export const POST = BackendAPI.create(
  submitEcContactApi,
  async (API, { body }) => {
    const { kind, content, myca_item_id } = body;

    const mycaUserId = API.mycaUser?.id;
    // const mycaUserId = 123491;

    const createRes = await API.db.contact.create({
      data: {
        service_kind: ContactServiceKind.EC,
        client_kind: ClientKind.CUSTOMER,
        account_id: mycaUserId,
        account_kind: mycaUserId ? ContactAccountKind.APP : undefined,
        kind,
        content,
        myca_item_id: myca_item_id,
      },
    });

    //以下、オーダーが完了した時の通知などを行う

    const taskManager = new TaskManager({
      targetWorker: 'notification',
      kind: 'sendEmail',
    });

    const to = 'ec-support@myca.co.jp'; //[TODO] 環境変数とかで管理したい

    await taskManager.publish({
      body: [
        {
          as: 'system',
          to,
          title: '[Mycalinks EC] アプリ側お問い合わせ',
          bodyText: `
サービス:${createRes.service_kind}
クライアント種類:${createRes.client_kind}
アカウントID:${createRes.account_id}
アカウント種類:${createRes.account_kind}
お問い合わせ種類:${createRes.kind}
お問い合わせ内容:
${createRes.content}

お問い合わせ日時:${createRes.created_at}
      `,
        },
      ],
      fromSystem: true,
      service: API,
      specificGroupId: `send-email-${to}`,
    });
  },
);
