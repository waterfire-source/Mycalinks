// カートン在庫をボックスから補充する
// パスパラメータのproduct_idはカートン在庫のID

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { ProductStockHistorySourceKind } from '@prisma/client';
import { restockBoxProductApi } from 'api-generator';

export const POST = BackendAPI.create(
  restockBoxProductApi,
  async (API, { params, body }) => {
    const { store_id, product_id } = params;

    let { item_count, from_product } = body;

    // if (product_id !== from_product.product_id) {
    //   throw new ApiError({
    //     status: 400,
    //     messageText: 'ボックスの指定が不適切です',
    //   });
    // }

    //このボックスの情報を取得する
    const boxProductInfo = await API.db.product.findUniqueExists({
      where: {
        store_id,
        id: product_id,
      },
      include: {
        item: true,
      },
    });

    if (!boxProductInfo) {
      throw new ApiError('notExist');
    }

    const packProductInfo = await API.db.product.findUniqueExists({
      where: {
        store_id,
        id: from_product.product_id,
      },
    });

    if (!packProductInfo) {
      throw new ApiError('notExist');
    }

    const txResult = await API.transaction(async (tx) => {
      //パック在庫の方を減らす
      const packProduct = new BackendApiProductService(API, packProductInfo.id);

      const packProductChangeResult = await packProduct.core.decreaseStock({
        source_kind: ProductStockHistorySourceKind.box_create,
        source_id: boxProductInfo.id,
        decreaseCount: from_product.item_count,
        description: `ボックス ${product_id} の補充においてパック在庫${from_product.product_id} の数量が${from_product.item_count} 減少しました`,
      });

      //ボックス在庫の方を増やす
      const boxProduct = new BackendApiProductService(API, boxProductInfo.id);

      //仕入れ値をいい感じに分配
      const wholesalePriceRecords =
        boxProduct.core.wholesalePrice.generateRecords({
          totalWholesalePrice:
            packProductChangeResult.recordInfo?.totalWholesalePrice || 0,
          totalCount: item_count,
        });

      const boxProductChangeResult = await boxProduct.core.increaseStock({
        source_kind: ProductStockHistorySourceKind.box_create,
        source_id: boxProductInfo.id,
        increaseCount: item_count,
        wholesaleRecords: wholesalePriceRecords,
        description: `ボックス ${product_id} の補充において在庫${product_id} の数量が${item_count} 増加しました`,
      });

      console.log(boxProductChangeResult);
    });

    return txResult;
  },
);
