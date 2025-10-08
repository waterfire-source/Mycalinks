import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { customDayjs } from 'common';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

//特定の商品の在庫変動履歴を取得するAPI
//[TODO] stock-historyとかに変えたい（historyだけだと在庫の意がないため）
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const whereQuery: any = [];

    Object.entries(API.query).forEach(([prop, value]: any) => {
      switch (prop) {
        case 'start_datetime':
          whereQuery.push({
            datetime: {
              gte: customDayjs(value).toISOString(),
            },
          });

          break;

        case 'end_datetime':
          whereQuery.push({
            datetime: {
              lt: customDayjs(value).toISOString(),
            },
          });

          break;

        case 'source_kind':
          whereQuery.push({
            [prop]: value,
          });
          break;
      }
    });

    let result: any = [];

    const { store_id, product_id } = API.params;

    const selectResult = await API.db.product_Stock_History.findMany({
      where: {
        AND: [
          {
            product: {
              id: parseInt(product_id || ''),
              store_id: parseInt(store_id || ''),
            },
          },
          ...whereQuery,
        ],
      },
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });

    result = selectResult;

    return API.status(200).response({ data: result });
  },
);
