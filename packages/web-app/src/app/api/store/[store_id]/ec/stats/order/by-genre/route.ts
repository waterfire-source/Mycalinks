// ジャンルごとのEC注文集計を取得する

import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import { ApiResponse, getEcOrderStatsByGenreApi } from 'api-generator';
import { customDayjs } from 'common';

export const GET = BackendAPI.create(
  getEcOrderStatsByGenreApi,
  async (API, { params, query }) => {
    let whereInput: Prisma.Sql = Prisma.sql``;

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
      }
    }

    const selectRes = await API.db.$queryRaw<
      ApiResponse<typeof getEcOrderStatsByGenreApi>['summaryByGenres']
    >`
    SELECT
      COALESCE(feop.genre_display_name, '未設定')                   AS genre_display_name,
      SUM(COALESCE(feop.wholesale_total_price, 0))                 AS total_wholesale_price,
      SUM(COALESCE(feop.total_unit_price, 0) * feop.item_count)    AS total_price,
      COUNT(DISTINCT feop.order_id)                                AS total_order_count,
      SUM(feop.item_count)                                         AS total_item_count
    FROM Fact_Ec_Order_Product AS feop
    WHERE feop.store_id = ${params.store_id}
    AND feop.genre_display_name != ''
    AND TRIM(feop.genre_display_name) != ''
    ${whereInput}
    GROUP BY feop.genre_id;
    `;

    const summaryByGenres = selectRes.map((res) => ({
      genre_display_name: res.genre_display_name,
      total_wholesale_price: Number(res.total_wholesale_price),
      total_price: Number(res.total_price),
      total_order_count: Number(res.total_order_count),
      total_item_count: Number(res.total_item_count),
    }));

    return {
      summaryByGenres,
    };
  },
);
