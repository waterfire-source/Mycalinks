//無限在庫の固定仕入れ値や在庫数などを調整する
// 無限在庫の設定を更新

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { WholesalePriceHistoryResourceType } from '@prisma/client';
import { updateInfiniteProductSettingApi } from 'api-generator';

export const PUT = BackendAPI.create(
  updateInfiniteProductSettingApi,
  async (API, { params, body }) => {
    const { stock_number, wholesale_price } = body;

    const thisProductInfo = await API.db.product.findUniqueExists({
      where: {
        id: params.product_id,
        store_id: params.store_id,
        item: {
          infinite_stock: true,
        },
      },
    });

    if (!thisProductInfo) throw new ApiError('notExist');

    //更新していく
    const txRes = await API.transaction(async (tx) => {
      //更新
      const updateRes = await tx.product.update({
        where: { id: params.product_id },
        data: { stock_number },
      });

      //一度仕入れ値を全削除する
      await tx.product_Wholesale_Price_History.deleteMany({
        where: {
          product_id: params.product_id,
          resource_type: WholesalePriceHistoryResourceType.PRODUCT,
        },
      });

      //仕入れ値レコードを追加する
      const productService = new BackendApiProductService(
        API,
        params.product_id,
      );
      const setRes = await productService.core.wholesalePrice.setRecords({
        records: [
          {
            resource_type: WholesalePriceHistoryResourceType.PRODUCT,
            resource_id: params.product_id,
            unit_price: wholesale_price,
            item_count: updateRes.stock_number,
            product_id: params.product_id,
          },
        ],
      });
      console.log(setRes);
    });

    //最終的な結果を取得する
    const updateRes = await API.db.product.findUnique({
      where: { id: params.product_id },
    });

    return updateRes!;
  },
);
