import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//特定の商品の仕入れ値を取得する
//そのストアの設定を加味して仕入れ値を計算しなければいけない
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    //itemCountを指定しなかったら具体的な額は算出しないが、ログのリストを返す感じにする
    const { itemCount, reverse, resource_type, resource_id } = API.query;

    //商品情報を取得する
    const thisProduct = new BackendApiProductService(
      API,
      Number(params.product_id),
    );
    await thisProduct.core.ifExists();

    //仕入れ額を取得

    //原則としてspendはしない
    const recordInfo = await thisProduct.core.wholesalePrice.getRecords({
      item_count: parseInt(itemCount),
      reverse: Boolean(reverse),
      resource_type,
      resource_id: parseInt(resource_id) || undefined,
    });

    const result = {
      originalWholesalePrices: recordInfo.originalRecords,
      totalWholesalePrice: recordInfo.totalWholesalePrice,
      totalItemCount: parseInt(itemCount),
      noWholesalePriceCount: recordInfo.nothingCount,
    };

    return API.status(200).response({ data: result });
  },
);
