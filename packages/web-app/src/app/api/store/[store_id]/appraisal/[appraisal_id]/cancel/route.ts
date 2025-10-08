//鑑定をキャンセルするAPI
//確定してないもののみキャンセルすることができる
//キャンセルと同時に論理削除される
// 鑑定をキャンセルする

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { ProductStockHistorySourceKind } from '@prisma/client';
import { cancelAppraisalApi } from 'api-generator';
import { WholesalePriceRecord } from 'backend-core';

export const POST = BackendAPI.create(
  cancelAppraisalApi,
  async (API, { params }) => {
    const { store_id, appraisal_id } = params;

    const thisAppraisal = await API.db.appraisal.findUnique({
      where: {
        id: appraisal_id,
        store_id,
        finished: false, //終わってないもののみ
        deleted: false,
      },
      include: {
        products: true,
      },
    });

    if (!thisAppraisal) throw new ApiError('notExist');

    await API.transaction(async (tx) => {
      //それぞれの在庫を元に戻す

      for (const product of thisAppraisal.products) {
        const thisProduct = new BackendApiProductService(
          API,
          product.product_id,
        );

        //純粋に仕入れ値分だけ戻す感じ
        const thisWholesaleRecord: WholesalePriceRecord = {
          product_id: product.product_id,
          item_count: 1,
          unit_price: product.wholesale_price,
        };

        await thisProduct.core.increaseStock({
          increaseCount: 1,
          source_kind: ProductStockHistorySourceKind.appraisal_cancel,
          wholesaleRecords: [thisWholesaleRecord],
          source_id: thisAppraisal.id,
          description: `鑑定:${thisAppraisal.id} のキャンセルで在庫が増えました`,
        });
      }

      //鑑定自体を削除する
      await tx.appraisal.update({
        where: {
          id: thisAppraisal.id,
        },
        data: {
          deleted: true,
        },
      });
    });
  },
);
