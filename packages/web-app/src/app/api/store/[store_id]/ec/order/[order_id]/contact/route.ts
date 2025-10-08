import { BackendAPI } from '@/api/backendApi/main';
import { EcMessageCenterKind, EcOrderCartStoreStatus } from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import { replyEcOrderStoreContactApi } from 'api-generator';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { BackendApiEcOrderService } from '@/api/backendApi/services/ec/order/main';

//ECオーダー用のお店側お問合せ返信
export const POST = BackendAPI.create(
  replyEcOrderStoreContactApi,
  async (API, { params, body }) => {
    const { status, content } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //オーダーの存在を調べる
    const orderStore = await API.db.ec_Order_Cart_Store.findUnique({
      where: {
        status: {
          not: EcOrderCartStoreStatus.DRAFT, //下書きじゃなければなんでもOK
        },
        order_id_store_id: {
          order_id: params.order_id,
          store_id: params.store_id,
        },
        contact: {
          is: {},
        },
      },
      include: {
        contact: {
          include: {
            messages: true,
          },
        },
        order: true,
      },
    });

    if (!orderStore) {
      throw new ApiError('notExist');
    }

    //まだメッセージがなかったらエラー
    if (!orderStore.contact || !orderStore.contact.messages.length) {
      throw new ApiError({
        status: 400,
        messageText: 'まだメッセージがないので返信できません',
      });
    }

    const now = new Date();

    //返信を作成
    const createRes = await API.db.ec_Order_Cart_Store_Contact.update({
      where: {
        id: orderStore.contact!.id,
      },
      data: {
        status,
        last_sent_at: now,
        ...(content && {
          messages: {
            create: {
              content,
              staff_account_id,
            },
          },
        }),
      },
      include: {
        messages: true,
      },
    });

    //ユーザーにプッシュ通知を送信しつつ、メッセージセンターにも送信
    if (content) {
      const mycaAppService = new BackendApiMycaAppService(API);
      const ecOrderService = new BackendApiEcOrderService(API, params.order_id);

      await Promise.all([
        mycaAppService.sendPushNotification({
          mycaUserId: orderStore.order.myca_user_id!,
          title: '注文に関するお問い合わせ',
          body: `注文に関するお問い合わせに返信がありました`,
        }),
        ecOrderService.core.sendToMessageCenter({
          mycaUserId: orderStore.order.myca_user_id!,
          email: orderStore.order.customer_email!,
          title: createRes.title,
          kind: EcMessageCenterKind.ORDER_CONTACT,
          content: `
${orderStore.order.customer_name} 様
Mycalinks Mall にて新着のお知らせがございます。

お知らせの内容は、Mycalinks Mall 内のメッセージセンターよりご確認ください。

Mycalinks Mall 自体へのご意見・ご質問などは、以下のフォームからお問い合わせください。
https://mycalinks-mall.com/contact
今後とも Mycalinks Mall をよろしくお願いいたします。
          `,
          orderId: orderStore.order.id,
          storeId: orderStore.store_id,
        }),
      ]);
    }

    return {
      thisOrderContact: createRes,
    };
  },
);
