import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { ProductStockHistorySourceKind } from '@prisma/client';

import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//特定の商品の転送を行うAPI
//[TODO] to_product_idをbodyに持たせるのではなくパスパラムにもたせるのもありかも
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const {
      to_product_id, //変更後の商品ID
      item_count, //転送する在庫数
      description, //備考など
      // staff_account_id, //担当者
      specificWholesalePrice,
    } = API.body as BackendProductAPI[5]['request']['body'];

    //フィールドチェック
    API.checkField(['to_product_id', 'item_count'], true);

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    const { store_id, product_id } = API.params;

    let result: any = {};

    const txResult = await API.transaction(async (tx) => {
      //変更前の商品の在庫変動（減る）
      const fromProduct = new BackendApiProductService(API, Number(product_id));

      const fromProductChangeResult = await fromProduct.core.decreaseStock({
        source_kind: ProductStockHistorySourceKind.transfer,
        source_id: to_product_id, //変換後在庫のID
        decreaseCount: item_count,
        specificWholesalePrice,
        description: `在庫変換 ${product_id} to ${to_product_id} において在庫${product_id} の数量が${item_count} 減少しました`,
      });

      //仕入れ値レコードを取得
      const wholesaleRecords =
        fromProductChangeResult.recordInfo?.useRecords || [];

      //変更後の商品の処理（増える）
      const toProduct = new BackendApiProductService(API, to_product_id);

      const toProductChangeResult = await toProduct.core.increaseStock({
        source_kind: ProductStockHistorySourceKind.transfer,
        source_id: Number(product_id), //変換前在庫のID
        increaseCount: item_count,
        wholesaleRecords, //先ほど得たレコードをそのまま使う形（内部でproduct_idは書き換えられる）
        description: `在庫変換 ${product_id} to ${to_product_id} において在庫${to_product_id} の数量が${item_count} 増加しました`,
      });

      if (!toProductChangeResult)
        throw new ApiError({
          status: 400,
          messageText: '無限商品が含まれています',
        });

      return {
        id: to_product_id,
        resultStockNumber:
          toProductChangeResult.stockHistory?.result_stock_number ?? 0,
      };
    });

    result = txResult;

    return API.status(200).response({ data: result });
  },
);
