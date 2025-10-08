import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';

import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { customDayjs } from 'common';

export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;
    const { target_day_gte, target_day_lte, group_by } = API.query;

    if (!group_by || !['day', 'week', 'month'].includes(group_by)) {
      throw new ApiError({
        status: 400,
        messageText: 'group_byパラメータ（day/week/month）が必要です',
      });
    }

    // デフォルトで全期間対応
    const startDate = target_day_gte
      ? new Date(target_day_gte)
      : new Date('1900-01-01');
    const endDate = target_day_lte
      ? new Date(target_day_lte)
      : new Date('2100-12-31');

    let salesAnalytics;

    if (group_by === 'day') {
      salesAnalytics = await API.db.$queryRaw<
        {
          target_day: Date;
          kind: 'SELL' | 'BUY';
          price: number;
          count: number;
          return_price: number;
          return_count: number;
          item_count: number;
          given_point: number;
          used_point: number;
          sale_discount_price: number;
          discount_price: number;
          product_discount_price: number;
          product_total_discount_price: number;
          set_deal_discount_price: number;
          total_discount_price: number;
          wholesale_price: number;
          loss_wholesale_price: number;
          buy_assessed_price: number;
        }[]
      >`
      SELECT 
        target_day,
        kind,
        price,
        count,
        return_price,
        return_count,
        item_count,
        given_point,
        used_point,
        sale_discount_price,
        discount_price,
        product_discount_price,
        product_total_discount_price,
        set_deal_discount_price,
        total_discount_price,
        wholesale_price,
        loss_wholesale_price,
        buy_assessed_price
      FROM Summary_Daily_Transaction
      WHERE store_id = ${store_id}
        AND target_day >= ${startDate}
        AND target_day <= ${endDate}
      ORDER BY target_day DESC, kind
      `;
    } else if (group_by === 'week') {
      salesAnalytics = await API.db.$queryRaw<
        {
          target_day: Date;
          kind: 'SELL' | 'BUY';
          price: number;
          count: number;
          return_price: number;
          return_count: number;
          item_count: number;
          given_point: number;
          used_point: number;
          sale_discount_price: number;
          discount_price: number;
          product_discount_price: number;
          product_total_discount_price: number;
          set_deal_discount_price: number;
          total_discount_price: number;
          wholesale_price: number;
          loss_wholesale_price: number;
          buy_assessed_price: number;
        }[]
      >`
      SELECT 
        DATE_SUB(target_day, INTERVAL WEEKDAY(target_day) DAY) as target_day,
        kind,
        SUM(price) as price,
        SUM(count) as count,
        SUM(return_price) as return_price,
        SUM(return_count) as return_count,
        SUM(item_count) as item_count,
        SUM(given_point) as given_point,
        SUM(used_point) as used_point,
        SUM(sale_discount_price) as sale_discount_price,
        SUM(discount_price) as discount_price,
        SUM(product_discount_price) as product_discount_price,
        SUM(product_total_discount_price) as product_total_discount_price,
        SUM(set_deal_discount_price) as set_deal_discount_price,
        SUM(total_discount_price) as total_discount_price,
        SUM(wholesale_price) as wholesale_price,
        SUM(loss_wholesale_price) as loss_wholesale_price,
        SUM(buy_assessed_price) as buy_assessed_price
      FROM Summary_Daily_Transaction
      WHERE store_id = ${store_id}
        AND target_day >= ${startDate}
        AND target_day <= ${endDate}
      GROUP BY YEARWEEK(target_day, 3), kind
      ORDER BY target_day DESC, kind
      `;
    } else if (group_by === 'month') {
      salesAnalytics = await API.db.$queryRaw<
        {
          target_day: Date;
          kind: 'SELL' | 'BUY';
          price: number;
          count: number;
          return_price: number;
          return_count: number;
          item_count: number;
          given_point: number;
          used_point: number;
          sale_discount_price: number;
          discount_price: number;
          product_discount_price: number;
          product_total_discount_price: number;
          set_deal_discount_price: number;
          total_discount_price: number;
          wholesale_price: number;
          loss_wholesale_price: number;
          buy_assessed_price: number;
        }[]
      >`
      SELECT 
        DATE_FORMAT(target_day, '%Y-%m-01') as target_day,
        kind,
        SUM(price) as price,
        SUM(count) as count,
        SUM(return_price) as return_price,
        SUM(return_count) as return_count,
        SUM(item_count) as item_count,
        SUM(given_point) as given_point,
        SUM(used_point) as used_point,
        SUM(sale_discount_price) as sale_discount_price,
        SUM(discount_price) as discount_price,
        SUM(product_discount_price) as product_discount_price,
        SUM(product_total_discount_price) as product_total_discount_price,
        SUM(set_deal_discount_price) as set_deal_discount_price,
        SUM(total_discount_price) as total_discount_price,
        SUM(wholesale_price) as wholesale_price,
        SUM(loss_wholesale_price) as loss_wholesale_price,
        SUM(buy_assessed_price) as buy_assessed_price
      FROM Summary_Daily_Transaction
      WHERE store_id = ${store_id}
        AND target_day >= ${startDate}
        AND target_day <= ${endDate}
      GROUP BY YEAR(target_day), MONTH(target_day), kind
      ORDER BY target_day DESC, kind
      `;
    }

    if (!salesAnalytics)
      throw new ApiError({
        status: 404,
        messageText: '指定された期間にはデータが存在しません',
      });

    // 在庫関連データを取得（期間の最後の日のみ）
    let inventoryAnalytics;

    if (group_by === 'day') {
      inventoryAnalytics = await API.db.$queryRaw<
        {
          target_day: Date;
          total_wholesale_price: bigint;
          total_sell_price: bigint;
          total_stock_number: number;
        }[]
      >`
      SELECT 
        target_day,
        total_wholesale_price,
        total_sell_price,
        total_stock_number
      FROM Summary_Daily_Product
      WHERE store_id = ${store_id}
        AND target_day >= ${startDate}
        AND target_day <= ${endDate}
      ORDER BY target_day DESC
      `;
    } else if (group_by === 'week') {
      inventoryAnalytics = await API.db.$queryRaw<
        {
          target_day: Date;
          total_wholesale_price: bigint;
          total_sell_price: bigint;
          total_stock_number: number;
        }[]
      >`
      WITH Last_Summary_Daily_Product AS (
        SELECT p.*
        FROM Summary_Daily_Product p
        INNER JOIN (
          SELECT
            store_id,
            YEARWEEK(target_day, 3) AS period,
            MAX(target_day) AS latest_day
          FROM Summary_Daily_Product all_days
          WHERE all_days.store_id = ${store_id}
            AND target_day >= ${startDate}
            AND target_day <= ${endDate}
          GROUP BY all_days.store_id, period
        ) latest
          ON p.store_id = latest.store_id
          AND p.target_day = latest.latest_day
        WHERE p.store_id = ${store_id}
      )
      SELECT 
        DATE_SUB(target_day, INTERVAL WEEKDAY(target_day) DAY) as target_day,
        total_wholesale_price,
        total_sell_price,
        total_stock_number
      FROM Last_Summary_Daily_Product
      ORDER BY target_day DESC
      `;
    } else if (group_by === 'month') {
      inventoryAnalytics = await API.db.$queryRaw<
        {
          target_day: Date;
          total_wholesale_price: bigint;
          total_sell_price: bigint;
          total_stock_number: number;
        }[]
      >`
      WITH Last_Summary_Daily_Product AS (
        SELECT p.*
        FROM Summary_Daily_Product p
        INNER JOIN (
          SELECT
            store_id,
            YEAR(target_day) AS year_period,
            MONTH(target_day) AS month_period,
            MAX(target_day) AS latest_day
          FROM Summary_Daily_Product all_days
          WHERE all_days.store_id = ${store_id}
            AND target_day >= ${startDate}
            AND target_day <= ${endDate}
          GROUP BY all_days.store_id, year_period, month_period
        ) latest
          ON p.store_id = latest.store_id
          AND p.target_day = latest.latest_day
        WHERE p.store_id = ${store_id}
      )
      SELECT 
        DATE_FORMAT(target_day, '%Y-%m-01') as target_day,
        total_wholesale_price,
        total_sell_price,
        total_stock_number
      FROM Last_Summary_Daily_Product
      ORDER BY target_day DESC
      `;
    }

    const analyticsDataMap = new Map<string, any>();

    salesAnalytics.forEach((record) => {
      const dayjsDate = customDayjs(record.target_day);
      let dateKey: string;

      switch (group_by) {
        case 'day': {
          dateKey = dayjsDate.tz().format('YYYY/MM/DD');
          break;
        }
        case 'week': {
          // SQLで既に週の開始日が計算されているのでそのまま使用
          const weekStart = dayjsDate.format('YYYY/MM/DD');
          const weekEnd = dayjsDate.add(6, 'day').format('YYYY/MM/DD');
          dateKey = `${weekStart} - ${weekEnd}`;
          break;
        }
        case 'month': {
          dateKey = dayjsDate.format('YYYY/MM');
          break;
        }
        default:
          dateKey = dayjsDate.format('YYYY/MM/DD');
      }

      if (!analyticsDataMap.has(dateKey)) {
        analyticsDataMap.set(dateKey, {
          日付: dateKey,
          // 販売データの初期値
          純売上: 0,
          総売上: 0,
          全体割引合計: 0,
          手動全体割引額: 0,
          セット割引合計: 0,
          個別割引合計額: 0,
          手動個別割引額: 0,
          セール割引合計: 0,
          返品額: 0,
          使用ポイント: 0,
          原価: 0,
          売上原価: 0,
          ロス原価: 0,
          粗利益: 0,
          粗利率: 0,
          販売客単価: 0,
          販売客数: 0,
          販売1点単価: 0,
          販売点数: 0,
          販売返品取引数: 0,
          販売付与ポイント: 0,
          // 買取データの初期値
          買取合計: 0,
          査定額合計: 0,
          キャンセル額: 0,
          全体割増合計額: 0,
          個別割増合計額: 0,
          手動個別割増額: 0,
          セール割増額: 0,
          買取返品額: 0,
          買取客単価: 0,
          買取客数: 0,
          買取1点単価: 0,
          買取点数: 0,
          買取返品取引数: 0,
          買取付与ポイント: 0,
          // 在庫データの初期値
          総在庫金額: 0,
          売価高: 0,
          在庫点数: 0,
        });
      }

      const periodData = analyticsDataMap.get(dateKey);

      if (record.kind === 'SELL') {
        // 販売データの計算（数値に変換）
        const price = Number(record.price);
        const pureSales = Number(price - record.return_price);
        const totalDiscountPrice = Number(record.total_discount_price);
        const totalDiscountPriceWithOutUsedPoint =
          totalDiscountPrice + Number(record.used_point); //全体割引合計額には使用ポイントも含まれているので、引く
        const productTotalDiscountPrice = Number(
          record.product_total_discount_price,
        );
        const returnPrice = Number(record.return_price);
        const wholesalePrice = Number(record.wholesale_price);
        const lossWholesalePrice = Number(record.loss_wholesale_price);

        const grossSales =
          price + -totalDiscountPrice + -productTotalDiscountPrice;

        const grossProfit = pureSales - wholesalePrice;
        const totalCost = wholesalePrice + lossWholesalePrice;
        const grossProfitRate =
          price > 0 ? Math.round((grossProfit / pureSales) * 100) : 0;

        const actualCount = Number(record.count - record.return_count);
        const averagePerCustomer =
          Number(actualCount) > 0
            ? Math.round(pureSales / Number(actualCount))
            : 0;
        const averagePerItem =
          Number(record.item_count) > 0
            ? Math.round(pureSales / Number(record.item_count))
            : 0;

        Object.assign(periodData, {
          純売上: pureSales,
          総売上: grossSales,
          全体割引合計: totalDiscountPriceWithOutUsedPoint,
          手動全体割引額: Number(record.discount_price),
          セット割引合計: Number(record.set_deal_discount_price),
          個別割引合計額: productTotalDiscountPrice,
          手動個別割引額: Number(record.product_discount_price),
          セール割引合計: Number(record.sale_discount_price),
          返品額: returnPrice,
          使用ポイント: Number(record.used_point),
          原価: totalCost,
          売上原価: wholesalePrice,
          ロス原価: lossWholesalePrice,
          粗利益: grossProfit,
          粗利率: grossProfitRate,
          販売客単価: averagePerCustomer,
          販売客数: actualCount,
          販売1点単価: averagePerItem,
          販売点数: Number(record.item_count),
          販売返品取引数: Number(record.return_count),
          販売付与ポイント: Number(record.given_point),
        });
      } else if (record.kind === 'BUY') {
        // 買取データの計算（数値に変換）
        const buyPrice = Number(record.price);
        const pureBuyPrice = Number(record.price - record.return_price);
        const buyAssessedPrice = Number(record.buy_assessed_price);
        const buyTotalDiscountPrice = Number(record.total_discount_price);
        const buyProductTotalDiscountPrice = Number(
          record.product_total_discount_price,
        );

        const actualCount = Number(record.count - record.return_count);

        const rawCancelAmount = -(
          buyAssessedPrice -
          buyPrice +
          buyTotalDiscountPrice +
          buyProductTotalDiscountPrice
        );

        const cancelAmount = rawCancelAmount === 0 ? 0 : rawCancelAmount;

        const averagePerCustomer =
          actualCount > 0 ? Math.round(pureBuyPrice / actualCount) : 0;
        const averagePerItem =
          Number(record.item_count) > 0
            ? Math.round(pureBuyPrice / Number(record.item_count))
            : 0;

        Object.assign(periodData, {
          買取合計: pureBuyPrice,
          査定額合計: buyAssessedPrice,
          キャンセル額: cancelAmount,
          全体割増合計額: buyTotalDiscountPrice,
          個別割増合計額: buyProductTotalDiscountPrice,
          セール割増額: Number(record.sale_discount_price),
          手動個別割増額: Number(record.product_discount_price),
          買取返品額: Number(record.return_price),
          買取客単価: Math.round(averagePerCustomer),
          買取客数: actualCount,
          買取1点単価: Math.round(averagePerItem),
          買取点数: Number(record.item_count),
          買取返品取引数: Number(record.return_count),
          買取付与ポイント: Number(record.given_point),
        });
      }
    });

    // 在庫データを統合
    if (inventoryAnalytics) {
      inventoryAnalytics.forEach((record) => {
        const dayjsDate = customDayjs(record.target_day).tz();
        let dateKey: string;

        switch (group_by) {
          case 'day': {
            dateKey = dayjsDate.format('YYYY/MM/DD');
            break;
          }
          case 'week': {
            // SQLで既に週の開始日が計算されているのでそのまま使用
            const weekStart = dayjsDate.format('YYYY/MM/DD');
            const weekEnd = dayjsDate.add(6, 'day').format('YYYY/MM/DD');
            dateKey = `${weekStart} - ${weekEnd}`;
            break;
          }
          case 'month': {
            dateKey = dayjsDate.format('YYYY/MM');
            break;
          }
          default:
            dateKey = dayjsDate.format('YYYY/MM/DD');
        }

        if (analyticsDataMap.has(dateKey)) {
          const periodData = analyticsDataMap.get(dateKey);
          Object.assign(periodData, {
            総在庫金額: Number(record.total_wholesale_price),
            売価高: Number(record.total_sell_price),
            在庫点数: Number(record.total_stock_number),
          });
        }
      });
    }

    const analyticsData = Array.from(analyticsDataMap.values());

    const csvService = new BackendApiCsvService(API);
    const fileService = new BackendApiFileService(API);

    // group_byに応じたファイル名を生成
    const timestamp = customDayjs().format('YYYY-MM-DD_HH-mm-ss');
    let fileName: string;

    switch (group_by) {
      case 'day':
        fileName = `売上分析_日別_${timestamp}`;
        break;
      case 'week':
        fileName = `売上分析_週別_${timestamp}`;
        break;
      case 'month':
        fileName = `売上分析_月別_${timestamp}`;
        break;
      default:
        fileName = `売上分析_${group_by}_${timestamp}`;
    }

    const uploadRes = await fileService.uploadCsvToS3({
      dirKind: 'transaction',
      fileName,
      writer: async (passThrough) => {
        csvService.core.passThrough = passThrough;

        await csvService.core.maker(analyticsData);
      },
    });

    return API.status(200).response({ data: { fileUrl: uploadRes } });
  },
);
