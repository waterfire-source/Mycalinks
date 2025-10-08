// 委託在庫補充

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { ProductStockHistorySourceKind } from '@prisma/client';
import { stockConsignmentClientProductApi } from 'api-generator';

export const POST = BackendAPI.create(
  stockConsignmentClientProductApi,
  async (API, { params, body }) => {
    const { store_id, consignment_client_id } = params;

    let { products } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //全ての在庫を取得する
    const allProducts = await API.db.product.findMany({
      where: {
        id: {
          in: products.map((e) => e.product_id),
        },
        store_id,
        consignment_client_id,
        deleted: false,
      },
      select: {
        id: true,
      },
    });

    //全部あるか確認しつつ在庫変動
    await API.transaction(async (tx) => {
      for (const product of products) {
        const productInfo = allProducts.find(
          (e) => e.id === product.product_id,
        );

        if (!productInfo)
          throw new ApiError({
            status: 400,
            messageText: `商品が存在しません: ${product.product_id}`,
          });

        const productService = new BackendApiProductService(
          API,
          productInfo.id,
        );

        const changeRes = await productService.core.increaseStock({
          increaseCount: product.item_count,
          source_kind: ProductStockHistorySourceKind.consignment_create,
          source_id: consignment_client_id,
          description: `委託在庫: ${productInfo.id} を補充しました`,
        });
      }
    });
  },
);
