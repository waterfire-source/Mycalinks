import { BackendAPI } from '@/api/backendApi/main';
import { EcOrderCartStoreStatus } from '@prisma/client';
import {
  createEcOrderContactDef,
  getEcOrderContactDef,
} from '@/app/api/ec/def';
import { ApiError } from '@/api/backendApi/error/apiError';
import { TaskManager } from 'backend-core';

//ECオーダー用のお問い合わせ
export const POST = BackendAPI.defineApi(
  createEcOrderContactDef,
  async (API, { body }) => {
    const { code, kind, title, content } = body;

    const mycaUserId = API.mycaUser!.id!;
    // const mycaUserId = 123491;

    //オーダーの存在を調べる
    const orderStore = await API.db.ec_Order_Cart_Store.findUnique({
      where: {
        code,
        status: {
          not: EcOrderCartStoreStatus.DRAFT, //下書きじゃなければなんでもOK
        },
        order: {
          myca_user_id: mycaUserId, //ユーザーID
        },
      },
      include: {
        contact: true,
        store: {
          include: {
            ec_setting: true,
          },
        },
        order: true,
      },
    });

    if (!orderStore) {
      throw new ApiError('notExist');
    }

    const now = new Date();

    //すでに送信されているかどうかで処理を分ける
    if (!orderStore.contact) {
      //kindとtitleがなかったらエラー
      if (!kind || !title || !content) {
        throw new ApiError(createEcOrderContactDef.error.kindTitle);
      }
    }

    const upsertRes = await API.db.ec_Order_Cart_Store_Contact.upsert({
      where: {
        id: orderStore.contact?.id ?? 0,
      },
      create: {
        order_id: orderStore.order_id,
        store_id: orderStore.store_id,
        kind: kind!,
        title: title!,
        myca_user_id: mycaUserId,
        last_sent_at: now,
        myca_user_last_read_at: now,
        messages: {
          create: {
            content: content!,
            myca_user_id: mycaUserId,
            created_at: now,
          },
        },
      },
      update: {
        last_sent_at: now,
        myca_user_last_read_at: now,
        ...(content && {
          messages: {
            create: {
              content,
              myca_user_id: mycaUserId,
              created_at: now,
            },
          },
        }),
      },
      include: {
        messages: {
          select: {
            id: true,
            content: true,
            created_at: true,
            myca_user_id: true,
          },
        },
      },
    });

    //お店側に通知する
    if (content) {
      const { notification_email } = orderStore.store.ec_setting!;

      const targetEmails = notification_email?.split(',') ?? [];

      if (targetEmails.length > 0) {
        const to = targetEmails[0];
        const cc = targetEmails.slice(1);

        const taskManager = new TaskManager({
          targetWorker: 'notification',
          kind: 'sendEmail',
        });

        await taskManager.publish({
          body: [
            {
              to,
              cc,
              title: `【Mycalinks Mall】お客様からご注文についてのお問い合わせがありました`,
              bodyText: `
${orderStore.store.display_name} 様

ECMALL経由でお客様からのお問い合わせが届きました。

──────────────  
■お名前：${orderStore.order.customer_name}  
■メールアドレス：${orderStore.order.customer_email}  
■注文番号：${orderStore.code}  
■件名：${upsertRes.title}  
■お問い合わせ内容：  
${content}  
──────────────

対応状況の確認や返信は管理画面から行えます。

▼管理画面ログイン  
${process.env.NEXT_PUBLIC_ORIGIN}/auth/ec/list

※このメールは自動送信です。  
              `,
            },
          ],
          fromSystem: true,
          service: API,
          specificGroupId: `send-email-${to}`,
        });
      }
    }

    return {
      ecOrderContact: upsertRes,
    };
  },
);

//ECオーダー用のお問い合わせ取得（顧客用）
export const GET = BackendAPI.defineApi(
  getEcOrderContactDef,
  async (API, { query }) => {
    const { code, includesMessages } = query;

    const mycaUserId = API.mycaUser!.id!;
    // const mycaUserId = 123491;

    const ecOrderContacts = await API.db.ec_Order_Cart_Store_Contact.findMany({
      where: {
        order_store: {
          code,
          status: {
            not: EcOrderCartStoreStatus.DRAFT, //下書きじゃなければなんでもOK
          },
          order: {
            myca_user_id: mycaUserId, //ユーザーID
          },
        },
      },
      select: {
        order_store: {
          select: {
            order: {
              select: {
                id: true,
                code: true,
              },
            },
            code: true,
            store: {
              select: {
                display_name: true,
              },
            },
          },
        },
        last_sent_at: true,
        myca_user_last_read_at: true,
        kind: true,
        title: true,
        messages: {
          select: {
            id: true,
            ...(includesMessages ? { content: true } : null),
            created_at: true,
            myca_user_id: true,
          },
        },
      },
      ...API.limitQuery,
      orderBy: {
        last_sent_at: 'desc',
      },
    });

    return {
      ecOrderContacts,
    };
  },
);
