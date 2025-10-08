import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';

import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiItemService } from '@/api/backendApi/services/item/main';

//バンドルを解体するための関数
//単にバンドルの在庫数を減らすというだけでなく、解体して単品に変換するという処理であるため、adjust-stockは使わない
//パックとも違う概念であるためopen-packも使わない
//なお、バンドル解体をしたところでバンドルの在庫が完全に削除されるわけではない
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
      item_count, //解体するバンドルの個数
      // staff_account_id, //担当者
    } = API.body;

    //フィールドチェック
    API.checkField(['item_count'], true);

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    const { store_id, product_id } = API.params;

    let result: any = {};

    //登録する商品と登録しない商品の合計が合計カード数になるか

    const txResult = await API.transaction(async (tx) => {
      //変更前の商品の詳細情報を取得
      const thisItem = new BackendApiItemService(API);
      return await thisItem.core.bundle.release({
        itemCount: item_count,
        specificProductId: Number(product_id),
      });
    });

    result = txResult;

    return API.status(200).response({ data: result });
  },
);
