// 店舗間の関係情報を取得する

import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import { getRelationToStoreApi } from 'api-generator';

export const GET = BackendAPI.create(
  getRelationToStoreApi,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.Store_RelationWhereInput> = [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'mapping_defined':
          whereInput.push({
            [key]: value as boolean,
          });
          break;
      }
    });

    const selectRes = await API.db.store_Relation.findMany({
      where: {
        AND: whereInput,
        from_store_id: params.store_id,
      },
      include: {
        ...(query.includesMapping
          ? {
              category_mappings: true,
              condition_option_mappings: true,
              genre_mappings: true,
              specialty_mappings: true,
            }
          : {}),
        to_store: {
          select: {
            display_name: true,
          },
        },
      },
    });

    return {
      storeRelations: selectRes,
    };
  },
);
