// 取引の集計詳細データを取得する

import { BackendAPI } from '@/api/backendApi/main';
import { getTransactionStatsApi } from 'api-generator';
import { customDayjs } from 'common';

export const GET = BackendAPI.create(
  getTransactionStatsApi,
  async (API, { params, query }) => {
    const kind = query.kind;

    // 日付範囲を正規化（その日の開始〜終了）
    const startDate = customDayjs(query.dataDayGte)
      .utc()
      .startOf('day')
      .toDate();
    const endDate = customDayjs(query.dataDayLte).utc().endOf('day').toDate();

    // ----------------------------------------
    // 集計クエリ（SELL/BUY共通フィールドを一括取得）
    // ----------------------------------------
    const result = await API.db.summary_Daily_Transaction.aggregate({
      where: {
        kind,
        target_day: {
          gte: startDate,
          lte: endDate,
        },
        store_id: params.store_id,
      },
      _sum: {
        price: true,
        buy_assessed_price: true,
        total_discount_price: true,
        discount_price: true,
        set_deal_discount_price: true,
        product_total_discount_price: true,
        product_discount_price: true,
        sale_discount_price: true,
        return_price: true,
        wholesale_price: true,
        used_point: true,
        count: true,
        item_count: true,
        return_count: true,
        given_point: true,
        loss_wholesale_price: true,
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
    const buy_assessed_price = get(sum.buy_assessed_price);
    const total_discount_price = get(sum.total_discount_price);
    const discount_price = get(sum.discount_price);
    const set_deal_discount_price = get(sum.set_deal_discount_price);
    const product_total_discount_price = get(sum.product_total_discount_price);
    const product_discount_price = get(sum.product_discount_price);
    const sale_discount_price = get(sum.sale_discount_price);
    const return_price = get(sum.return_price);
    const wholesale_price = get(sum.wholesale_price);
    const loss_wholesale_price = get(sum.loss_wholesale_price);
    const used_point = get(sum.used_point);
    const count = get(sum.count);
    const item_count = get(sum.item_count);
    const return_count = get(sum.return_count);
    const given_point = get(sum.given_point);

    // ----------------------------------------
    // SELL 用計算項目
    // ----------------------------------------
    const pure_sales = kind === 'SELL' ? price - return_price : 0;

    const total_sales =
      price + -total_discount_price + -product_total_discount_price;

    const actualCount = count - return_count;

    const gross_profit = pure_sales - wholesale_price;

    const gross_profit_rate = Math.round((gross_profit / pure_sales) * 100);
    // → 小数第一位までの % 表記

    const avg_spend_per_customer_sell =
      actualCount > 0 ? Math.round(pure_sales / actualCount) : 0;

    const avg_price_per_item_sell =
      item_count > 0 ? Math.round(pure_sales / item_count) : 0;

    const total_discount_price_without_used_point =
      total_discount_price + used_point;

    // ----------------------------------------
    // BUY 用計算項目
    // ----------------------------------------
    const pure_buy_price = kind === 'BUY' ? price - return_price : 0;

    const cancel_price =
      kind === 'BUY'
        ? -(
            buy_assessed_price -
            price +
            total_discount_price +
            product_total_discount_price
          )
        : 0;

    const avg_spend_per_customer_buy =
      actualCount > 0 ? Math.round(pure_buy_price / actualCount) : 0;

    const avg_price_per_item_buy =
      item_count > 0 ? Math.round(pure_buy_price / item_count) : 0;

    // ----------------------------------------
    // レスポンス構築（共通構造）
    // ----------------------------------------
    return {
      start_day: result._min.target_day
        ? new Date(result._min.target_day)
        : null,
      end_day: result._max.target_day ? new Date(result._max.target_day) : null,

      summary: {
        sell: {
          // 売上情報
          pure_sales,
          total_sales,

          // 全体割引
          total_discount_price: total_discount_price_without_used_point,
          discount_price,
          set_deal_discount_price,

          // 個別割引
          product_total_discount_price,
          product_discount_price,
          sale_discount_price,

          // 返品・ポイント
          return_price,
          used_point,

          // 原価・利益
          wholesale_price,
          loss_wholesale_price,
          gross_profit,
          gross_profit_rate,

          // 客単価・1点単価
          avg_spend_per_customer: avg_spend_per_customer_sell,
          count: actualCount,
          avg_price_per_item: avg_price_per_item_sell,
          item_count,

          // その他
          return_count,
          given_point,
        },

        buy: {
          // 買取情報
          price: pure_buy_price,
          buy_assessed_price,
          cancel_price,

          // 割増
          total_discount_price,
          product_total_discount_price,
          product_discount_price,
          sale_discount_price,

          // 返品
          return_price,

          // 客単価・1点単価
          avg_spend_per_customer: avg_spend_per_customer_buy,
          count: actualCount,
          avg_price_per_item: avg_price_per_item_buy,
          item_count,

          // その他
          return_count,
          given_point,
        },
      },
    };
  },
);
