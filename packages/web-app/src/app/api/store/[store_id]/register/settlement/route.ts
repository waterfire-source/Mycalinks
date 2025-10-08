import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiStoreService } from '@/api/backendApi/services/store/main';
import { listRegisterSettlementDef } from '@/app/api/store/[store_id]/register/def';
import { Prisma } from '@prisma/client';

//レジ精算一覧
export const GET = BackendAPI.defineApi(
  listRegisterSettlementDef,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.Register_SettlementWhereInput> = [];

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'kind':
        case 'register_id':
          whereInput.push({
            [key]: value,
          });
          break;

        case 'today': {
          //開店日時を取得
          const storeModel = new BackendApiStoreService(API);
          const lastOpenedAt = await storeModel.core.todayOpenedAt;

          whereInput.push({
            data_end_at: {
              gt: lastOpenedAt,
            },
          });

          break;
        }
      }
    }

    const { take = 20, skip = 0 } = query || {};

    // クエリパラメータは文字列なので数値に変換
    const takeNum = typeof take === 'string' ? parseInt(take, 10) : take;
    const skipNum = typeof skip === 'string' ? parseInt(skip, 10) : skip;

    // 総件数を取得
    const totalCount = await API.db.register_Settlement.count({
      where: {
        AND: whereInput,
        store_id: params.store_id,
      },
    });

    const settlements = await API.db.register_Settlement.findMany({
      where: {
        AND: whereInput,
        store_id: params.store_id,
      },
      include: {
        register_settlement_drawers: true,
        sales: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: takeNum,
      skip: skipNum,
    });

    return {
      settlements,
      totalCount,
    };
  },
);
