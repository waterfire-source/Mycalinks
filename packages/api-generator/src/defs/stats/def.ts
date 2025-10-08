import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ApiMethod, apiRole, BackendApiDef } from '@/types/main';
import {
  Fact_Daily_ProductSchema,
  Fact_Ec_Order_ProductSchema,
  StoreSchema,
  Summary_Daily_ProductSchema,
  Summary_Daily_TransactionSchema,
  Summary_Daily_Ec_OrderSchema,
} from 'backend-core';
import { defOk, defOrderBy, defPagination } from '@/generator/util';
extendZodWithOpenApi(z);

export const getStatsApi = {
  summary: '取引の集計や在庫の集計などを合計値だけ取得してくる',
  description: '取引の集計や在庫の集計などを合計値だけ取得してくる',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      periodKind: z.enum(['day', 'month', 'week']).describe('集計期間の種類'),
      ...defPagination(),
      ...defOrderBy({
        start_day: '対象日',
        sell_total_price: '販売合計',
        buy_total_price: '買取合計',
        total_wholesale_price: '在庫総額（仕入れ値）',
        total_count: '総客数/取引件数',
      }),
    }),
  },
  process: `

  `,
  response: z.object({
    data: z.array(
      z.object({
        start_day: z.date().describe('対象開始日'),
        end_day: z.date().describe('対象終了日'),
        sell_total_price: Summary_Daily_TransactionSchema.shape.price,
        buy_total_price: Summary_Daily_TransactionSchema.shape.price,
        total_wholesale_price:
          Summary_Daily_TransactionSchema.shape.wholesale_price,
        total_count: Summary_Daily_TransactionSchema.shape.count,
        data_day_count: z.number().describe('データの日数'),
      }),
    ),
    summary: z.object({
      totalCount: z.number().describe('合計数'),
    }),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getTransactionStatsApi = {
  summary: '取引の集計詳細データを取得する',
  description: '取引の集計詳細データを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/transaction',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      kind: Summary_Daily_TransactionSchema.shape.kind,
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    start_day: z
      .date()
      .nullable()
      .describe('対象開始日 nullだったらデータが存在しなかったことになる'),

    end_day: z
      .date()
      .nullable()
      .describe('対象終了日 nullだったらデータが存在しなかったことになる'),

    summary: z
      .object({
        sell: z.object({
          pure_sales: z
            .number()
            .describe(
              '純売上（price - total_discount_price - return_price - used_point）',
            ),
          total_sales: z
            .number()
            .describe(
              '総売上（price + total_discount_price + product_total_discount_price + return_price + used_point）',
            ),
          total_discount_price:
            Summary_Daily_TransactionSchema.shape.total_discount_price,
          discount_price: Summary_Daily_TransactionSchema.shape.discount_price,
          set_deal_discount_price:
            Summary_Daily_TransactionSchema.shape.set_deal_discount_price,
          product_total_discount_price:
            Summary_Daily_TransactionSchema.shape.product_total_discount_price,
          product_discount_price:
            Summary_Daily_TransactionSchema.shape.product_discount_price,
          sale_discount_price:
            Summary_Daily_TransactionSchema.shape.sale_discount_price,
          return_price: Summary_Daily_TransactionSchema.shape.return_price,
          used_point: Summary_Daily_TransactionSchema.shape.used_point,
          wholesale_price:
            Summary_Daily_TransactionSchema.shape.wholesale_price,
          loss_wholesale_price:
            Summary_Daily_TransactionSchema.shape.loss_wholesale_price,
          gross_profit: z.number().describe('粗利益（純売上 - 原価）'),
          gross_profit_rate: z.number().describe('粗利率（%）'),
          avg_spend_per_customer: z
            .number()
            .describe('客単価（純売上 / count）'),
          count: Summary_Daily_TransactionSchema.shape.count,
          avg_price_per_item: z
            .number()
            .describe('1点単価（純売上 / item_count）'),
          item_count: Summary_Daily_TransactionSchema.shape.item_count,
          return_count: Summary_Daily_TransactionSchema.shape.return_count,
          given_point: Summary_Daily_TransactionSchema.shape.given_point,
        }),

        buy: z.object({
          price: Summary_Daily_TransactionSchema.shape.price,
          buy_assessed_price:
            Summary_Daily_TransactionSchema.shape.buy_assessed_price,
          cancel_price: z
            .number()
            .describe(
              'キャンセル額（price - buy_assessed_price - total_discount_price）',
            ),
          total_discount_price:
            Summary_Daily_TransactionSchema.shape.total_discount_price,
          product_total_discount_price:
            Summary_Daily_TransactionSchema.shape.product_total_discount_price,
          product_discount_price:
            Summary_Daily_TransactionSchema.shape.product_discount_price,
          sale_discount_price:
            Summary_Daily_TransactionSchema.shape.sale_discount_price,
          return_price: Summary_Daily_TransactionSchema.shape.return_price,
          avg_spend_per_customer: z
            .number()
            .describe('客単価（price / count）'),
          count: Summary_Daily_TransactionSchema.shape.count,
          avg_price_per_item: z
            .number()
            .describe('1点単価（price / item_count）'),
          item_count: Summary_Daily_TransactionSchema.shape.item_count,
          return_count: Summary_Daily_TransactionSchema.shape.return_count,
          given_point: Summary_Daily_TransactionSchema.shape.given_point,
        }),
      })
      .describe('集計データ（kind に応じて sell または buy を使用）'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getProductStatsApi = {
  summary: '在庫集計を取得',
  description: '在庫集計を取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/product',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    start_day: z
      .date()
      .describe('対象開始日 nullだったらデータが存在しなかったことになる')
      .nullable(),
    end_day: z
      .date()
      .describe('対象終了日 nullだったらデータが存在しなかったことになる')
      .nullable(),
    summary: z.object({
      total_sell_price: Summary_Daily_ProductSchema.shape.total_sell_price,
      total_wholesale_price:
        Summary_Daily_ProductSchema.shape.total_wholesale_price,
      total_stock_number: Summary_Daily_ProductSchema.shape.total_stock_number,
    }),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getTransactionStatsByGenreApi = {
  summary: 'ジャンルごとの取引集計を取得する',
  description: 'ジャンルごとの取引集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/transaction/by-genre',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      kind: Summary_Daily_TransactionSchema.shape.kind,
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryByGenres: z.array(
      z.object({
        genre_display_name: Fact_Daily_ProductSchema.shape.genre_display_name,
        total_wholesale_price: z.number().describe('原価（仕入れ値の合計）'),
        total_price: z
          .number()
          .describe('このジャンルの商品の 販売/買取額の合計'),
        total_count: z
          .number()
          .describe('このジャンルを含む 販売/買取件数の合計'),
        total_item_count: z.number().describe('このジャンルを含む 商品の総数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getTransactionStatsByConditionApi = {
  summary: '状態ごとの取引集計を取得する',
  description: '状態ごとの取引集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/transaction/by-condition',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      kind: Summary_Daily_TransactionSchema.shape.kind,
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryByConditions: z.array(
      z.object({
        condition_display_name: z.string().describe('状態表示名'),
        total_wholesale_price: z.number().describe('原価（仕入れ値の合計）'),
        total_price: z.number().describe('この状態の商品の 販売/買取額の合計'),
        total_count: z.number().describe('この状態を含む 販売/買取件数の合計'),
        total_item_count: z.number().describe('この状態を含む 商品の総数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getTransactionStatsBySpecialtyApi = {
  summary: '特殊状態ごとの取引集計を取得する',
  description: '特殊状態ごとの取引集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/transaction/by-specialty',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      kind: Summary_Daily_TransactionSchema.shape.kind,
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryBySpecialties: z.array(
      z.object({
        specialty_display_name: z.string().describe('特殊状態表示名'),
        total_wholesale_price: z.number().describe('原価（仕入れ値の合計）'),
        total_price: z
          .number()
          .describe('この特殊状態の商品の 販売/買取額の合計'),
        total_count: z
          .number()
          .describe('この特殊状態を含む 販売/買取件数の合計'),
        total_item_count: z.number().describe('この特殊状態を含む 商品の総数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getTransactionStatsByCategoryApi = {
  summary: 'カテゴリごとの取引集計を取得する',
  description: 'カテゴリごとの取引集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/transaction/by-category',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      kind: Summary_Daily_TransactionSchema.shape.kind,
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryByCategories: z.array(
      z.object({
        category_display_name: z.string().describe('カテゴリ表示名'),
        total_wholesale_price: z.number().describe('原価（仕入れ値の合計）'),
        total_price: z
          .number()
          .describe('このカテゴリの商品の 販売/買取額の合計'),
        total_count: z
          .number()
          .describe('このカテゴリを含む 販売/買取件数の合計'),
        total_item_count: z.number().describe('このカテゴリを含む 商品の総数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getProductStatsByGenreApi = {
  summary: 'ジャンルごとの在庫集計を取得する',
  description: 'ジャンルごとの在庫集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/product/by-genre',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryByGenres: z.array(
      z.object({
        genre_display_name: Fact_Daily_ProductSchema.shape.genre_display_name,
        total_wholesale_price: z.number().describe('在庫総額'),
        total_sale_price: z.number().describe('売価高'),
        total_stock_number: z.number().describe('在庫数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getProductStatsByConditionApi = {
  summary: '状態ごとの在庫集計を取得する',
  description: '状態ごとの在庫集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/product/by-condition',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryByConditions: z.array(
      z.object({
        condition_display_name: z.string().describe('状態表示名'),
        total_wholesale_price: z.number().describe('在庫総額'),
        total_sale_price: z.number().describe('売価高'),
        total_stock_number: z.number().describe('在庫数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getProductStatsBySpecialtyApi = {
  summary: '特殊状態ごとの在庫集計を取得する',
  description: '特殊状態ごとの在庫集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/product/by-specialty',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryBySpecialties: z.array(
      z.object({
        specialty_display_name: z.string().describe('特殊状態表示名'),
        total_wholesale_price: z.number().describe('在庫総額'),
        total_sale_price: z.number().describe('売価高'),
        total_stock_number: z.number().describe('在庫数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getProductStatsByCategoryApi = {
  summary: 'カテゴリごとの在庫集計を取得する',
  description: 'カテゴリごとの在庫集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/product/by-category',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryByCategories: z.array(
      z.object({
        category_display_name: z.string().describe('カテゴリ表示名'),
        total_wholesale_price: z.number().describe('在庫総額'),
        total_sale_price: z.number().describe('売価高'),
        total_stock_number: z.number().describe('在庫数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getTransactionStatsCsvApi = {
  summary: '過去の取引の詳細をCSVで取得する（古物台帳）',
  description: '過去の取引の詳細をCSVで取得する（古物台帳）',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/transaction/csv',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      target_day_gte: z.date().describe('対象日がこの日以降（この日を含める）'),
      target_day_lte: z.date().describe('対象日がこの日以前（この日を含める）'),
    }),
  },
  process: `

  `,
  response: z.object({
    fileUrl: z.string().describe('CSVファイルのURL'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getTransactionStatsProductCsvApi = {
  summary: '売上分析の取引カートのCSV取得',
  description: '売上分析の取引カートのCSV取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/transaction/product/csv',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      target_day_gte: z.date().describe('対象日がこの日以降（この日を含める）'),
      target_day_lte: z.date().describe('対象日がこの日以前（この日を含める）'),
      category_id: z.number().optional(),
      genre_id: z.number().optional(),
    }),
  },
  process: `

  `,
  response: z.object({
    fileUrl: z.string().describe('CSVファイルのURL'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getStatsCsvApi = {
  summary: '売上分析データのCSVを取得',
  description:
    '販売・買取・在庫データを統合して日別・週別・月別でCSV形式で取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stats/csv',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      group_by: z
        .enum(['day', 'week', 'month'])
        .describe('集計単位（日別・週別・月別）'),
      target_day_gte: z
        .date()
        .optional()
        .describe('対象期間開始日（省略時は全期間）'),
      target_day_lte: z
        .date()
        .optional()
        .describe('対象期間終了日（省略時は全期間）'),
    }),
  },
  process: `

  `,
  response: z.object({
    fileUrl: z.string().describe('CSVファイルのURL'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcOrderStatsApi = {
  summary: 'EC注文の集計詳細データを取得する',
  description: 'EC注文の集計詳細データを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/stats/order',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      dataDayGte: z.string().describe('データの日付がこの日以降'),
      dataDayLte: z.string().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    start_day: z
      .date()
      .nullable()
      .describe('対象開始日 nullだったらデータが存在しなかったことになる'),

    end_day: z
      .date()
      .nullable()
      .describe('対象終了日 nullだったらデータが存在しなかったことになる'),

    summary: z.object({
      actual_sales: z.number().describe('実売上'),
      net_sales: z.number().describe('総売上'),
      product_sales: z.number().describe('商品売上'),
      shipping_fee: z.number().describe('送料合計'),
      mall_commission: z.number().describe('Mall手数料'),
      wholesale_price: z.number().describe('原価'),
      gross_profit: z.number().describe('粗利益'),
      gross_rate: z.number().describe('粗利率'),
      complete_unit_price: z.number().describe('注文単価'),
      completed_count: z.number().describe('確定注文数'),
      canceled_count: z.number().describe('キャンセル数'),
      cancel_rate: z.number().describe('キャンセル率'),
      sales_unit_price: z.number().describe('1点単価'),
      sales_item_count: z.number().describe('販売点数'),
      change_count: z.number().describe('欠品報告回数'),
    }),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcOrderStatsByGenreApi = {
  summary: 'ジャンルごとのEC注文集計を取得する',
  description: 'ジャンルごとのEC注文集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/stats/order/by-genre',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryByGenres: z.array(
      z.object({
        genre_display_name:
          Fact_Ec_Order_ProductSchema.shape.genre_display_name,
        total_wholesale_price: z.number().describe('原価（仕入れ値の合計）'),
        total_price: z.number().describe('このジャンルの商品のEC注文総額'),
        total_order_count: z
          .number()
          .describe('このジャンルを含む注文件数の合計'),
        total_item_count: z.number().describe('このジャンルを含む 商品の総数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcOrderStatsByCategoryApi = {
  summary: 'カテゴリごとのEC注文集計を取得する',
  description: 'カテゴリごとのEC注文集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/stats/order/by-category',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryByCategories: z.array(
      z.object({
        category_display_name: z.string().describe('カテゴリ表示名'),
        total_wholesale_price: z.number().describe('原価（仕入れ値の合計）'),
        total_price: z.number().describe('このカテゴリの商品のEC注文総額'),
        total_order_count: z
          .number()
          .describe('このカテゴリを含む注文件数の合計'),
        total_item_count: z.number().describe('このカテゴリを含む 商品の総数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcOrderStatsByConditionApi = {
  summary: '状態ごとのEC注文集計を取得する',
  description: '状態ごとのEC注文集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/stats/order/by-condition',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryByConditions: z.array(
      z.object({
        condition_display_name: z.string().describe('状態表示名'),
        total_wholesale_price: z.number().describe('原価（仕入れ値の合計）'),
        total_price: z.number().describe('この状態の商品のEC注文総額'),
        total_order_count: z.number().describe('この状態を含む注文件数の合計'),
        total_item_count: z.number().describe('この状態を含む 商品の総数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcOrderStatsBySpecialtyApi = {
  summary: '特殊状態ごとのEC注文集計を取得する',
  description: '特殊状態ごとのEC注文集計を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/stats/order/by-specialty',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
    }),
  },
  process: `

  `,
  response: z.object({
    summaryBySpecialties: z.array(
      z.object({
        specialty_display_name: z.string().describe('特殊状態表示名'),
        total_wholesale_price: z.number().describe('原価（仕入れ値の合計）'),
        total_price: z.number().describe('この特殊状態の商品のEC注文総額'),
        total_order_count: z
          .number()
          .describe('この特殊状態を含む注文件数の合計'),
        total_item_count: z.number().describe('この特殊状態を含む 商品の総数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcOrderStatsProductApi = {
  summary: 'EC注文の商品別集計を取得する',
  description: 'EC注文の商品別詳細データを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/stats/order/product',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      dataDayGte: z.date().describe('データの日付がこの日以降'),
      dataDayLte: z.date().describe('データの日付がこの日以前'),
      ...defPagination(),
      ...defOrderBy({
        product_display_name: '商品名',
        total_price: '注文総額',
        total_item_count: '注文数量',
        total_order_count: '注文件数',
        total_wholesale_price: '仕入れ値合計',
      }),
    }),
  },
  process: `

  `,
  response: z.object({
    data: z.array(
      z.object({
        product_id: z.number().describe('商品ID'),
        product_display_name: z.string().describe('商品名'),
        item_id: z.number().describe('商品マスタID'),
        category_display_name: z.string().describe('カテゴリ名'),
        genre_display_name: z.string().nullable().describe('ジャンル名'),
        condition_option_display_name: z.string().describe('状態名'),
        specialty_display_name: z.string().nullable().describe('特殊状態名'),
        total_wholesale_price: z.number().describe('仕入れ値合計'),
        total_price: z.number().describe('注文総額'),
        total_item_count: z.number().describe('注文数量'),
        total_order_count: z.number().describe('注文件数'),
        avg_unit_price: z.number().describe('平均単価'),
      }),
    ),
    summary: z.object({
      totalCount: z.number().describe('合計件数'),
    }),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcStatsApi = {
  summary: 'ECの集計や商品在庫の集計などを合計値だけ取得してくる',
  description: 'ECの集計や商品在庫の集計などを合計値だけ取得してくる',
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/stats',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      periodKind: z.enum(['day', 'month', 'week']).describe('集計期間の種類'),
      ...defPagination(),
      ...defOrderBy({
        start_day: '対象日',
        total_sales: 'EC注文合計',
        confirmed_order_count: '確定注文件数',
        product_sales: '商品売上',
        shipping_fee_total: '送料合計',
      }),
    }),
  },
  process: `

  `,
  response: z.object({
    data: z.array(
      z.object({
        start_day: z.date().describe('対象開始日'),
        end_day: z.date().describe('対象終了日'),
        total_sales: z.number().describe('EC注文合計'),
        confirmed_order_count: z.number().describe('確定注文件数'),
        product_sales: z.number().describe('商品売上'),
        shipping_fee_total: z.number().describe('送料合計'),
        data_day_count: z.number().describe('データの日数'),
      }),
    ),
    summary: z.object({
      totalCount: z.number().describe('合計数'),
    }),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const calculateTransactionStatsApi = {
  summary: '取引の集計を同期的に行う',
  description: '取引の集計を同期的に行う',
  method: ApiMethod.POST,
  path: '/store/{store_id}/stats/transaction/calculate',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
  },
  process: `

  `,
  response: defOk('集計が完了しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const calculateProductStatsApi = {
  summary: '在庫の集計を同期的に行う',
  description: '在庫の集計を同期的に行う',
  method: ApiMethod.POST,
  path: '/store/{store_id}/stats/product/calculate',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
  },
  process: `

  `,
  response: defOk('集計が完了しました'),
  error: {} as const,
} satisfies BackendApiDef;
