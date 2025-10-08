//出荷済の取り消し
// 出荷を取り消す

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiStoreShipmentService } from '@/api/backendApi/services/store-shipment/main';
import { StoreShipmentStatus } from '@prisma/client';
import { rollbackStoreShipmentApi } from 'api-generator';

export const POST = BackendAPI.create(
  rollbackStoreShipmentApi,
  async (API, { params }) => {
    const { store_id, store_shipment_id } = params;

    const thisStoreShipmentInfo = await API.db.store_Shipment.findUnique({
      where: {
        id: store_shipment_id,
        store_id,
        status: StoreShipmentStatus.SHIPPED, //出荷済みのものだけ
      },
      include: {
        products: true,
      },
    });

    if (!thisStoreShipmentInfo) {
      throw new ApiError('notExist');
    }

    const storeShipmentService = new BackendApiStoreShipmentService(
      API,
      thisStoreShipmentInfo.id,
    );
    storeShipmentService.core.targetObject = thisStoreShipmentInfo;

    const rollbackRes = await storeShipmentService.core.rollback();
  },
);
