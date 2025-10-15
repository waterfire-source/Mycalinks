// ジャンルごとの在庫集計を取得する

import { BackendAPI } from '@/api/backendApi/main';
import { getProductStatsByGenreApi } from 'api-generator';
import { ApiError } from '@/api/backendApi/error/apiError';
import { customDayjs } from 'common';

export const GET = BackendAPI.create(
  getProductStatsByGenreApi,
  async (API, { params, query }) => {
    // 日付範囲を正規化（その日の開始〜終了）
    const startDate = customDayjs(query.dataDayGte)
      .utc()
      .startOf('day')
      .toDate();
    const endDate = customDayjs(query.dataDayLte).utc().endOf('day').toDate();

    // 期間内の最新日付を取得
    const latestDateRes = await API.db.fact_Daily_Product.aggregate({
      where: {
        store_id: Number(params.store_id),
        target_day: {
          gte: startDate,
          lte: endDate,
        },
      },
      _max: {
        target_day: true,
      },
    });

    console.log('latestDateRes: ', latestDateRes);
    if (!latestDateRes._max.target_day) {
      throw new ApiError({
        status: 404,
        messageText: '指定された期間にはデータが存在しません',
      });
    }

    const selectRes = await API.db.fact_Daily_Product.groupBy({
      by: ['genre_id', 'genre_display_name'],
      where: {
        store_id: Number(params.store_id),
        target_day: latestDateRes._max.target_day,
        genre_display_name: {
          not: {
            in: [''],
          },
        },
      },
      _sum: {
        total_wholesale_price: true,
        total_sale_price: true,
        stock_number: true,
      },
    });

    // genre_idでorder_numberを取得してソート
    const genreIds = selectRes
      .map((res) => res.genre_id)
      .filter((id): id is number => id !== null);
    const genres = await API.db.item_Genre.findMany({
      where: { id: { in: genreIds } },
      select: { id: true, order_number: true },
    });

    const orderMap = new Map(
      genres.map((genre) => [genre.id, genre.order_number || 999]),
    );

    const summaryByGenres = selectRes
      .map((res) => ({
        genre_display_name: res.genre_display_name,
        total_wholesale_price: Number(res._sum.total_wholesale_price || 0),
        total_sale_price: Number(res._sum.total_sale_price || 0),
        total_stock_number: Number(res._sum.stock_number || 0),
        _order_number: res.genre_id ? orderMap.get(res.genre_id) || 999 : 999,
      }))
      .sort((a, b) => a._order_number - b._order_number)
      .map(({ _order_number, ...rest }) => rest);

    return {
      summaryByGenres,
    };
  },
);
