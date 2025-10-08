import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';

import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

import { BackendApiSetDealService } from '@/api/backendApi/services/setDeal/main';

//セット販売が適用できるかチェック
//パラメータが複雑なのもあってPOSTメソッドを利用する
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
      carts, //[ product_id, item_count, unit_price ]
    } = API.body;

    //与えられたカートの中からセット販売を見つけていく
    const setDealService = new BackendApiSetDealService(API);
    const findRes = await setDealService.core.findFromCarts(carts);

    return API.status(200).response({ data: findRes });
  },
);
