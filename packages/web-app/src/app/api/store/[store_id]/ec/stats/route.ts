import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import { ApiResponse, getEcStatsApi } from 'api-generator';

// EC分析のトップで使うまとめのやつ
// EC注文の集計を期間別に取得

export const GET = BackendAPI.create(
  getEcStatsApi,
  async (API, { params, query }) => {
    let targetKind: typeof query.periodKind = 'day';

    // orderByのデフォルト値設定
    if (!query.orderBy) {
      query.orderBy = '-start_day';
    }

    // クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'periodKind':
          targetKind = value as typeof query.periodKind;
          break;
      }
    }

    const periodQuery = {
      month: Prisma.raw(`DATE_FORMAT(all_days.target_day, '%Y-%m')`),
      week: Prisma.raw(`YEARWEEK(all_days.target_day, 3)`),
      day: Prisma.raw(`DATE_FORMAT(all_days.target_day, '%Y-%m-%d')`),
    };

    const startDayQuery = {
      month: Prisma.raw(
        `STR_TO_DATE(CONCAT(${periodQuery.month.statement}, '-01'), '%Y-%m-%d')`,
      ),
      week: Prisma.raw(
        `DATE_SUB(all_days.target_day, INTERVAL (WEEKDAY(all_days.target_day)) DAY)`,
      ),
      day: Prisma.raw(`STR_TO_DATE(${periodQuery.day.statement}, '%Y-%m-%d')`),
    };

    const endDayQuery = {
      month: Prisma.raw(
        `LAST_DAY(CONCAT(${periodQuery.month.statement}, '-01'))`,
      ),
      week: Prisma.raw(
        `DATE_ADD(all_days.target_day, INTERVAL (6 - WEEKDAY(all_days.target_day)) DAY)`,
      ),
      day: Prisma.raw(`STR_TO_DATE(${periodQuery.day.statement}, '%Y-%m-%d')`),
    };

    const res = await API.db.$queryRaw<
      ApiResponse<typeof getEcStatsApi>['data']
    >`
    SELECT
      all_days.store_id,
      ${periodQuery[targetKind]} AS period,
      SUM(COALESCE(ec.price, 0)) AS total_sales,
      SUM(COALESCE(ec.price, 0) - COALESCE(ec.shipping_fee, 0)) AS product_sales,
      SUM(COALESCE(ec.shipping_fee, 0)) AS shipping_fee_total,
      SUM(COALESCE(ec.completed_count, 0)) AS confirmed_order_count,
      ${startDayQuery[targetKind]} AS start_day,
      ${endDayQuery[targetKind]} AS end_day,
      COUNT(all_days.target_day) AS data_day_count
    FROM (
      SELECT DISTINCT store_id, target_day FROM Summary_Daily_Ec_Order
    ) AS all_days
    LEFT JOIN Summary_Daily_Ec_Order ec
      ON ec.store_id = all_days.store_id AND ec.target_day = all_days.target_day
    WHERE all_days.store_id = ${params.store_id}

    GROUP BY period
    ${API.orderByQueryRaw}
    ${API.limitQueryRaw}
    `;

    const summary = await API.db.$queryRaw<
      Array<{
        total_count: number;
      }>
    >`
    WITH main_query AS (
      SELECT
        ${periodQuery[targetKind]} AS period
      FROM Summary_Daily_Ec_Order all_days
      WHERE all_days.store_id = ${params.store_id}
      GROUP BY period
    )
    SELECT COUNT(*) AS total_count FROM main_query;
    `;

    const data = res.map((day) => ({
      start_day: day.start_day,
      end_day: day.end_day,
      total_sales: Number(day.total_sales),
      product_sales: Number(day.product_sales),
      shipping_fee_total: Number(day.shipping_fee_total),
      confirmed_order_count: Number(day.confirmed_order_count),
      data_day_count: Number(day.data_day_count),
    }));

    return {
      data,
      summary: {
        totalCount: Number(summary[0]?.total_count),
      },
    };
  },
);
