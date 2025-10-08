//Mycaユーザーが自分に関係している買取表の情報を取得する
// Mycaユーザーが買取表情報を取得

import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import { getAllStorePurchaseTableByMycaUserApi } from 'api-generator';

export const GET = BackendAPI.create(
  getAllStorePurchaseTableByMycaUserApi,
  async (API) => {
    const whereInput: Array<Prisma.Purchase_TableWhereInput> = [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'genre_handle':
          whereInput.push({
            genre_handle: value as string,
          });
          break;
        case 'store_id': {
          if (!value) break;
          const storeIds = value
            .split(',')
            .map(Number)
            .filter((id) => !isNaN(id));
          if (storeIds.length > 0) {
            whereInput.push({
              store_id: {
                in: storeIds,
              },
            });
          }
          break;
        }
      }
    });

    const selectRes = await API.db.purchase_Table.findMany({
      where: {
        AND: whereInput,
        display_on_app: true, //公開されているやつだけ
        store: {
          //所属している店のみ
          customers: {
            some: {
              myca_user_id: API.mycaUser!.id,
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        genre_handle: true,
        store_id: true,
        published_at: true,
        generated_images: true,
      },
      orderBy: {
        published_at: 'desc',
      },
    });

    return {
      purchaseTables: selectRes,
    };
  },
);
