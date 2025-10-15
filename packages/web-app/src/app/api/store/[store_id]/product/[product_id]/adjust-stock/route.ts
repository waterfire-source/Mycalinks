import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { ProductStockHistorySourceKind } from '@prisma/client';

import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { WholesalePriceRecord } from 'backend-core';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//特定の商品の在庫数を直接変動させるためのAPI
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
      changeCount, //変動する在庫数 負の数を指定したら消費する形になる
      reason = '特になし', //変動の理由など
      // staff_account_id, //変動の担当者
      wholesalePrice, //在庫増加の場合は、この値が仕入れ値として使われる
    } = API.body;

    //フィールドチェック
    API.checkField(['changeCount'], true);
    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    const { store_id, product_id } = API.params;

    let result: any = {};

    const txResult = await API.transaction(async (tx) => {
      //変更前の商品の在庫変動（減る）
      const thisProduct = new BackendApiProductService(API, Number(product_id));

      //存在確認
      await thisProduct.core.ifExists();
      //変動か増加で処理を分ける

      if (changeCount > 0) {
        //増加だったら

        if (wholesalePrice == undefined)
          throw new ApiError({
            status: 400,
            messageText: '在庫を増加させるためには仕入れ値が必要です',
          });
        //仕入れ値レコードを作成する

        const thisWholesaleRecord: WholesalePriceRecord = {
          unit_price: wholesalePrice,
          item_count: changeCount,
          product_id,
        };

        const changeResult = await thisProduct.core.increaseStock({
          source_kind: ProductStockHistorySourceKind.product,
          increaseCount: changeCount,
          wholesaleRecords: [thisWholesaleRecord],
          description: `在庫${product_id}の数量を直接${changeCount}個ふやしました \n理由：${reason}`,
        });

        if (!changeResult)
          throw new ApiError({
            status: 400,
            messageText: '無限商品が含まれています',
          });

        return changeResult.stockHistory;
      } else {
        //減少だったら

        const changeResult = await thisProduct.core.decreaseStock({
          source_kind: ProductStockHistorySourceKind.product,
          decreaseCount: -1 * changeCount,
          description: `在庫${product_id}の数量を直接${changeCount}個へらしました \n理由：${reason}`,
        });

        return changeResult.stockHistory;
      }
    });

    result = txResult;

    return API.status(200).response({ data: result });
  },
);
