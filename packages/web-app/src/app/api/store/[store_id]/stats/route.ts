import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import { ApiResponse, getStatsApi } from 'api-generator';

//売り上げ分析のトップで使うまとめのやつ
// 取引の集計や在庫の集計などを合計値だけ取得してくる

export const GET = BackendAPI.create(
  getStatsApi,
  async (API, { params, query }) => {
    // const whereInput: Prisma.Sql = Prisma.sql``;

    let targetKind: typeof query.periodKind = 'day';

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

    const res = await API.db.$queryRaw<ApiResponse<typeof getStatsApi>['data']>`
    WITH Summary_Daily_Sell_Transaction AS (
      SELECT * FROM Summary_Daily_Transaction WHERE kind = 'SELL'
    ),
    Summary_Daily_Buy_Transaction AS (
      SELECT * FROM Summary_Daily_Transaction WHERE kind = 'BUY'
    ),
    -- 期間ごとに一番最後の日のSummary_Daily_Productだけを抽出
    Last_Summary_Daily_Product AS (
      SELECT p.*
      FROM Summary_Daily_Product p
      INNER JOIN (
        SELECT
          store_id,
          ${periodQuery[targetKind]} AS period,
          MAX(target_day) AS latest_day
        FROM Summary_Daily_Product all_days
        WHERE all_days.store_id = ${params.store_id}
        GROUP BY all_days.store_id, period
      ) latest
        ON p.store_id = latest.store_id
        AND p.target_day = latest.latest_day
      WHERE p.store_id = ${params.store_id}
    )
    SELECT
      all_days.store_id,
      ${periodQuery[targetKind]} AS period,
      SUM(COALESCE(s.price, 0) - COALESCE(s.return_price, 0)) AS sell_total_price,
      SUM(COALESCE(b.price, 0) - COALESCE(b.return_price, 0)) AS buy_total_price,
      SUM(COALESCE(p.total_wholesale_price, 0)) AS total_wholesale_price,
      SUM(COALESCE(s.count, 0)) + SUM(COALESCE(b.count, 0)) AS total_count,
      ${startDayQuery[targetKind]} AS start_day,
      ${endDayQuery[targetKind]} AS end_day,
      COUNT(all_days.target_day) AS data_day_count
    FROM (
      SELECT DISTINCT store_id, target_day FROM Summary_Daily_Sell_Transaction
      UNION
      SELECT DISTINCT store_id, target_day FROM Summary_Daily_Buy_Transaction
      UNION
      SELECT DISTINCT store_id, target_day FROM Summary_Daily_Product
    ) AS all_days
    LEFT JOIN Summary_Daily_Sell_Transaction s
      ON s.store_id = all_days.store_id AND s.target_day = all_days.target_day
    LEFT JOIN Summary_Daily_Buy_Transaction b
      ON b.store_id = all_days.store_id AND b.target_day = all_days.target_day
    LEFT JOIN Last_Summary_Daily_Product p
      ON p.store_id = all_days.store_id AND p.target_day = all_days.target_day
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
      FROM (
        SELECT DISTINCT store_id, target_day FROM Summary_Daily_Transaction
        UNION
        SELECT DISTINCT store_id, target_day FROM Summary_Daily_Product
      ) AS all_days
      WHERE all_days.store_id = ${params.store_id}
      GROUP BY period
    )
    SELECT COUNT(*) AS total_count FROM main_query;
    `;

    const data = res.map((day) => ({
      start_day: day.start_day,
      end_day: day.end_day,
      sell_total_price: Number(day.sell_total_price),
      buy_total_price: Number(day.buy_total_price),
      total_wholesale_price: Number(day.total_wholesale_price),
      total_count: Number(day.total_count),
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
