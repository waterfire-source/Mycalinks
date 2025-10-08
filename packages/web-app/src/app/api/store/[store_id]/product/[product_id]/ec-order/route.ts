import { BackendAPI } from '@/api/backendApi/main';
import { getProductEcOrderHistoryApi } from 'api-generator';
import { EcOrderStatus, Prisma } from '@prisma/client';

export const GET = BackendAPI.create(
  getProductEcOrderHistoryApi,
  async (API, { params }) => {
    const { store_id, product_id } = params;

    //クエリパラメータを見ていく
    const orderByQuery: Prisma.Ec_Order_Cart_Store_ProductOrderByWithRelationInput[] =
      [];

    //オーダー
    API.orderByQuery.forEach((e) => {
      for (const [key, value] of Object.entries(e)) {
        switch (key) {
          //オーダー日時
          case 'ordered_at':
            orderByQuery.push({
              order_store: {
                order: {
                  ordered_at: value,
                },
              },
            });
            break;

          //最終的な単価
          case 'total_unit_price':
            orderByQuery.push({
              total_unit_price: value,
            });
            break;

          //販売数
          case 'item_count':
            orderByQuery.push({
              item_count: value,
            });
            break;
        }
      }
    });

    const where: Prisma.Ec_Order_Cart_Store_ProductWhereInput = {
      store_id: store_id,
      product_id: product_id,
      //注文が完了したもののみ（キャンセルも入れる？）
      order_store: {
        order: {
          status: EcOrderStatus.COMPLETED,
        },
      },
    };

    const findRes = await API.db.ec_Order_Cart_Store_Product.findMany({
      where,
      select: {
        order_store: {
          select: {
            order: {
              select: {
                id: true,
                ordered_at: true,
              },
            },
          },
        },
        total_unit_price: true,
        item_count: true,
      },
      ...API.limitQuery,
      orderBy: orderByQuery,
    });

    let summary = undefined;

    if (API.query.includesSummary) {
      const totalItemCount = await API.db.ec_Order_Cart_Store_Product.count({
        where,
      });

      summary = {
        totalItemCount,
      };
    }

    return {
      ordersByProduct: findRes,
      summary,
    };
  },
);
