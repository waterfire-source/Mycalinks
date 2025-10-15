import { BackendAPI } from '@/api/backendApi/main';
import { getRegisterCashHistoryDef } from '@/app/api/store/[store_id]/register/def';
import { Prisma, RegisterCashHistorySourceKind } from '@prisma/client';

//レジ現金の変動履歴取得API
export const GET = BackendAPI.defineApi(
  getRegisterCashHistoryDef,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.Register_Cash_HistoryWhereInput> = [];

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'source_kind':
          whereInput.push({
            [key]: {
              in: (value as string).split(
                ',',
              ) as Array<RegisterCashHistorySourceKind>,
            },
          });
          break;

        case 'register_id':
          whereInput.push({
            [key]: value as number,
          });
          break;

        case 'startAt':
          whereInput.push({
            datetime: {
              gte: value as Date,
            },
          });
          break;

        case 'endAt':
          whereInput.push({
            datetime: {
              lt: value as Date,
            },
          });
          break;
      }
    }

    // 総件数を取得
    const totalCount = await API.db.register_Cash_History.count({
      where: {
        register: {
          store_id: params.store_id,
        },
        AND: whereInput,
      },
    });

    const selectRes = await API.db.register_Cash_History.findMany({
      where: {
        register: {
          //一括設定でもregister_idは指定しているためOK
          store_id: params.store_id,
        },
        AND: whereInput,
      },
      select: {
        id: true,
        staff_account_id: true,
        staff_account: {
          select: {
            display_name: true,
          },
        },
        source_kind: true,
        change_price: true,
        description: true,
        result_cash_price: true,
        result_register_cash_price: true,
        datetime: true,
        register_id: true,
      },
      orderBy: [
        {
          datetime: 'desc',
        },
      ],
      ...API.limitQuery,
    });

    return {
      history: BackendAPI.useFlat(selectRes, {
        staff_account__display_name: 'staff_display_name',
      }),
      totalCount,
    };
  },
);
