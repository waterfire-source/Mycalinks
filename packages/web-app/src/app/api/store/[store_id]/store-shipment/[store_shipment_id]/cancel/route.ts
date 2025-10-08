//下書き状態の出荷のキャンセル
// 出荷をキャンセルする

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { StoreShipmentStatus } from '@prisma/client';
import { cancelStoreShipmentApi } from 'api-generator';

export const POST = BackendAPI.create(
  cancelStoreShipmentApi,
  async (API, { params }) => {
    const { store_id, store_shipment_id } = params;

    const currentInfo = await API.db.store_Shipment.findUnique({
      where: {
        id: store_shipment_id,
        store_id,
        status: StoreShipmentStatus.NOT_YET, //not_yetのみ対応
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    //ステータスをキャンセルにする
    await API.db.store_Shipment.update({
      where: {
        id: currentInfo.id,
      },
      data: {
        status: StoreShipmentStatus.CANCELED,
      },
    });
  },
);
