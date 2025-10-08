import { BackendAPI } from '@/api/backendApi/main';
import { ProductStockHistorySourceKind } from '@prisma/client';

import { ApiError } from '@/api/backendApi/error/apiError';
import { transferToSpecialPriceProductApi } from 'api-generator';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendApiItemService } from '@/api/backendApi/services/item/main';

//特定の在庫を特価商品に変換する
export const POST = BackendAPI.create(
  transferToSpecialPriceProductApi,
  async (API, { body, params }) => {
    const {
      itemCount,
      specific_auto_sell_price_adjustment,
      force_no_price_label,
      // staff_account_id,
      sellPrice,
    } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //変換前在庫の確認
    const fromProduct = new BackendApiProductService(
      API,
      Number(params.product_id),
    );
    await fromProduct.core.ifExists({
      is_special_price_product: false, //特価在庫はだめ
    });

    //在庫を作っていく
    const thisItem = new BackendApiItemService(
      API,
      fromProduct.core.targetObject!.item_id,
    );

    return await API.transaction(async (tx) => {
      const productIds = await thisItem.core.createProducts({
        needIds: true, //IDが必要
        specificConditionOptionId:
          fromProduct.core.targetObject!.condition_option_id, //変換前在庫と同じ状態を生成
        dontAdjustPrice: true, //価格調整はしない
        productField: {
          force_no_price_label, //ラベルオプション
          specific_auto_sell_price_adjustment, //%を維持するかどうかのやつ
          allow_sell_price_auto_adjustment: Boolean(
            specific_auto_sell_price_adjustment,
          ), //%維持設定してたらその後の自動価格調整も許可するが、してなかったら価格調整は無効にする
          is_special_price_product: true, //特価在庫として登録
          sell_price: sellPrice,
        },
      });

      if (productIds.length != 1)
        throw new ApiError({
          status: 500,
          messageText: '特価在庫が生成されませんでした',
        });

      //このProductの情報を取得する
      const toProductId = productIds[0];
      const toProduct = new BackendApiProductService(API, toProductId);

      //在庫変換を行う
      const fromProductChangeResult = await fromProduct.core.decreaseStock({
        source_kind: ProductStockHistorySourceKind.transfer,
        source_id: toProductId, //変換後在庫のID
        decreaseCount: itemCount,
        description: `特価在庫を生成する時の在庫変換 ${
          fromProduct.core.targetObject!.id
        } to ${toProductId} において在庫${
          fromProduct.core.targetObject!.id
        } の数量が${itemCount} 減少しました`,
      });

      //仕入れ値レコードを取得
      const wholesaleRecords =
        fromProductChangeResult.recordInfo?.useRecords || [];

      //変換後商品の処理
      const toProductChangeResult = await toProduct.core.increaseStock({
        source_kind: ProductStockHistorySourceKind.transfer,
        source_id: fromProduct.core.targetObject!.id, //変換前在庫のID
        increaseCount: itemCount,
        wholesaleRecords, //先ほど得たレコードをそのまま使う形（内部でproduct_idは書き換えられる）
        description: `特価在庫を生成する時の在庫変換 ${
          fromProduct.core.targetObject!.id
        } to ${toProductId} において在庫${toProductId} の数量が${itemCount} 増加しました`,
      });

      if (!toProductChangeResult)
        throw new ApiError({
          status: 400,
          messageText: '無限商品が含まれています',
        });

      const toProductInfo = await tx.product.findUnique({
        where: {
          id: toProductId,
        },
      });

      if (!toProductInfo)
        throw new ApiError({
          status: 500,
          messageText: '特価在庫が生成されませんでした',
        });

      return toProductInfo;
    });
  },
);
