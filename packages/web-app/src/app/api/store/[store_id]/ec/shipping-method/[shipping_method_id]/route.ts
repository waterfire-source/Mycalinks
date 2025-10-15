//配送方法作成更新
//配送方法取得API

import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { deleteShippingMethodApi } from 'api-generator';

//配送方法削除
export const DELETE = BackendAPI.create(
  deleteShippingMethodApi,
  async (API, { params }) => {
    //更新モードだったら
    const [currentInfo, currentCount] = await Promise.all([
      API.db.shipping_Method.findUnique({
        where: {
          store_id: params.store_id,
          id: params.shipping_method_id,
        },
      }),
      API.db.shipping_Method.count({
        where: {
          store_id: params.store_id,
          deleted: false,
        },
      }),
    ]);

    if (!currentInfo) throw new ApiError('notExist');

    //この配送方法を消して0になってしまうならエラー
    if (currentCount === 1) {
      throw new ApiError({
        status: 400,
        messageText: 'たった一つの配送方法を削除することはできません',
      });
    }

    //消す
    await API.db.shipping_Method.update({
      where: {
        id: currentInfo.id,
      },
      data: {
        deleted: true,
      },
    });

    return { ok: '配送方法の削除に成功しました' };
  },
);
