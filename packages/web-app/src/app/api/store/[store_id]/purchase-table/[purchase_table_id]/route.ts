// 買取表を削除する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { deletePurchaseTableApi, updatePurchaseTableApi } from 'api-generator';
import { TaskManager } from 'backend-core';
import { customDayjs } from 'common';

export const DELETE = BackendAPI.create(
  deletePurchaseTableApi,
  async (API, { params }) => {
    //存在を確認
    const currentInfo = await API.db.purchase_Table.findUnique({
      where: {
        id: params.purchase_table_id,
        store_id: params.store_id,
      },
    });

    if (!currentInfo) {
      throw new Error('noExist');
    }

    //物理削除
    await API.db.purchase_Table.delete({
      where: {
        id: currentInfo.id,
      },
    });
  },
);
// 買取表更新

export const PUT = BackendAPI.create(
  updatePurchaseTableApi,
  async (API, { params, body }) => {
    const { genre_handle, display_on_app, sendPushNotification } = body;

    const thisPurchaseTableInfo = await API.db.purchase_Table.findUnique({
      where: {
        id: params.purchase_table_id,
        store_id: params.store_id,
      },
    });

    if (!thisPurchaseTableInfo) throw new ApiError('notExist');

    if (sendPushNotification && !display_on_app) {
      throw new ApiError({
        status: 400,
        messageText: `プッシュ通知の送信設定は、アプリへの送信時にのみ指定できます`,
      });
    }

    // 通知の2回目以降もdisplay_on_app:trueを送らないと上のエラーが出てしまうので一旦コメントアウト
    // if (thisPurchaseTableInfo.display_on_app === display_on_app) {
    //   throw new ApiError({
    //     status: 400,
    //     messageText: `この買取表はすでに送信されているか、送信が取り消されています`,
    //   });
    // }

    const firstOnToday =
      !API.resources.store!.purchase_table_push_notification_last_sent_at ||
      !customDayjs(
        API.resources.store!.purchase_table_push_notification_last_sent_at,
      ).isSame(customDayjs(), 'day');
    const currentCount =
      API.resources.store!.purchase_table_push_notification_count;

    if (sendPushNotification) {
      //プッシュ通知を送信しても大丈夫そうか確認
      //最後に送信したのが今日なのに、回数が3になってたらアウト
      if (currentCount >= 3 && !firstOnToday) {
        throw new ApiError({
          status: 400,
          messageText: `プッシュ通知は1日に3回まで送信できます`,
        });
      }
    }

    const updateRes = await API.db.purchase_Table.update({
      where: {
        id: params.purchase_table_id,
        store_id: params.store_id,
      },
      data: {
        genre_handle,
        display_on_app,
        published_at: display_on_app ? new Date() : null,
      },
    });

    //必要に応じて送信する
    if (sendPushNotification) {
      //この下は必要に応じて関数化する

      //この店舗のMycaユーザーを全て取得
      const allCustomers = await API.db.customer.findMany({
        where: {
          store_id: params.store_id,
          myca_user_id: {
            not: null,
          },
        },
        select: {
          id: true,
          myca_user_id: true,
        },
      });

      //このMycaユーザーIDのデバイストークンを取得する
      const mycaAppService = new BackendApiMycaAppService(API);
      const allDeviceTokens = await mycaAppService.core.user.getUserDeviceIds(
        allCustomers.map((c) => c.myca_user_id!),
      );

      //これらのトークンに通知を送信するタスクを作成する
      const taskManager = new TaskManager({
        targetWorker: 'notification',
        kind: 'sendPushNotification',
      });

      await taskManager.publish({
        body: allDeviceTokens.map((token) => ({
          deviceId: token.device_id,
          title: '買取表が送信されました',
          body: `店舗: ${API.resources.store!.display_name} から 買取表: ${
            thisPurchaseTableInfo.title
          } が送信されました`,
        })),
        service: API,
        fromSystem: true,
      });

      //プッシュ通知送信回数とかを更新する
      await API.db.store.update({
        where: {
          id: params.store_id,
        },
        data: {
          purchase_table_push_notification_count: firstOnToday
            ? 1
            : currentCount + 1, //すでに3以上だったら違う日じゃないとここまできてないためOK
          purchase_table_push_notification_last_sent_at: new Date(),
        },
      });
    }

    return updateRes;
  },
);
