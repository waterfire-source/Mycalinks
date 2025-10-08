// ECの出荷指示書を発行する

import { getEcOrderShippingInstructionApi } from 'api-generator';
import { BackendAPI } from '@/api/backendApi/main';
import { EcOrderCartStoreStatus } from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiEcOrderService } from '@/api/backendApi/services/ec/order/main';
import { S3CustomClient } from 'backend-core';

export const GET = BackendAPI.create(
  getEcOrderShippingInstructionApi,
  async (API, { params }) => {
    const cs = await API.db.ec_Order_Cart_Store.findUnique({
      where: {
        order_id_store_id: {
          order_id: params.order_id,
          store_id: params.store_id,
        },
        status: {
          not: EcOrderCartStoreStatus.DRAFT,
        },
      },
      include: {
        store: true,
        order: true,
        products: {
          include: {
            product: {
              include: {
                item: true,
                specialty: true,
                condition_option: true,
              },
            },
          },
        },
        shipping_method: true,
      },
    });

    if (!cs) throw new ApiError('notExist');

    const ecOrderService = new BackendApiEcOrderService(API, cs.order_id);

    let fileUrl = await ecOrderService.core.generateShippingInstructionPdf(cs);
    fileUrl = new S3CustomClient('private').getSignedUrl(fileUrl);

    return {
      fileUrl,
    };
  },
);
