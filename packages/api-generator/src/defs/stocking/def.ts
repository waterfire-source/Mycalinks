import { StockingSchema, StoreSchema, SupplierSchema } from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk } from '@/generator/util';

extendZodWithOpenApi(z);

export const deleteStockingSupplierApi = {
  summary: '仕入れ先削除',
  description: '仕入れ先を削除する',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/stocking/supplier/{supplier_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      supplier_id: SupplierSchema.shape.id,
    }),
  },
  response: z.object({
    ok: z.literal('deleted'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const rollbackStockingApi = {
  summary: '入荷の取り消しを行う',
  description: '入荷の取り消しを行う',
  method: ApiMethod.POST,
  path: '/store/{store_id}/stocking/{stocking_id}/rollback',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      stocking_id: StockingSchema.shape.id,
    }),

    body: z.object({
      description: z.string().optional(),
    }),
  },
  process: `
  `,
  response: defOk('入荷をロールバックすることができました'),
  error: {} as const,
} satisfies BackendApiDef;

export const getStockingCsvApi = {
  summary: '入荷CSVダウンロード',
  description: '入荷のCSVをダウンロードする',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stocking/csv',
  privileges: { role: [apiRole.pos] },
  request: {
    params: z.object({ store_id: StoreSchema.shape.id }),
    query: z.object({
      gte: z.string().optional(),
      lte: z.string().optional(),
      status: z
        .enum(['NOT_YET', 'FINISHED', 'CANCELED', 'ROLLBACK'])
        .optional(),
    }),
  },
  process: ``,
  response: z.object({ fileUrl: z.string() }),
  error: {} as const,
} satisfies BackendApiDef;

export const listStockingApi = {
  summary: '入荷一覧取得',
  description:
    '条件を指定して入荷情報を取得する。includesSummary=trueを指定すると総件数も取得できる。',
  method: ApiMethod.GET,
  path: '/store/{store_id}/stocking',
  privileges: { role: [apiRole.pos] },
  request: {
    params: z.object({ store_id: StoreSchema.shape.id }),
    query: z.object({
      id: z.number().optional(),
      status: StockingSchema.shape.status.optional(),
      productName: z.string().optional().describe('商品名での絞り込み'),
      staff_account_id: StockingSchema.shape.staff_account_id
        .optional()
        .describe('担当者IDでの絞り込み'),
      gte: z.string().optional().describe('開始日（YYYY-MM-DD）'),
      lte: z.string().optional().describe('終了日（YYYY-MM-DD）'),
      skip: z.coerce.number().optional().describe('取得開始位置'),
      take: z.coerce.number().optional().describe('取得件数'),
      includesSummary: z
        .boolean()
        .optional()
        .describe('総件数取得フラグ（trueで有効）'),
    }),
  },
  process: ``,
  response: z.object({
    data: z
      .array(
        z.object({
          id: StockingSchema.shape.id,
          store_id: StockingSchema.shape.store_id,
          status: StockingSchema.shape.status,
          planned_date: z.string().describe('予定入荷日'),
          actual_date:
            StockingSchema.shape.actual_date.describe('実際の入荷日'),
          expected_sales:
            StockingSchema.shape.expected_sales.describe('見込み売上'),
          total_wholesale_price:
            StockingSchema.shape.total_wholesale_price.describe('合計仕入れ値'),
          total_item_count:
            StockingSchema.shape.total_item_count.describe('合計仕入れ量'),
          supplier_id: StockingSchema.shape.supplier_id,
          staff_account_id: StockingSchema.shape.staff_account_id,
          created_at: z.string().nullable(),
          store_name: z.string().describe('店舗名'),
          supplier_name: z.string().describe('仕入れ先名'),
          from_store_shipment_id: z.number().optional().describe('出荷元のID'),
          from_store_name: z.string().optional().describe('出荷元の店舗名'),
          stocking_products: z
            .array(
              z.object({
                id: z.number().describe('入荷商品の商品マスタのID'),
                product_id: z.number().describe('入荷商品の在庫ID'),
                planned_item_count: z.number().describe('予定仕入れ数'),
                actual_item_count: z
                  .number()
                  .nullable()
                  .describe('実際の仕入れ数'),
                unit_price: z.number().nullable().describe('税込単価'),
                unit_price_without_tax: z
                  .number()
                  .nullable()
                  .describe('税抜単価'),
                image_url: z.string().nullable().describe('商品画像URL'),
                actual_sell_price: z
                  .number()
                  .nullable()
                  .describe('実際の販売価格'),
                product__displayNameWithMeta: z
                  .string()
                  .describe('商品名（メタデータ込み）'),
                product__condition_option__display_name: z
                  .string()
                  .describe('商品の状態'),
              }),
            )
            .describe('入荷商品一覧'),
        }),
      )
      .describe('入荷データ一覧'),
    totalCount: z
      .number()
      .optional()
      .describe('総件数（includesSummary=trueの場合のみ）'),
  }),
  error: {} as const,
} satisfies BackendApiDef;
