// ロスの取り消し

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { LossStatus, ProductStockHistorySourceKind } from '@prisma/client';
import { rollbackLossApi } from 'api-generator';

export const POST = BackendAPI.create(
  rollbackLossApi,
  async (API, { params, body }) => {
    const { store_id, loss_id } = params;

    let { description } = body;

    const alreadyInfo = await API.db.loss.findUnique({
      where: {
        id: loss_id,
        store_id,
        status: LossStatus.FINISHED,
      },
      include: {
        products: true,
      },
    });

    if (!alreadyInfo) throw new ApiError('notExist');

    await API.transaction(async (tx) => {
      //一つ一つロールバックしていく
      for (const product of alreadyInfo.products) {
        const productService = new BackendApiProductService(
          API,
          product.product_id,
        );

        if (product.item_count === 0) continue;

        await productService.core.increaseStock({
          source_kind: ProductStockHistorySourceKind.loss_rollback,
          source_id: alreadyInfo.id,
          increaseCount: product.item_count,
          description,
        });
      }

      //ステータスを変える
      await API.db.loss.update({
        where: {
          id: loss_id,
        },
        data: {
          status: LossStatus.ROLLBACK,
        },
      });
    });
  },
);
