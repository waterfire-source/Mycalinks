// EC注文の集計詳細データを取得する

import { BackendAPI } from '@/api/backendApi/main';
import { getEcOrderStatsApi } from 'api-generator';
import { customDayjs } from 'common';

export const GET = BackendAPI.create(
  getEcOrderStatsApi,
  async (API, { params, query }) => {
    // ----------------------------------------
    // 集計クエリ（Summary_Daily_Ec_Order から集計）
    // ----------------------------------------
    const result = await API.db.summary_Daily_Ec_Order.aggregate({
      where: {
        target_day: {
          gte: customDayjs(query.dataDayGte).utc().startOf('day').toDate(),
          lte: customDayjs(query.dataDayLte).utc().endOf('day').toDate(),
        },
        store_id: params.store_id,
      },
      _sum: {
        price: true,
        shipping_fee: true,
        commission_price: true,
        wholesale_price: true,
        completed_count: true,
        canceled_count: true,
        change_count: true,
        cancel_price: true,
        change_price: true,
        item_count: true,
      },
      _min: { target_day: true },
      _max: { target_day: true },
    });

    const sum = result._sum;
    const get = (v: number | null | undefined) => v ?? 0;

    // ----------------------------------------
    // 共通値の取り出し
    // ----------------------------------------
    const price = get(sum.price);
    const shipping_fee = get(sum.shipping_fee);
    const commission_price = get(sum.commission_price);
    const wholesale_price = get(sum.wholesale_price);
    const completed_count = get(sum.completed_count);
    const canceled_count = get(sum.canceled_count);
    const change_count = get(sum.change_count);
    const item_count = get(sum.item_count);

    // ----------------------------------------
    // EC用計算項目
    // ----------------------------------------
    const net_sales = price;
    const product_sales = net_sales - shipping_fee;
    const actual_sales = net_sales - commission_price;
    const gross_profit = actual_sales - wholesale_price;
    const gross_rate = Math.round((gross_profit / actual_sales) * 100);
    const complete_unit_price = Math.round(product_sales / completed_count);
    const total_orders = completed_count + canceled_count;
    const cancel_rate =
      total_orders > 0
        ? Math.round(
            (canceled_count / (completed_count + canceled_count)) * 100,
          )
        : 0;
    const sales_unit_price = Math.round(product_sales / item_count);

    // ----------------------------------------
    // レスポンス構築
    // ----------------------------------------
    return {
      start_day: result._min.target_day
        ? new Date(result._min.target_day)
        : null,
      end_day: result._max.target_day ? new Date(result._max.target_day) : null,

      summary: {
        actual_sales, // 実売上
        net_sales, // 総売上
        product_sales, // 商品売上
        shipping_fee, // 送料合計
        mall_commission: commission_price, // Mall手数料
        wholesale_price, // 原価
        gross_profit, // 粗利益
        gross_rate, // 粗利率
        complete_unit_price, // 注文単価
        completed_count, // 確定注文数
        canceled_count, // キャンセル数
        cancel_rate, // キャンセル率
        sales_unit_price, // 1点単価
        sales_item_count: item_count, // 販売点数
        change_count, // 欠品報告回数
      },
    };
  },
);
