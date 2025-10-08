//Productにタグをつける

import { BackendAPI } from '@/api/backendApi/main';
import { getOpenPackHistoryApi } from 'api-generator';
import { PackOpenStatus, Prisma } from '@prisma/client';
import { BackendCoreItemService, ItemType } from 'backend-core';

//パック開封履歴を取得するAPI
export const GET = BackendAPI.create(
  getOpenPackHistoryApi,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.Pack_Open_HistoryWhereInput> = [];

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'id':
        case 'from_product_id':
          whereInput.push({
            [key]: value as number,
          });
          break;
        case 'status':
          whereInput.push({
            [key]: value as PackOpenStatus,
          });
          break;
        case 'item_id':
          whereInput.push({
            from_product: {
              item_id: value as number,
            },
          });
          break;
        case 'item_type':
          whereInput.push({
            from_product: {
              item: BackendCoreItemService.itemTypeToCategoryQuery(
                value as ItemType,
              ),
            },
          });
          break;
      }
    }

    const selectRes = await API.db.pack_Open_History.findMany({
      where: {
        from_product: {
          store_id: params.store_id, //この店のパック限定
        },
        AND: whereInput,
      },
      include: {
        from_product: {
          select: {
            stock_number: true,
            item: {
              select: {
                id: true,
                type: true,
              },
            },
          },
        },
        to_products: {
          include: {
            staff_account: {
              select: {
                display_name: true,
                // kind: true,
              },
            },
          },
        },
      },
    });

    return {
      openPackHistories: selectRes,
    };
  },
);
