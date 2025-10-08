import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

//Mycaユーザーが取引履歴を取得するAPI
//[TODO] store_idで絞り込みできるようにする
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.mycaUser], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const myca_user_id = API.mycaUser?.id;

    const { skip, take } = API.query;

    const whereQuery: any = {};

    Object.entries(API.query).forEach(([prop, value]: any) => {
      switch (prop) {
        case 'status': //こちらはあくまでもステータス
        case 'transaction_kind':
          whereQuery[prop] = value;
          break;

        case 'store_id':
          whereQuery[prop] = Number(value);
          break;
      }
    });

    let result: any = [];

    const findResult = await API.db.transaction.findMany({
      where: {
        customer: {
          is: {
            myca_user_id: myca_user_id || 0,
          },
        },
        ...whereQuery,
        hidden: false, //非表示取引ではない
        return_transactions: {
          none: {},
        }, //返品された取引ではない
      },
      include: {
        store: {
          select: {
            display_name: true,
            image_url: true,
          },
        },
      },
      take,
      skip,
      orderBy: [
        {
          created_at: 'desc',
        },
      ],
    });

    result = BackendAPI.useFlat(findResult);

    return API.response({ data: result });
  },
);
