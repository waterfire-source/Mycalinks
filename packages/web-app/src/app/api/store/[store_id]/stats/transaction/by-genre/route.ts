// ジャンルごとの取引集計を取得する

import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import { ApiResponse, getTransactionStatsByGenreApi } from 'api-generator';
import { customDayjs } from 'common';

export const GET = BackendAPI.create(
  getTransactionStatsByGenreApi,
  async (API, { params, query }) => {
    let whereInput: Prisma.Sql = Prisma.sql``;

    // クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'kind': {
          whereInput = Prisma.sql`${whereInput} AND ftp.transaction_kind = ${value}`;
          break;
        }

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
      ApiResponse<typeof getTransactionStatsByGenreApi>['summaryByGenres']
    >`
    SELECT
      COALESCE(ftp.genre_display_name, '未設定')                    AS genre_display_name,
      SUM(COALESCE(ftp.wholesale_total_price, 0))                  AS total_wholesale_price,
      SUM(COALESCE(ftp.total_unit_price, 0) * ftp.item_count)      AS total_price,
      COUNT(DISTINCT CASE WHEN ftp.is_return = false THEN ftp.transaction_id END) -
      COUNT(DISTINCT CASE WHEN ftp.is_return = true THEN ftp.transaction_id END) AS total_count,
      SUM(ftp.item_count)                                          AS total_item_count
    FROM Fact_Transaction_Product AS ftp
    WHERE ftp.store_id = ${params.store_id}
    AND ftp.genre_display_name != ''
    AND TRIM(ftp.genre_display_name) != ''
    ${whereInput}
    GROUP BY ftp.genre_id;
    `;

    console.log(selectRes);

    const summaryByGenres = selectRes.map((res) => ({
      genre_display_name: res.genre_display_name,
      total_wholesale_price: Number(res.total_wholesale_price),
      total_price: Number(res.total_price),
      total_count: Number(res.total_count),
      total_item_count: Number(res.total_item_count),
    }));

    return {
      summaryByGenres,
    };
  },
);
