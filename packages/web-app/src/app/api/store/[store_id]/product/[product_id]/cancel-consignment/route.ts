// 委託在庫を取り消す

import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { ProductStockHistorySourceKind } from '@prisma/client';
import { cancelConsignmentProductApi } from 'api-generator';

export const POST = BackendAPI.create(
  cancelConsignmentProductApi,
  async (API, { params, body }) => {
    const { cancel_count } = body;

    //在庫が存在するか確認
    const productService = new BackendApiProductService(API, params.product_id);
    const thisProductInfo = await productService.core.ifExists({
      consignment_client_id: {
        not: null,
      },
    });

    //在庫変動を行う
    await API.transaction(async (tx) => {
      await productService.core.decreaseStock({
        decreaseCount: cancel_count,
        source_kind: ProductStockHistorySourceKind.consignment_return,
        description: `委託在庫: ${thisProductInfo.id} の取り消し: ${cancel_count}`,
      });
    });
  },
);
