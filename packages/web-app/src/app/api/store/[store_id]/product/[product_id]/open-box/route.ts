// ボックスやカートンを解体する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { ProductStockHistorySourceKind } from '@prisma/client';
import { openBoxApi } from 'api-generator';
import { WholesalePriceRecord } from 'backend-core';

export const POST = BackendAPI.create(
  openBoxApi,
  async (API, { params, body }) => {
    const { store_id, product_id } = params;

    let { item_count, to_products } = body;

    //このProductがmyca_pack_idに結びついているのかなどを確認
    const thisProductInfo = await API.db.product.findUniqueExists({
      where: {
        id: product_id,
        store_id,
      },
      include: {
        item: true,
      },
    });

    if (!thisProductInfo) throw new ApiError('notExist');

    if (!thisProductInfo.item.myca_pack_id)
      throw new ApiError({
        status: 400,
        messageText: 'この商品マスタはボックスではありません',
      });

    const totalPackCount = to_products.reduce(
      (acc, product) => acc + product.item_count,
      0,
    );

    //早速在庫変動していく
    const txResult = await API.transaction(async (tx) => {
      const fromProduct = new BackendApiProductService(API, product_id);

      const fromProductChangeResult = await fromProduct.core.decreaseStock({
        source_kind: ProductStockHistorySourceKind.box_opening,
        source_id: product_id,
        decreaseCount: item_count,
        description: `ボックス ${product_id} の開封において在庫${product_id} の数量が${item_count} 減少しました`,
      });

      //パック1つ当たりの仕入れ値を取得
      const unitWholesalePrice = Math.round(
        (fromProductChangeResult.recordInfo?.totalWholesalePrice || 0) /
          totalPackCount,
      );

      //それぞれの商品を変動させていく
      for (const product of to_products) {
        const toProduct = new BackendApiProductService(API, product.product_id);

        const thisWholesalePriceRecord: WholesalePriceRecord = {
          product_id: product.product_id,
          unit_price: unitWholesalePrice,
          item_count: product.item_count,
        };

        const toProductChangeResult = await toProduct.core.increaseStock({
          source_kind: ProductStockHistorySourceKind.box_opening,
          source_id: product_id,
          increaseCount: product.item_count,
          wholesaleRecords: [thisWholesalePriceRecord],
          description: `ボックス ${product_id} の開封において在庫${product.product_id} の数量が${product.item_count} 増加しました`,
        });

        console.log(toProductChangeResult);
      }
    });
  },
);
