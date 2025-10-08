// カートン在庫を解体する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { ProductStockHistorySourceKind } from '@prisma/client';
import { openCartonApi } from 'api-generator';

export const POST = BackendAPI.create(
  openCartonApi,
  async (API, { params, body }) => {
    const { store_id, product_id } = params;

    let { item_count, to_product } = body;

    console.log('info', { product_id, item_count, to_product });
    //この在庫の情報を取得する
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
        id: to_product.product_id,
        item: {
          carton_item_id: cartonProductInfo.item.id,
        },
      },
    });

    if (!boxProductInfo) {
      throw new ApiError('notExist');
    }

    const txResult = await API.transaction(async (tx) => {
      //カートン在庫の方を減らす

      const cartonProduct = new BackendApiProductService(
        API,
        cartonProductInfo.id,
      );

      const cartonProductChangeResult = await cartonProduct.core.decreaseStock({
        source_kind: ProductStockHistorySourceKind.carton_opening,
        source_id: product_id,
        decreaseCount: item_count,
        description: `カートン ${product_id} の開封において在庫${product_id} の数量が${item_count} 減少しました`,
      });

      console.log(cartonProductChangeResult);

      const boxProduct = new BackendApiProductService(API, boxProductInfo.id);

      //仕入れ値をいい感じに分配
      const wholesalePriceRecords =
        boxProduct.core.wholesalePrice.generateRecords({
          totalWholesalePrice:
            cartonProductChangeResult.recordInfo?.totalWholesalePrice || 0,
          totalCount: to_product.item_count,
        });

      const boxProductChangeResult = await boxProduct.core.increaseStock({
        source_kind: ProductStockHistorySourceKind.carton_opening,
        source_id: cartonProductInfo.id,
        increaseCount: to_product.item_count,
        wholesaleRecords: wholesalePriceRecords,
        description: `カートン ${product_id} の開封において在庫${product_id} の数量が${to_product.item_count} 増加しました`,
      });

      console.log(boxProductChangeResult);
    });
  },
);
