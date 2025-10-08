// EC注文の商品別集計を取得する

import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import { getEcOrderStatsProductApi } from 'api-generator';
import { customDayjs } from 'common';

export const GET = BackendAPI.create(
  getEcOrderStatsProductApi,
  async (API, { params, query }) => {
    let whereInput: Prisma.Sql = Prisma.sql``;
    let orderByInput: Prisma.Sql = Prisma.sql``;

    // クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'dataDayGte': {
          const targetDay = customDayjs(value as Date)
            .tz()
            .format('YYYY-MM-DD');
          whereInput = Prisma.sql`${whereInput} AND target_day >= ${targetDay}`;

          break;
        }

        case 'dataDayLte': {
          const targetDay = customDayjs(value as Date)
            .tz()
            .format('YYYY-MM-DD');
          whereInput = Prisma.sql`${whereInput} AND target_day <= ${targetDay}`;

          break;
        }

        case 'orderBy': {
          const orderDirection =
            query.orderDirection === 'desc' ? 'DESC' : 'ASC';
          switch (value) {
            case 'product_display_name':
              orderByInput = Prisma.sql`ORDER BY feop.product_display_name ${Prisma.raw(
                orderDirection,
              )}`;
              break;
            case 'total_price':
              orderByInput = Prisma.sql`ORDER BY total_price ${Prisma.raw(
                orderDirection,
              )}`;
              break;
            case 'total_item_count':
              orderByInput = Prisma.sql`ORDER BY total_item_count ${Prisma.raw(
                orderDirection,
              )}`;
              break;
            case 'total_order_count':
              orderByInput = Prisma.sql`ORDER BY total_order_count ${Prisma.raw(
                orderDirection,
              )}`;
              break;
            case 'total_wholesale_price':
              orderByInput = Prisma.sql`ORDER BY total_wholesale_price ${Prisma.raw(
                orderDirection,
              )}`;
              break;
          }
          break;
        }
      }
    }

    if (orderByInput.strings.length === 0) {
      orderByInput = Prisma.sql`ORDER BY total_price DESC`;
    }

    // ページネーション
    const offset = ((query.page ?? 1) - 1) * (query.per_page ?? 20);
    const limit = query.per_page ?? 20;

    const selectRes = await API.db.$queryRaw<
      Array<{
        product_id: number;
        product_display_name: string;
        item_id: number;
        category_display_name: string;
        genre_display_name: string | null;
        condition_option_display_name: string;
        specialty_display_name: string | null;
        total_wholesale_price: bigint;
        total_price: bigint;
        total_item_count: bigint;
        total_order_count: bigint;
      }>
    >`
    SELECT
      feop.product_id                                               AS product_id,
      feop.product_display_name                                     AS product_display_name,
      feop.item_id                                                  AS item_id,
      feop.category_display_name                                    AS category_display_name,
      feop.genre_display_name                                       AS genre_display_name,
      feop.condition_option_display_name                            AS condition_option_display_name,
      feop.specialty_display_name                                   AS specialty_display_name,
      SUM(COALESCE(feop.wholesale_total_price, 0))                  AS total_wholesale_price,
      SUM(COALESCE(feop.total_unit_price, 0) * feop.item_count)     AS total_price,
      SUM(feop.item_count)                                          AS total_item_count,
      COUNT(DISTINCT feop.order_id)                                 AS total_order_count
    FROM Fact_Ec_Order_Product AS feop
    WHERE feop.store_id = ${params.store_id}
    ${whereInput}
    GROUP BY feop.product_id, feop.product_display_name, feop.item_id, 
             feop.category_display_name, feop.genre_display_name,
             feop.condition_option_display_name, feop.specialty_display_name
    ${orderByInput}
    LIMIT ${limit} OFFSET ${offset};
    `;

    // 合計件数取得
    const countRes = await API.db.$queryRaw<Array<{ total: bigint }>>`
    SELECT COUNT(DISTINCT feop.product_id) as total
    FROM Fact_Ec_Order_Product AS feop
    WHERE feop.store_id = ${params.store_id}
    ${whereInput};
    `;

    const data = selectRes.map((res) => {
      const totalPrice = Number(res.total_price);
      const totalItemCount = Number(res.total_item_count);
      const avgUnitPrice =
        totalItemCount > 0 ? Math.round(totalPrice / totalItemCount) : 0;

      return {
        product_id: res.product_id,
        product_display_name: res.product_display_name,
        item_id: res.item_id,
        category_display_name: res.category_display_name,
        genre_display_name: res.genre_display_name,
        condition_option_display_name: res.condition_option_display_name,
        specialty_display_name: res.specialty_display_name,
        total_wholesale_price: Number(res.total_wholesale_price),
        total_price: totalPrice,
        total_item_count: totalItemCount,
        total_order_count: Number(res.total_order_count),
        avg_unit_price: avgUnitPrice,
      };
    });

    return {
      data,
      summary: {
        totalCount: Number(countRes[0]?.total ?? 0),
      },
    };
  },
);
