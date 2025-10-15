// ECオーダーのストアごとの領収書を発行する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiEcOrderService } from '@/api/backendApi/services/ec/order/main';
import { EcOrderCartStoreStatus } from '@prisma/client';
import { getEcOrderReceiptApi } from 'api-generator';
import { S3CustomClient } from 'backend-core';

export const GET = BackendAPI.create(
  getEcOrderReceiptApi,
  async (API, { params, query }) => {
    const cs = await API.db.ec_Order_Cart_Store.findUnique({
      where: {
        order_id_store_id: {
          order_id: params.order_id,
          store_id: query.store_id,
        },
        status: EcOrderCartStoreStatus.COMPLETED, //完了しているもののみ
        order: {
          myca_user_id: API.mycaUser?.id, //このMycaユーザーの注文のみ
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

    const customerName = cs.receipt_customer_name ?? query.customer_name;

    if (!customerName)
      throw new ApiError({
        status: 400,
        messageText: `領収書の初回発行には宛名が必要です`,
      });

    const ecOrderService = new BackendApiEcOrderService(API, cs.order_id);

    const s3Url = await ecOrderService.core.generateReceipt(
      cs,
      customerName,
      Boolean(cs.receipt_url),
    );
    const receiptUrl = s3Service.getSignedUrl(s3Url);

    return {
      receiptUrl,
    };
  },
);
