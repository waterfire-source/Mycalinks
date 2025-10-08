// 特殊状態ごとの在庫集計を取得する

import { BackendAPI } from '@/api/backendApi/main';
import { getProductStatsBySpecialtyApi } from 'api-generator';
import { ApiError } from '@/api/backendApi/error/apiError';
import { customDayjs } from 'common';

export const GET = BackendAPI.create(
  getProductStatsBySpecialtyApi,
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

    if (!latestDateRes._max.target_day) {
      throw new ApiError({
        status: 404,
        messageText: '指定された期間にはデータが存在しません',
      });
    }

    const selectRes = await API.db.fact_Daily_Product.groupBy({
      by: ['specialty_id', 'specialty_display_name'],
      where: {
        store_id: Number(params.store_id),
        target_day: latestDateRes._max.target_day,
      },
      _sum: {
        total_wholesale_price: true,
        total_sale_price: true,
        stock_number: true,
      },
    });

    // specialty_idでorder_numberを取得してソート
    const specialtyIds = selectRes
      .map((res) => res.specialty_id)
      .filter((id): id is number => id !== null); //特殊状態
    const specialties = await API.db.specialty.findMany({
      where: { id: { in: specialtyIds } },
      select: { id: true, order_number: true },
    });

    const orderMap = new Map(
      specialties.map((spec) => [spec.id, spec.order_number || 999]),
    );

    const summaryBySpecialties = selectRes
      .map((res) => ({
        specialty_display_name: res.specialty_display_name || '特殊状態なし',
        total_wholesale_price: Number(res._sum.total_wholesale_price || 0),
        total_sale_price: Number(res._sum.total_sale_price || 0),
        total_stock_number: Number(res._sum.stock_number || 0),
        _order_number: res.specialty_id
          ? orderMap.get(res.specialty_id) || 999
          : 999,
      }))
      .sort((a, b) => a._order_number - b._order_number)
      .map(({ _order_number, ...rest }) => rest);

    return {
      summaryBySpecialties,
    };
  },
);
