// キャンセル済み出荷を下書き状態に戻す（再出荷）

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { StoreShipmentStatus } from '@prisma/client';
import { reshipStoreShipmentApi } from 'api-generator';

export const POST = BackendAPI.create(
  reshipStoreShipmentApi,
  async (API, { params }) => {
    const { store_id, store_shipment_id } = params;

    // 出荷情報を取得
    const storeShipment = await API.db.store_Shipment.findUnique({
      where: {
        id: store_shipment_id,
        store_id,
      },
      include: {
        products: true,
      },
    });

    if (!storeShipment) {
      throw new ApiError({
        status: 404,
        messageText: '指定された出荷が見つかりません',
      });
    }

    // キャンセル済みの出荷のみ再出荷可能
    if (storeShipment.status !== StoreShipmentStatus.CANCELED) {
      throw new ApiError({
        status: 400,
        messageText: 'キャンセル済みの出荷のみ再出荷することができます',
      });
    }

    // ステータスをCANCELEDからNOT_YETに変更
    const updatedStoreShipment = await API.db.store_Shipment.update({
      where: {
        id: store_shipment_id,
      },
      data: {
        status: StoreShipmentStatus.NOT_YET,
      },
      include: {
        products: true,
      },
    });

    return {
      storeShipment: updatedStoreShipment,
    };
  },
);
