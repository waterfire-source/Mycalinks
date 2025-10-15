// カートン在庫をボックスから補充する
// パスパラメータのproduct_idはカートン在庫のID

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { ProductStockHistorySourceKind } from '@prisma/client';
import { restockCartonProductApi } from 'api-generator';

export const POST = BackendAPI.create(
  restockCartonProductApi,
  async (API, { params, body }) => {
    const { store_id, product_id } = params;

    let { item_count, from_product } = body;

    //このカートンの情報を取得する
    const cartonProductInfo = await API.db.product.findUniqueExists({
      where: {
        store_id,
        id: product_id,
      },
      include: {
        item: true,
      },
    });

    if (!cartonProductInfo) {
      throw new ApiError('notExist');
    }

    const boxProductInfo = await API.db.product.findUniqueExists({
      where: {
        store_id,
        id: from_product.product_id,
        item: {
          carton_item_id: cartonProductInfo.item.id,
        },
      },
    });

    if (!boxProductInfo) {
      throw new ApiError('notExist');
    }

    const txResult = await API.transaction(async (tx) => {
      //ボックス在庫の方を減らす
      const boxProduct = new BackendApiProductService(API, boxProductInfo.id);

      const boxProductChangeResult = await boxProduct.core.decreaseStock({
        source_kind: ProductStockHistorySourceKind.carton_create,
        source_id: boxProductInfo.id,
        decreaseCount: from_product.item_count,
        description: `カートン ${product_id} の補充においてボックス在庫${product_id} の数量が${from_product.item_count} 減少しました`,
      });

      console.log(boxProductChangeResult);

      //カートン在庫の方を増やす
      const cartonProduct = new BackendApiProductService(
        API,
        cartonProductInfo.id,
      );

      //仕入れ値をいい感じに分配
      const wholesalePriceRecords =
        cartonProduct.core.wholesalePrice.generateRecords({
          totalWholesalePrice:
            boxProductChangeResult.recordInfo?.totalWholesalePrice || 0,
          totalCount: item_count,
        });

      const cartonProductChangeResult = await cartonProduct.core.increaseStock({
        source_kind: ProductStockHistorySourceKind.carton_create,
        source_id: boxProductInfo.id,
        increaseCount: item_count,
        wholesaleRecords: wholesalePriceRecords,
        description: `カートン ${product_id} の補充において在庫${product_id} の数量が${item_count} 増加しました`,
      });

      console.log(cartonProductChangeResult);
    });

    return txResult;
  },
);
