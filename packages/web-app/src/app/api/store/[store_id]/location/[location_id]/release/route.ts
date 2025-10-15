// ロケーションを解放させる

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { LocationStatus, ProductStockHistorySourceKind } from '@prisma/client';
import { releaseLocationApi } from 'api-generator';

export const POST = BackendAPI.create(
  releaseLocationApi,
  async (API, { params, body }) => {
    const { store_id, location_id } = params;

    const { actual_sales, products } = body;

    //現在の情報を取得
    const thisLocationInfo = await API.db.location.findUnique({
      where: {
        id: location_id,
        store_id,
        status: LocationStatus.CREATED,
      },
      include: {
        products: true,
      },
    });

    if (!thisLocationInfo) throw new ApiError('notExist');

    let actual_wholesale_price = thisLocationInfo.total_wholesale_price ?? 0;
    const actual_item_count =
      thisLocationInfo.total_item_count! -
      products.reduce((acc, e) => acc + e.item_count, 0);

    const txResult = await API.transaction(async (tx) => {
      //在庫を一部戻す

      for (const product of products) {
        const productService = new BackendApiProductService(
          API,
          product.product_id,
        );

        const changeRes = await productService.core.increaseStock({
          increaseCount: product.item_count,
          source_kind: ProductStockHistorySourceKind.location_release,
          source_id: location_id,
          description: `ロケーションの解放で、product_id:${product.product_id}の在庫を${product.item_count}個追加しました`,
        });

        //この在庫の仕入れ値分は引く
        actual_wholesale_price -=
          changeRes.recordInfo?.totalWholesalePrice ?? 0;
      }

      //更新
      const updateRes = await API.db.location.update({
        where: {
          id: location_id,
        },
        data: {
          actual_sales,
          actual_wholesale_price,
          actual_item_count,
          status: LocationStatus.FINISHED,
          finished_at: new Date(),
          products: {
            deleteMany: {},
            create: products, //残ったやつを入力
          },
        },
        include: {
          products: true,
        },
      });

      return updateRes;
    });

    return txResult;
  },
);
