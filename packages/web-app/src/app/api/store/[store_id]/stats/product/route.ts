// 在庫集計を取得

import { BackendAPI } from '@/api/backendApi/main';
import { getProductStatsApi } from 'api-generator';
import { customDayjs } from 'common';
import { ApiError } from '@/api/backendApi/error/apiError';

export const GET = BackendAPI.create(
  getProductStatsApi,
  //@ts-expect-error becuase of because of
  async (API, { params, query }) => {
    const targetEndDay = customDayjs(query.dataDayLte)
      .tz()
      .format('YYYY-MM-DD');
    const targetStartDay = customDayjs(query.dataDayGte)
      .tz()
      .format('YYYY-MM-DD');

    //有効なデータがある日を取得する
    const targetDayRes = await API.db.$queryRaw<{ target_day: string }[]>`
    SELECT MAX(target_day) AS target_day
    FROM Fact_Daily_Product
    WHERE store_id = ${params.store_id}
    AND target_day <= ${targetEndDay}
    AND target_day >= ${targetStartDay}
    `;


    const target_day = customDayjs(targetDayRes[0].target_day);

    if (!targetDayRes || !targetDayRes[0] || !target_day.isValid())
      throw new ApiError({
        status: 404,
        messageText: '指定された期間にはデータが存在しません',
      });

    // target_dayをUTC基準の同じ日付で検索
    const targetDateStart = customDayjs(target_day).utc().startOf('day').toDate();
    const targetDateEnd = customDayjs(target_day).utc().endOf('day').toDate();

    const selectRes = await API.db.summary_Daily_Product.aggregate({
      where: {
        target_day: {
          gte: targetDateStart,
          lte: targetDateEnd,
        },
        store_id: params.store_id,
      },
      _sum: {
        total_sell_price: true,
        total_wholesale_price: true,
        total_stock_number: true,
      },
      _min: {
        target_day: true,
      },
      _max: {
        target_day: true,
      },
    });


    const res = {
      start_day: selectRes._min.target_day
        ? new Date(selectRes._min.target_day!)
        : null,
      end_day: selectRes._max.target_day
        ? new Date(selectRes._max.target_day!)
        : null,
      summary: {
        total_sell_price: selectRes._sum.total_sell_price ?? 0,
        total_wholesale_price: selectRes._sum.total_wholesale_price ?? 0,
        total_stock_number: selectRes._sum.total_stock_number ?? 0,
      },
    };

    return res;
  },
);
