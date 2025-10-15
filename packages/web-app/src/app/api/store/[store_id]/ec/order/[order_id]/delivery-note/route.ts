// EC納品書取得

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiEcOrderService } from '@/api/backendApi/services/ec/order/main';
import { EcOrderCartStoreStatus } from '@prisma/client';
import { getEcOrderDeliveryNoteApi } from 'api-generator';
import { S3CustomClient } from 'backend-core';

export const GET = BackendAPI.create(
  getEcOrderDeliveryNoteApi,
  async (API, { params }) => {
    //既存データ
    const cs = await API.db.ec_Order_Cart_Store.findUnique({
      where: {
        order_id_store_id: {
          order_id: params.order_id,
          store_id: params.store_id,
        },
        status: {
          notIn: [
            EcOrderCartStoreStatus.DRAFT,
            EcOrderCartStoreStatus.CANCELED,
            EcOrderCartStoreStatus.UNPAID,
          ],
        },
      },
      include: {
        order: true,
        store: true,
        products: {
          include: {
            product: {
              include: {
                item: true,
                specialty: true,
                condition_option: {
                  select: {
                    handle: true,
                  },
                },
              },
            },
          },
        },
        shipping_method: true,
      },
    });

    if (!cs) throw new ApiError('notExist');

    const s3Service = new S3CustomClient('private');

    const ecOrderService = new BackendApiEcOrderService(API, cs.order_id);

    const s3Url = await ecOrderService.core.generateReceipt(
      cs,
      '',
      false,
      'deliveryNote',
    );
    const deliveryNoteUrl = s3Service.getSignedUrl(s3Url);

    return {
      deliveryNoteUrl,
    };
  },
);
